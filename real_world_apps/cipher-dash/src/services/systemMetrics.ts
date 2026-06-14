import si from 'systeminformation'
import { SystemMetrics } from '../types/metrics'

export class SystemMetricsCollector {
  private previousNetworkStats: any = null
  private previousDiskStats: any = null
  
  async collectMetrics(): Promise<SystemMetrics> {
    try {
      // Collect all metrics in parallel for better performance
      const [
        cpu,
        memory,
        graphics,
        networkStats,
        diskIO,
        temperatures,
        fsSize
      ] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.graphics(),
        si.networkStats(),
        si.disksIO(),
        si.cpuTemperature(),
        si.fsSize()
      ])

      return {
        cpu: this.processCPUData(cpu),
        memory: this.processMemoryData(memory),
        gpu: this.processGPUData(graphics),
        network: this.processNetworkData(networkStats),
        disk: this.processDiskData(diskIO, fsSize),
        temperatures: this.processTemperatureData(temperatures),
        timestamp: Date.now()
      }
    } catch (error) {
      console.error('Error collecting system metrics:', error)
      // Return default/empty metrics on error
      return this.getDefaultMetrics()
    }
  }

  private processCPUData(cpu: any) {
    return {
      overall: Math.round(cpu.currentLoad || 0),
      cores: cpu.cpus ? cpu.cpus.map((core: any) => Math.round(core.load || 0)) : [],
      temperature: cpu.temperature || 0,
      frequency: cpu.avgLoad || 0
    }
  }

  private processMemoryData(memory: any) {
    const used = memory.used || 0
    const total = memory.total || 1
    const available = memory.available || 0
    
    // Calculate memory pressure based on usage
    const usagePercentage = (used / total) * 100
    let pressure: 'low' | 'medium' | 'high' = 'low'
    if (usagePercentage > 85) pressure = 'high'
    else if (usagePercentage > 70) pressure = 'medium'

    return {
      used,
      total,
      available,
      pressure,
      swap: {
        used: memory.swapused || 0,
        total: memory.swaptotal || 0
      }
    }
  }

  private processGPUData(graphics: any) {
    // For M3 Max, we'll try to get the first discrete GPU or fallback to integrated
    const gpu = graphics.controllers?.find((gpu: any) => 
      gpu.model?.toLowerCase().includes('m3') || 
      gpu.vendor?.toLowerCase().includes('apple')
    ) || graphics.controllers?.[0] || {}

    return {
      utilization: gpu.utilizationGpu || 0,
      memory: {
        used: gpu.memoryUsed || 0,
        total: gpu.memoryTotal || 0
      },
      temperature: gpu.temperatureGpu || 0,
      frequency: gpu.clockCore || 0
    }
  }

  private processNetworkData(networkStats: any) {
    const interfaces = networkStats
      .filter((iface: any) => iface.iface && !iface.iface.includes('lo'))
      .map((iface: any) => ({
        name: iface.iface,
        upload: this.calculateSpeed(iface.tx_bytes, this.previousNetworkStats?.[iface.iface]?.tx_bytes),
        download: this.calculateSpeed(iface.rx_bytes, this.previousNetworkStats?.[iface.iface]?.rx_bytes),
        uploadTotal: iface.tx_bytes || 0,
        downloadTotal: iface.rx_bytes || 0
      }))

    // Store current stats for next calculation
    this.previousNetworkStats = {}
    networkStats.forEach((iface: any) => {
      if (iface.iface) {
        this.previousNetworkStats[iface.iface] = {
          tx_bytes: iface.tx_bytes,
          rx_bytes: iface.rx_bytes,
          timestamp: Date.now()
        }
      }
    })

    return { interfaces }
  }

  private processDiskData(diskIO: any, fsSize: any) {
    const read = this.calculateSpeed(diskIO.rIO, this.previousDiskStats?.rIO)
    const write = this.calculateSpeed(diskIO.wIO, this.previousDiskStats?.wIO)

    // Store current stats for next calculation
    this.previousDiskStats = {
      rIO: diskIO.rIO,
      wIO: diskIO.wIO,
      timestamp: Date.now()
    }

    const usage = fsSize.map((fs: any) => ({
      mount: fs.mount,
      used: fs.used || 0,
      total: fs.size || 1,
      percentage: Math.round(((fs.used || 0) / (fs.size || 1)) * 100)
    }))

    return {
      read,
      write,
      readTotal: diskIO.rIO || 0,
      writeTotal: diskIO.wIO || 0,
      usage
    }
  }

  private processTemperatureData(temperatures: any) {
    return {
      cpu: temperatures.main || 0,
      gpu: temperatures.cores?.[0] || 0, // Approximate GPU temp
      ssd: temperatures.cores?.[1] || 0, // Approximate SSD temp
      ambient: 0 // Not typically available on macOS
    }
  }

  private calculateSpeed(current: number, previous: number | undefined): number {
    if (!previous || !current) return 0
    
    const timeDiff = 1 // Assume 1 second between measurements for now
    const byteDiff = Math.max(0, current - previous)
    
    return Math.round(byteDiff / timeDiff)
  }

  private getDefaultMetrics(): SystemMetrics {
    return {
      cpu: {
        overall: 0,
        cores: [],
        temperature: 0,
        frequency: 0
      },
      memory: {
        used: 0,
        total: 1,
        available: 0,
        pressure: 'low',
        swap: { used: 0, total: 0 }
      },
      gpu: {
        utilization: 0,
        memory: { used: 0, total: 0 },
        temperature: 0,
        frequency: 0
      },
      network: {
        interfaces: []
      },
      disk: {
        read: 0,
        write: 0,
        readTotal: 0,
        writeTotal: 0,
        usage: []
      },
      temperatures: {
        cpu: 0,
        gpu: 0,
        ssd: 0,
        ambient: 0
      },
      timestamp: Date.now()
    }
  }
}