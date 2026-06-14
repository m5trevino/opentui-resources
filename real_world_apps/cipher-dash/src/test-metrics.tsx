import { SystemMetricsCollector } from './services/systemMetrics'
import { formatBytes, formatPercentage, formatTemperature } from './utils/formatters'
import { ansiColors } from './utils/colors'

async function testMetrics() {
  console.log(`${ansiColors.bright}${ansiColors.cyan}🧪 Testing System Metrics Collection${ansiColors.reset}`)
  console.log('═'.repeat(50))
  
  try {
    const collector = new SystemMetricsCollector()
    console.log(`${ansiColors.yellow}📊 Collecting system metrics...${ansiColors.reset}`)
    
    const metrics = await collector.collectMetrics()
    
    console.log(`${ansiColors.green}✅ Metrics collected successfully!${ansiColors.reset}`)
    console.log()
    
    // Display CPU metrics
    console.log(`${ansiColors.bright}🖥️  CPU Metrics:${ansiColors.reset}`)
    console.log(`  Overall Usage: ${ansiColors.cyan}${formatPercentage(metrics.cpu.overall)}${ansiColors.reset}`)
    console.log(`  Temperature: ${ansiColors.yellow}${formatTemperature(metrics.cpu.temperature)}${ansiColors.reset}`)
    console.log(`  Cores (${metrics.cpu.cores.length}):`)
    metrics.cpu.cores.forEach((usage, index) => {
      const color = usage > 80 ? ansiColors.red : usage > 50 ? ansiColors.yellow : ansiColors.green
      console.log(`    Core ${index}: ${color}${formatPercentage(usage)}${ansiColors.reset}`)
    })
    console.log()
    
    // Display Memory metrics
    console.log(`${ansiColors.bright}💾 Memory Metrics:${ansiColors.reset}`)
    const memUsagePercent = (metrics.memory.used / metrics.memory.total) * 100
    console.log(`  Used: ${ansiColors.cyan}${formatBytes(metrics.memory.used)}${ansiColors.reset} / ${formatBytes(metrics.memory.total)}`)
    console.log(`  Usage: ${ansiColors.cyan}${formatPercentage(memUsagePercent)}${ansiColors.reset}`)
    console.log(`  Available: ${ansiColors.green}${formatBytes(metrics.memory.available)}${ansiColors.reset}`)
    console.log(`  Pressure: ${metrics.memory.pressure === 'high' ? ansiColors.red : metrics.memory.pressure === 'medium' ? ansiColors.yellow : ansiColors.green}${metrics.memory.pressure.toUpperCase()}${ansiColors.reset}`)
    
    if (metrics.memory.swap.total > 0) {
      const swapPercent = (metrics.memory.swap.used / metrics.memory.swap.total) * 100
      console.log(`  Swap: ${ansiColors.cyan}${formatBytes(metrics.memory.swap.used)}${ansiColors.reset} / ${formatBytes(metrics.memory.swap.total)} (${formatPercentage(swapPercent)})`)
    }
    console.log()
    
    // Display GPU metrics
    console.log(`${ansiColors.bright}🎮 GPU Metrics (M3 Max):${ansiColors.reset}`)
    console.log(`  Utilization: ${ansiColors.cyan}${formatPercentage(metrics.gpu.utilization)}${ansiColors.reset}`)
    if (metrics.gpu.memory.total > 0) {
      const gpuMemPercent = (metrics.gpu.memory.used / metrics.gpu.memory.total) * 100
      console.log(`  Memory: ${ansiColors.cyan}${formatBytes(metrics.gpu.memory.used)}${ansiColors.reset} / ${formatBytes(metrics.gpu.memory.total)} (${formatPercentage(gpuMemPercent)})`)
    }
    console.log(`  Temperature: ${ansiColors.yellow}${formatTemperature(metrics.gpu.temperature)}${ansiColors.reset}`)
    console.log()
    
    // Display Network metrics
    console.log(`${ansiColors.bright}🌐 Network Metrics:${ansiColors.reset}`)
    if (metrics.network.interfaces.length > 0) {
      metrics.network.interfaces.forEach(iface => {
        console.log(`  Interface: ${ansiColors.cyan}${iface.name}${ansiColors.reset}`)
        console.log(`    ↑ Upload: ${ansiColors.green}${formatBytes(iface.upload)}/s${ansiColors.reset}`)
        console.log(`    ↓ Download: ${ansiColors.blue}${formatBytes(iface.download)}/s${ansiColors.reset}`)
        console.log(`    Total ↑: ${formatBytes(iface.uploadTotal)}`)
        console.log(`    Total ↓: ${formatBytes(iface.downloadTotal)}`)
      })
    } else {
      console.log(`  ${ansiColors.yellow}No network interfaces found${ansiColors.reset}`)
    }
    console.log()
    
    // Display Disk metrics
    console.log(`${ansiColors.bright}💿 Disk Metrics:${ansiColors.reset}`)
    console.log(`  Read Speed: ${ansiColors.green}${formatBytes(metrics.disk.read)}/s${ansiColors.reset}`)
    console.log(`  Write Speed: ${ansiColors.blue}${formatBytes(metrics.disk.write)}/s${ansiColors.reset}`)
    
    if (metrics.disk.usage.length > 0) {
      console.log(`  Disk Usage:`)
      metrics.disk.usage.forEach(disk => {
        const color = disk.percentage > 90 ? ansiColors.red : disk.percentage > 70 ? ansiColors.yellow : ansiColors.green
        console.log(`    ${disk.mount}: ${color}${formatPercentage(disk.percentage)}${ansiColors.reset} (${formatBytes(disk.used)} / ${formatBytes(disk.total)})`)
      })
    }
    console.log()
    
    // Display Temperature metrics
    console.log(`${ansiColors.bright}🌡️  Temperature Metrics:${ansiColors.reset}`)
    console.log(`  CPU: ${ansiColors.yellow}${formatTemperature(metrics.temperatures.cpu)}${ansiColors.reset}`)
    console.log(`  GPU: ${ansiColors.yellow}${formatTemperature(metrics.temperatures.gpu)}${ansiColors.reset}`)
    console.log(`  SSD: ${ansiColors.yellow}${formatTemperature(metrics.temperatures.ssd)}${ansiColors.reset}`)
    console.log()
    
    console.log(`${ansiColors.bright}📊 Collection Summary:${ansiColors.reset}`)
    console.log(`  Timestamp: ${new Date(metrics.timestamp).toLocaleString()}`)
    console.log(`  CPU Cores: ${metrics.cpu.cores.length}`)
    console.log(`  Network Interfaces: ${metrics.network.interfaces.length}`)
    console.log(`  Disk Mounts: ${metrics.disk.usage.length}`)
    console.log()
    
    console.log(`${ansiColors.green}🎉 System metrics collection is working perfectly!${ansiColors.reset}`)
    console.log(`${ansiColors.cyan}Ready to build the full dashboard interface.${ansiColors.reset}`)
    
  } catch (error) {
    console.error(`${ansiColors.red}❌ Error testing metrics:${ansiColors.reset}`, error)
    process.exit(1)
  }
}

testMetrics()