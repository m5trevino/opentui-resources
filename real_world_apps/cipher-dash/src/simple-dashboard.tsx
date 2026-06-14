import { SystemMetricsCollector } from './services/systemMetrics'
import { formatBytes, formatPercentage, formatTemperature } from './utils/formatters'
import { ansiColors } from './utils/colors'

class SimpleDashboard {
  private collector: SystemMetricsCollector
  private isRunning: boolean = false
  private updateInterval: number = 1000

  constructor() {
    this.collector = new SystemMetricsCollector()
  }

  // Clear screen and move cursor to top
  private clearScreen() {
    process.stdout.write('\x1b[2J\x1b[H')
  }

  // Move cursor to specific position
  private moveCursor(row: number, col: number) {
    process.stdout.write(`\x1b[${row};${col}H`)
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
  private createBox(title: string, content: string[], width: number = 30): string[] {
    const lines: string[] = []
    const titleLine = `┌─ ${title} ${'─'.repeat(Math.max(0, width - title.length - 4))}┐`
    
    lines.push(titleLine)
    content.forEach(line => {
      const padding = Math.max(0, width - line.replace(/\x1b\[[0-9;]*m/g, '').length - 2)
      lines.push(`│ ${line}${' '.repeat(padding)} │`)
    })
    lines.push(`└${'─'.repeat(width)}┘`)
    
    return lines
  }

  // Display header
  private displayHeader() {
    const timestamp = new Date().toLocaleTimeString()
    const title = `🖥️  System Monitor Dashboard - ${timestamp}`
    
    console.log(`${ansiColors.bright}${ansiColors.cyan}${title}${ansiColors.reset}`)
    console.log('═'.repeat(60))
  }

  // Display CPU metrics
  private displayCPU(cpuData: any) {
    const content = [
      `Overall: ${this.createProgressBar(cpuData.overall)}`,
      `Temperature: ${ansiColors.yellow}${formatTemperature(cpuData.temperature)}${ansiColors.reset}`,
      '',
      'Per Core:'
    ]

    cpuData.cores.forEach((usage: number, index: number) => {
      content.push(`  Core ${index}: ${this.createProgressBar(usage, 10)}`)
    })

    return this.createBox('CPU Usage', content, 35)
  }

  // Display Memory metrics
  private displayMemory(memoryData: any) {
    const usedPercentage = (memoryData.used / memoryData.total) * 100
    const content = [
      `Used: ${formatBytes(memoryData.used)} / ${formatBytes(memoryData.total)}`,
      `Usage: ${this.createProgressBar(usedPercentage)}`,
      `Available: ${ansiColors.green}${formatBytes(memoryData.available)}${ansiColors.reset}`,
      `Pressure: ${this.getPressureColor(memoryData.pressure)}${memoryData.pressure.toUpperCase()}${ansiColors.reset}`
    ]

    if (memoryData.swap.total > 0) {
      const swapPercentage = (memoryData.swap.used / memoryData.swap.total) * 100
      content.push('')
      content.push(`Swap: ${this.createProgressBar(swapPercentage, 15)}`)
    }

    return this.createBox('Memory', content, 35)
  }

  // Display GPU metrics
  private displayGPU(gpuData: any) {
    const memoryPercentage = (gpuData.memory.used / gpuData.memory.total) * 100
    const content = [
      `Utilization: ${this.createProgressBar(gpuData.utilization)}`,
      `Memory: ${formatBytes(gpuData.memory.used)} / ${formatBytes(gpuData.memory.total)}`,
      `Memory Usage: ${this.createProgressBar(memoryPercentage)}`,
      `Temperature: ${ansiColors.yellow}${formatTemperature(gpuData.temperature)}${ansiColors.reset}`
    ]

    return this.createBox('GPU (M3 Max)', content, 35)
  }

  // Display Network metrics
  private displayNetwork(networkData: any) {
    const mainInterface = networkData.interfaces[0] || { name: 'N/A', upload: 0, download: 0 }
    const content = [
      `Interface: ${ansiColors.cyan}${mainInterface.name}${ansiColors.reset}`,
      `↑ Upload: ${ansiColors.green}${formatBytes(mainInterface.upload)}/s${ansiColors.reset}`,
      `↓ Download: ${ansiColors.blue}${formatBytes(mainInterface.download)}/s${ansiColors.reset}`,
      '',
      `Total ↑: ${formatBytes(mainInterface.uploadTotal || 0)}`,
      `Total ↓: ${formatBytes(mainInterface.downloadTotal || 0)}`
    ]

    return this.createBox('Network I/O', content, 35)
  }

  // Display Temperature metrics
  private displayTemperatures(tempData: any) {
    const content = [
      `CPU: ${this.getTempColor(tempData.cpu)}${formatTemperature(tempData.cpu)}${ansiColors.reset}`,
      `GPU: ${this.getTempColor(tempData.gpu)}${formatTemperature(tempData.gpu)}${ansiColors.reset}`,
      `SSD: ${this.getTempColor(tempData.ssd)}${formatTemperature(tempData.ssd)}${ansiColors.reset}`
    ]

    if (tempData.ambient > 0) {
      content.push(`Ambient: ${ansiColors.cyan}${formatTemperature(tempData.ambient)}${ansiColors.reset}`)
    }

    return this.createBox('Temperatures', content, 25)
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

  private getTempColor(temp: number): string {
    if (temp >= 80) return ansiColors.red
    if (temp >= 70) return ansiColors.yellow
    if (temp >= 60) return ansiColors.cyan
    return ansiColors.green
  }

  // Display footer with controls
  private displayFooter() {
    console.log('═'.repeat(60))
    console.log(`${ansiColors.dim}[Q] Quit  [P] Pause  [R] Refresh  [H] Help${ansiColors.reset}`)
    console.log(`${ansiColors.dim}Update interval: ${this.updateInterval}ms${ansiColors.reset}`)
  }

  // Main render method
  private async render() {
    try {
      const metrics = await this.collector.collectMetrics()
      
      this.clearScreen()
      this.displayHeader()
      console.log()

      // Display metrics in a grid layout
      const cpuBox = this.displayCPU(metrics.cpu)
      const memoryBox = this.displayMemory(metrics.memory)
      const gpuBox = this.displayGPU(metrics.gpu)
      const networkBox = this.displayNetwork(metrics.network)
      const tempBox = this.displayTemperatures(metrics.temperatures)

      // Print boxes side by side (simple layout)
      const maxLines = Math.max(cpuBox.length, memoryBox.length)
      for (let i = 0; i < maxLines; i++) {
        const cpuLine = cpuBox[i] || ' '.repeat(37)
        const memoryLine = memoryBox[i] || ' '.repeat(37)
        console.log(`${cpuLine}  ${memoryLine}`)
      }

      console.log()

      // Second row
      const maxLines2 = Math.max(gpuBox.length, networkBox.length, tempBox.length)
      for (let i = 0; i < maxLines2; i++) {
        const gpuLine = gpuBox[i] || ' '.repeat(37)
        const networkLine = networkBox[i] || ' '.repeat(37)
        const tempLine = tempBox[i] || ' '.repeat(27)
        console.log(`${gpuLine}  ${networkLine}  ${tempLine}`)
      }

      console.log()
      this.displayFooter()

    } catch (error) {
      console.error(`${ansiColors.red}Error collecting metrics:${ansiColors.reset}`, error)
    }
  }

  // Handle keyboard input
  private setupKeyboardHandling() {
    process.stdin.setRawMode(true)
    process.stdin.resume()
    process.stdin.setEncoding('utf8')

    process.stdin.on('data', (key: string) => {
      switch (key.toLowerCase()) {
        case 'q':
        case '\u0003': // Ctrl+C
          this.stop()
          break
        case 'p':
          this.isRunning = !this.isRunning
          if (this.isRunning) {
            this.start()
          }
          break
        case 'r':
          this.render()
          break
        case 'h':
          this.showHelp()
          break
      }
    })
  }

  private showHelp() {
    this.clearScreen()
    console.log(`${ansiColors.bright}${ansiColors.cyan}System Monitor Dashboard - Help${ansiColors.reset}`)
    console.log('═'.repeat(40))
    console.log()
    console.log(`${ansiColors.green}Keyboard Controls:${ansiColors.reset}`)
    console.log('  Q - Quit application')
    console.log('  P - Pause/Resume updates')
    console.log('  R - Refresh now')
    console.log('  H - Show this help')
    console.log()
    console.log(`${ansiColors.yellow}Metrics Displayed:${ansiColors.reset}`)
    console.log('  • CPU usage per core and overall')
    console.log('  • Memory usage and pressure')
    console.log('  • GPU utilization (M3 Max)')
    console.log('  • Network I/O statistics')
    console.log('  • Temperature sensors')
    console.log()
    console.log(`${ansiColors.dim}Press any key to return to dashboard...${ansiColors.reset}`)

    process.stdin.once('data', () => {
      this.render()
    })
  }

  // Start the dashboard
  public async start() {
    console.log(`${ansiColors.green}🚀 Starting Simple TUI Dashboard...${ansiColors.reset}`)
    
    this.isRunning = true
    this.setupKeyboardHandling()

    // Initial render
    await this.render()

    // Set up update interval
    const interval = setInterval(async () => {
      if (this.isRunning) {
        await this.render()
      }
    }, this.updateInterval)

    // Cleanup on exit
    process.on('SIGINT', () => {
      clearInterval(interval)
      this.stop()
    })
  }

  // Stop the dashboard
  public stop() {
    this.isRunning = false
    this.clearScreen()
    console.log(`${ansiColors.green}👋 Dashboard stopped. Goodbye!${ansiColors.reset}`)
    process.exit(0)
  }
}

// Start the dashboard
const dashboard = new SimpleDashboard()
dashboard.start().catch(console.error)