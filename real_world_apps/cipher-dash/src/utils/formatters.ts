/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Format percentage with optional decimal places
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format frequency in Hz to human readable string
 */
export function formatFrequency(hz: number): string {
  if (hz >= 1000000000) {
    return `${(hz / 1000000000).toFixed(2)} GHz`
  } else if (hz >= 1000000) {
    return `${(hz / 1000000).toFixed(0)} MHz`
  } else if (hz >= 1000) {
    return `${(hz / 1000).toFixed(0)} KHz`
  }
  return `${hz} Hz`
}

/**
 * Format temperature with unit
 */
export function formatTemperature(celsius: number, unit: 'C' | 'F' = 'C'): string {
  if (unit === 'F') {
    const fahrenheit = (celsius * 9/5) + 32
    return `${fahrenheit.toFixed(1)}°F`
  }
  return `${celsius.toFixed(1)}°C`
}

/**
 * Format uptime in human readable format
 */
export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}

/**
 * Format timestamp to time string
 */
export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString()
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Calculate percentage with bounds checking
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return clamp((value / total) * 100, 0, 100)
}