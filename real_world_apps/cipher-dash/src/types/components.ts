export interface ProgressBarProps {
  value: number
  max?: number
  width?: number
  height?: number
  color?: string
  backgroundColor?: string
  showPercentage?: boolean
  vertical?: boolean
  animated?: boolean
}

export interface MiniGraphProps {
  data: number[]
  width?: number
  height?: number
  max?: number
  color?: string
  sparkline?: boolean
}

export interface MetricCardProps {
  title: string
  value: number | string
  unit?: string
  max?: number
  color?: string
  trend?: 'up' | 'down' | 'stable'
  children?: any
}

export interface MonitorComponentProps<T> {
  data?: T
  compact?: boolean
  showDetails?: boolean
}

export interface LayoutConfig {
  isSmall: boolean
  isMedium: boolean
  isLarge: boolean
  columns: number
  showDetails: boolean
  compactMode: boolean
}

export interface ThemeColors {
  primary: string
  secondary: string
  success: string
  warning: string
  danger: string
  info: string
  background: string
  surface: string
  text: string
  textSecondary: string
  border: string
}