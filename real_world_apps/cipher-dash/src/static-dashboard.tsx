import { SystemMetricsCollector } from './services/systemMetrics'
import { formatBytes, formatPercentage, formatTemperature } from './utils/formatters'
import { ansiColors } from './utils/colors'

class StaticDashboard {
  private collector: SystemMetricsCollector

  constructor() {
    this.collector = new SystemMetricsCollector()
  }

  // Create a progress bar using ASCII characters
  private createProgressBar(percentage: number, width: number = 20): string {
    const filled = Math.round((percentage / 100) * width)
    const empty = width - filled
    
    let color = ansiColors.green
    if (percentage >= 90) color = ansiColors.red
    else if (percentage >= 70) color = ansiColors.yellow
    
    return `${color}${'█'.repeat(filled)}${ansiColors.reset}${'░'.repeat(empty)} ${formatPercentage(percentage)}`
  }

  // Create a simple box border
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

  // Display header
  private displayHeader() {
    const timestamp = new Date().toLocaleTimeString()
    console.log()
    console.log(`${ansiColors.bright}${ansiColors.cyan}🖥️  System Monitor Dashboard${ansiColors.reset}`)
    console.log(`${ansiColors.dim}${timestamp} | MacBook Pro M3 Max${ansiColors.reset}`)
    console.log('═'.repeat(80))
  }

  // Display CPU metrics
  private displayCPU(cpuData: any): string[] {
    const content = [
      `Overall: ${this.createProgressBar(cpuData.overall)}`,
      `Cores: ${ansiColors.cyan}${cpuData.cores.length}${ansiColors.reset} (Performance + Efficiency)`,
      ''
    ]

    // Show top 6 most active cores
    const sortedCores = cpuData.cores
      .map((usage: number, index: number) => ({ index, usage }))
      .sort((a: any, b: any) => b.usage - a.usage)
      .slice(0, 6)

    sortedCores.forEach(({ index, usage }: any) => {
      const color = usage > 50 ? ansiColors.yellow : ansiColors.green
      content.push(`Core ${index.toString().padStart(2)}: ${color}${this.createProgressBar(usage, 12)}${ansiColors.reset}`)
    })

    if (cpuData.temperature > 0) {
      content.push('')
      content.push(`Temp: ${ansiColors.yellow}${formatTemperature(cpuData.temperature)}${ansiColors.reset}`)
    }

    return this.createBox('CPU Usage', content, 40)
  }

  // Display Memory metrics
  private displayMemory(memoryData: any): string[] {
    const usedPercentage = (memoryData.used / memoryData.total) * 100
    const content = [
      `Used: ${ansiColors.cyan}${formatBytes(memoryData.used)}${ansiColors.reset} / ${formatBytes(memoryData.total)}`,
      `Usage: ${this.createProgressBar(usedPercentage)}`,
      `Available: ${ansiColors.green}${formatBytes(memoryData.available)}${ansiColors.reset}`,
      `Pressure: ${this.getPressureColor(memoryData.pressure)}${memoryData.pressure.toUpperCase()}${ansiColors.reset}`
    ]

    if (memoryData.swap.total > 0) {
      const swapPercentage = (memoryData.swap.used / memoryData.swap.total) * 100
      content.push('')
      content.push(`Swap: ${this.createProgressBar(swapPercentage, 15)}`)
      content.push(`${formatBytes(memoryData.swap.used)} / ${formatBytes(memoryData.swap.total)}`)
    }

    return this.createBox('Memory', content, 40)
  }

  // Display GPU metrics
  private displayGPU(gpuData: any): string[] {
    const content = [
      `Utilization: ${this.createProgressBar(gpuData.utilization)}`,
    ]

    if (gpuData.memory.total > 0) {
      const memoryPercentage = (gpuData.memory.used / gpuData.memory.total) * 100
      content.push(`Memory: ${formatBytes(gpuData.memory.used)} / ${formatBytes(gpuData.memory.total)}`)
      content.push(`Memory Usage: ${this.createProgressBar(memoryPercentage)}`)
    } else {
      content.push(`${ansiColors.dim}Memory info not available${ansiColors.reset}`)
    }

    if (gpuData.temperature > 0) {
      content.push(`Temperature: ${ansiColors.yellow}${formatTemperature(gpuData.temperature)}${ansiColors.reset}`)
    }

    return this.createBox('GPU (M3 Max)', content, 40)
  }

  // Display Network metrics
  private displayNetwork(networkData: any): string[] {
    const content: string[] = []
    
    if (networkData.interfaces.length > 0) {
      const mainInterface = networkData.interfaces[0]
      content.push(`Interface: ${ansiColors.cyan}${mainInterface.name}${ansiColors.reset}`)
      content.push(`↑ Upload: ${ansiColors.green}${formatBytes(mainInterface.upload)}/s${ansiColors.reset}`)
      content.push(`↓ Download: ${ansiColors.blue}${formatBytes(mainInterface.download)}/s${ansiColors.reset}`)
      content.push('')
      content.push(`Total ↑: ${formatBytes(mainInterface.uploadTotal)}`)
      content.push(`Total ↓: ${formatBytes(mainInterface.downloadTotal)}`)
    } else {
      content.push(`${ansiColors.yellow}No interfaces detected${ansiColors.reset}`)
    }

    return this.createBox('Network I/O', content, 35)
  }

  // Display Disk metrics
  private displayDisk(diskData: any): string[] {
    const content = [
      `Read: ${ansiColors.green}${formatBytes(diskData.read)}/s${ansiColors.reset}`,
      `Write: ${ansiColors.blue}${formatBytes(diskData.write)}/s${ansiColors.reset}`,
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

    return this.createBox('Disk I/O', content, 35)
  }

  // Helper methods for colors
  private getPressureColor(pressure: string): string {
    switch (pressure) {
      case 'high': return ansiColors.red
      case 'medium': return ansiColors.yellow
      case 'low': return ansiColors.green
      default: return ansiColors.reset
    }
  }

  // Print boxes side by side
  private printBoxes(boxes: string[][], spacing: number = 2) {
    const maxLines = Math.max(...boxes.map(box => box.length))
    
    for (let i = 0; i < maxLines; i++) {
      const line = boxes.map(box => box[i] || ' '.repeat(40)).join(' '.repeat(spacing))
      console.log(line)
    }
  }

  // Main render method
  public async render() {
    try {
      const metrics = await this.collector.collectMetrics()
      
      // Clear screen
      console.clear()
      
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
      console.log('═'.repeat(80))
      console.log(`${ansiColors.dim}Press Ctrl+C to exit | Data collected at ${new Date(metrics.timestamp).toLocaleTimeString()}${ansiColors.reset}`)
      console.log()

    } catch (error) {
      console.error(`${ansiColors.red}Error collecting metrics:${ansiColors.reset}`, error)
    }
  }
}

// Create and run the dashboard
const dashboard = new StaticDashboard()
dashboard.render()