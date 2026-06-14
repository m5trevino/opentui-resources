import { ThemeColors } from '../types/components'

/**
 * Default theme colors for the dashboard
 */
export const defaultTheme: ThemeColors = {
  primary: '#7aa2f7',
  secondary: '#bb9af7',
  success: '#9ece6a',
  warning: '#e0af68',
  danger: '#f7768e',
  info: '#7dcfff',
  background: '#1a1b26',
  surface: '#24283b',
  text: '#c0caf5',
  textSecondary: '#9aa5ce',
  border: '#414868'
}

/**
 * Get color based on percentage value
 */
export function getPercentageColor(percentage: number, theme = defaultTheme): string {
  if (percentage >= 90) return theme.danger
  if (percentage >= 70) return theme.warning
  if (percentage >= 50) return theme.info
  return theme.success
}

/**
 * Get temperature color based on celsius value
 */
export function getTemperatureColor(celsius: number, theme = defaultTheme): string {
  if (celsius >= 80) return theme.danger
  if (celsius >= 70) return theme.warning
  if (celsius >= 60) return theme.info
  return theme.success
}

/**
 * Get memory pressure color
 */
export function getMemoryPressureColor(pressure: 'low' | 'medium' | 'high', theme = defaultTheme): string {
  switch (pressure) {
    case 'high': return theme.danger
    case 'medium': return theme.warning
    case 'low': return theme.success
    default: return theme.text
  }
}

/**
 * Get network activity color based on speed
 */
export function getNetworkColor(bytesPerSecond: number, theme = defaultTheme): string {
  const mbps = bytesPerSecond / (1024 * 1024)
  if (mbps >= 100) return theme.success
  if (mbps >= 10) return theme.info
  if (mbps >= 1) return theme.warning
  return theme.textSecondary
}

/**
 * Interpolate between two colors
 */
export function interpolateColor(color1: string, color2: string, factor: number): string {
  // Simple hex color interpolation
  const hex1 = color1.replace('#', '')
  const hex2 = color2.replace('#', '')
  
  const r1 = parseInt(hex1.substr(0, 2), 16)
  const g1 = parseInt(hex1.substr(2, 2), 16)
  const b1 = parseInt(hex1.substr(4, 2), 16)
  
  const r2 = parseInt(hex2.substr(0, 2), 16)
  const g2 = parseInt(hex2.substr(2, 2), 16)
  const b2 = parseInt(hex2.substr(4, 2), 16)
  
  const r = Math.round(r1 + (r2 - r1) * factor)
  const g = Math.round(g1 + (g2 - g1) * factor)
  const b = Math.round(b1 + (b2 - b1) * factor)
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

/**
 * Get gradient colors for progress bars
 */
export function getGradientColors(percentage: number, theme = defaultTheme): { start: string, end: string } {
  if (percentage >= 90) {
    return { start: theme.warning, end: theme.danger }
  } else if (percentage >= 70) {
    return { start: theme.info, end: theme.warning }
  } else if (percentage >= 50) {
    return { start: theme.success, end: theme.info }
  }
  return { start: theme.success, end: theme.success }
}

/**
 * ANSI color codes for terminal output
 */
export const ansiColors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
}