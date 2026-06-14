export interface SystemMetrics {
  cpu: {
    overall: number
    cores: number[]
    temperature: number
    frequency: number
  }
  memory: {
    used: number
    total: number
    available: number
    pressure: 'low' | 'medium' | 'high'
    swap: {
      used: number
      total: number
    }
  }
  gpu: {
    utilization: number
    memory: {
      used: number
      total: number
    }
    temperature: number
    frequency: number
  }
  network: {
    interfaces: Array<{
      name: string
      upload: number
      download: number
      uploadTotal: number
      downloadTotal: number
    }>
  }
  disk: {
    read: number
    write: number
    readTotal: number
    writeTotal: number
    usage: Array<{
      mount: string
      used: number
      total: number
      percentage: number
    }>
  }
  temperatures: {
    cpu: number
    gpu: number
    ssd: number
    ambient: number
  }
  timestamp: number
}

export interface MetricHistory {
  timestamps: number[]
  values: number[]
  maxLength: number
}

export interface DashboardState {
  isPaused: boolean
  updateInterval: number
  selectedMetric: string | null
  showHelp: boolean
}