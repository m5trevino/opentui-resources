import { SystemMetricsCollector } from './services/systemMetrics'
import { formatBytes, formatPercentage, formatTemperature } from './utils/formatters'
import { ansiColors } from './utils/colors'
import { SystemMetrics } from './types/metrics'

class LiveDashboard {
  private collector: SystemMetricsCollector
  private isRunning: boolean = false
  private updateInterval: number = 1000
  private frameCount: number = 0
  private startTime: number = Date.now()
  private lastMetrics: SystemMetrics | null = null

  constructor() {
    this.collector = new SystemMetricsCollector()
  }

  // Create a progress bar using ASCII characters with animation
  private createProgressBar(percentage: number, width: number = 20, animated: boolean = false): string {
    const filled = Math.round((percentage / 100) * width)
    const empty = width - filled
    
    let color = ansiColors.green
    if (percentage >= 90) color = ansiColors.red
    else if (percentage >= 70) color = ansiColors.yellow
    
    // Add subtle animation for active bars
    const fillChar = animated && percentage > 0 ? '█' : '█'
    const emptyChar = '░'
    
    return `${color}${fillChar.repeat(filled)}${ansiColors.reset}${emptyChar.repeat(empty)} ${formatPercentage(percentage)}`
  }

  // Create a simple box border with dynamic width
  private createBox(title: string, content: string[], width: number = 35): string[] {
    const lines: string[] = []
    const titleLine = `┌─ ${ansiColors.bright}${title}${ansiColors.reset} ${'─'.repeat(Math.max(0, width - title.length - 4))}┐`
    
    lines.push(titleLine)
    content.forEach(line => {
      const cleanLine = line.replace(/\x1b\[[0-9;]*m/g, '')
      const padding = Math.max(0, width - cleanLine.length - 2)
      lines.push(`│ ${line}${' '.repeat(padding)} │`)
    })
    lines.push(`└${'─'.repeat(width)}┘`)
    
    return lines
  }

  // Display animated header with live stats
  private displayHeader() {
    const timestamp = new Date().toLocaleTimeString()
    const uptime = Math.floor((Date.now() - this.startTime) / 1000)
    const fps = this.frameCount / Math.max(1, uptime)
    
    console.log()
    console.log(`${ansiColors.bright}${ansiColors.cyan}🖥️  Live System Monitor Dashboard${ansiColors.reset}`)
    console.log(`${ansiColors.dim}${timestamp} | MacBook Pro M3 Max | Uptime: ${uptime}s | FPS: ${fps.toFixed(1)}${ansiColors.reset}`)
    console.log('═'.repeat(85))
  }

  // Display CPU metrics with trend indicators
  private displayCPU(cpuData: any): string[] {
    const trend = this.getTrend('cpu', cpuData.overall)
    const content = [
      `Overall: ${this.createProgressBar(cpuData.overall, 20, true)} ${trend}`,
      `Cores: ${ansiColors.cyan}${cpuData.cores.length}${ansiColors.reset} (Performance + Efficiency)`,
      ''
    ]

    // Show top 6 most active cores with activity indicators
    const sortedCores = cpuData.cores
      .map((usage: number, index: number) => ({ index, usage }))
      .sort((a: any, b: any) => b.usage - a.usage)
      .slice(0, 6)

    sortedCores.forEach(({ index, usage }: any) => {
      const color = usage > 50 ? ansiColors.yellow : ansiColors.green
      const activity = usage > 30 ? '●' : usage > 10 ? '◐' : '○'
      content.push(`Core ${index.toString().padStart(2)}: ${color}${this.createProgressBar(usage, 12, usage > 20)}${ansiColors.reset} ${activity}`)
    })

    if (cpuData.temperature > 0) {
      content.push('')
      content.push(`Temp: ${this.getTempColor(cpuData.temperature)}${formatTemperature(cpuData.temperature)}${ansiColors.reset}`)
    }

    return this.createBox('CPU Usage', content, 45)
  }

  // Display Memory metrics with pressure indicators
  private displayMemory(memoryData: any): string[] {
    const usedPercentage = (memoryData.used / memoryData.total) * 100
    const trend = this.getTrend('memory', usedPercentage)
    
    const content = [
      `Used: ${ansiColors.cyan}${formatBytes(memoryData.used)}${ansiColors.reset} / ${formatBytes(memoryData.total)}`,
      `Usage: ${this.createProgressBar(usedPercentage, 20, true)} ${trend}`,
      `Available: ${ansiColors.green}${formatBytes(memoryData.available)}${ansiColors.reset}`,
      `Pressure: ${this.getPressureColor(memoryData.pressure)}${memoryData.pressure.toUpperCase()}${ansiColors.reset} ${this.getPressureIcon(memoryData.pressure)}`
    ]

    if (memoryData.swap.total > 0) {
      const swapPercentage = (memoryData.swap.used / memoryData.swap.total) * 100
      content.push('')
      content.push(`Swap: ${this.createProgressBar(swapPercentage, 15, swapPercentage > 0)}`)
      content.push(`${formatBytes(memoryData.swap.used)} / ${formatBytes(memoryData.swap.total)}`)
    }

    return this.createBox('Memory', content, 45)
  }

  // Display GPU metrics
  private displayGPU(gpuData: any): string[] {
    const content = [
      `Utilization: ${this.createProgressBar(gpuData.utilization, 20, gpuData.utilization > 0)}`,
    ]

    if (gpuData.memory.total > 0) {
      const memoryPercentage = (gpuData.memory.used / gpuData.memory.total) * 100
      content.push(`Memory: ${formatBytes(gpuData.memory.used)} / ${formatBytes(gpuData.memory.total)}`)
      content.push(`Memory Usage: ${this.createProgressBar(memoryPercentage, 15)}`)
    } else {
      content.push(`${ansiColors.dim}Memory info not available${ansiColors.reset}`)
    }

    if (gpuData.temperature > 0) {
      content.push(`Temperature: ${this.getTempColor(gpuData.temperature)}${formatTemperature(gpuData.temperature)}${ansiColors.reset}`)
    }

    return this.createBox('GPU (M3 Max)', content, 40)
  }

  // Display Network metrics with activity indicators
  private displayNetwork(networkData: any): string[] {
    const content: string[] = []
    
    if (networkData.interfaces.length > 0) {
      const mainInterface = networkData.interfaces[0]
      const uploadActivity = mainInterface.upload > 1024 ? '↑' : mainInterface.upload > 0 ? '▲' : '△'
      const downloadActivity = mainInterface.download > 1024 ? '↓' : mainInterface.download > 0 ? '▼' : '▽'
      
      content.push(`Interface: ${ansiColors.cyan}${mainInterface.name}${ansiColors.reset}`)
      content.push(`${uploadActivity} Upload: ${ansiColors.green}${formatBytes(mainInterface.upload)}/s${ansiColors.reset}`)
      content.push(`${downloadActivity} Download: ${ansiColors.blue}${formatBytes(mainInterface.download)}/s${ansiColors.reset}`)
      content.push('')
      content.push(`Total ↑: ${formatBytes(mainInterface.uploadTotal)}`)
      content.push(`Total ↓: ${formatBytes(mainInterface.downloadTotal)}`)
    } else {
      content.push(`${ansiColors.yellow}No interfaces detected${ansiColors.reset}`)
    }

    return this.createBox('Network I/O', content, 40)
  }

  // Display Disk metrics
  private displayDisk(diskData: any): string[] {
    const readActivity = diskData.read > 1024 * 1024 ? '●' : diskData.read > 0 ? '◐' : '○'
    const writeActivity = diskData.write > 1024 * 1024 ? '●' : diskData.write > 0 ? '◐' : '○'
    
    const content = [
      `Read: ${ansiColors.green}${formatBytes(diskData.read)}/s${ansiColors.reset} ${readActivity}`,
      `Write: ${ansiColors.blue}${formatBytes(diskData.write)}/s${ansiColors.reset} ${writeActivity}`,
      ''
    ]

    // Show main disk usage (filter out system volumes)
    const mainDisks = diskData.usage.filter((disk: any) => 
      disk.mount === '/' || disk.mount.includes('/System/Volumes/Data')
    ).slice(0, 3)

    if (mainDisks.length > 0) {
      content.push('Main Storage:')
      mainDisks.forEach((disk: any) => {
        const displayName = disk.mount === '/' ? 'System' : 'Data'
        const color = disk.percentage > 90 ? ansiColors.red : disk.percentage > 70 ? ansiColors.yellow : ansiColors.green
        content.push(`${displayName}: ${color}${formatPercentage(disk.percentage)}${ansiColors.reset}`)
      })
    }

    return this.createBox('Disk I/O', content, 40)
  }

  // Get trend indicator
  private getTrend(metric: string, currentValue: number): string {
    if (!this.lastMetrics) return ''
    
    let lastValue = 0
    switch (metric) {
      case 'cpu':
        lastValue = this.lastMetrics.cpu.overall
        break
      case 'memory':
        lastValue = (this.lastMetrics.memory.used / this.lastMetrics.memory.total) * 100
        break
    }
    
    const diff = currentValue - lastValue
    if (Math.abs(diff) < 1) return '─'
    return diff > 0 ? '↗' : '↘'
  }

  // Helper methods for colors and icons
  private getPressureColor(pressure: string): string {
    switch (pressure) {
      case 'high': return ansiColors.red
      case 'medium': return ansiColors.yellow
      case 'low': return ansiColors.green
      default: return ansiColors.reset
    }
  }

  private getPressureIcon(pressure: string): string {
    switch (pressure) {
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return '⚪'
    }
  }

  private getTempColor(temp: number): string {
    if (temp >= 80) return ansiColors.red
    if (temp >= 70) return ansiColors.yellow
    if (temp >= 60) return ansiColors.cyan
    return ansiColors.green
  }

  // Print boxes side by side
  private printBoxes(boxes: string[][], spacing: number = 2) {
    const maxLines = Math.max(...boxes.map(box => box.length))
    
    for (let i = 0; i < maxLines; i++) {
      const line = boxes.map(box => box[i] || ' '.repeat(45)).join(' '.repeat(spacing))
      console.log(line)
    }
  }

  // Main render method
  private async render() {
    try {
      const metrics = await this.collector.collectMetrics()
      
      // Clear screen and move cursor to top
      process.stdout.write('\x1b[2J\x1b[H')
      
      this.displayHeader()
      console.log()

      // First row: CPU and Memory
      const cpuBox = this.displayCPU(metrics.cpu)
      const memoryBox = this.displayMemory(metrics.memory)
      this.printBoxes([cpuBox, memoryBox])
      
      console.log()

      // Second row: GPU and Network
      const gpuBox = this.displayGPU(metrics.gpu)
      const networkBox = this.displayNetwork(metrics.network)
      this.printBoxes([gpuBox, networkBox])

      console.log()

      // Third row: Disk (centered)
      const diskBox = this.displayDisk(metrics.disk)
      diskBox.forEach(line => console.log('  ' + line))

      console.log()
      console.log('═'.repeat(85))
      console.log(`${ansiColors.dim}Press Ctrl+C to exit | Live updates every ${this.updateInterval}ms | Frame: ${this.frameCount}${ansiColors.reset}`)
      console.log()

      // Store metrics for trend calculation
      this.lastMetrics = metrics
      this.frameCount++

    } catch (error) {
      console.error(`${ansiColors.red}Error collecting metrics:${ansiColors.reset}`, error)
    }
  }

  // Setup graceful shutdown
  private setupShutdown() {
    const shutdown = () => {
      this.isRunning = false
      process.stdout.write('\x1b[2J\x1b[H') // Clear screen
      console.log(`${ansiColors.green}👋 Live Dashboard stopped. Goodbye!${ansiColors.reset}`)
      process.exit(0)
    }

    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
  }

  // Start the live dashboard
  public async start() {
    console.log(`${ansiColors.green}🚀 Starting Live TUI Dashboard...${ansiColors.reset}`)
    console.log(`${ansiColors.cyan}Updates every ${this.updateInterval}ms${ansiColors.reset}`)
    
    this.isRunning = true
    this.setupShutdown()

    // Initial render
    await this.render()

    // Set up update interval
    const interval = setInterval(async () => {
      if (this.isRunning) {
        await this.render()
      } else {
        clearInterval(interval)
      }
    }, this.updateInterval)
  }
}

// Start the live dashboard
const dashboard = new LiveDashboard()
dashboard.start().catch(console.error)