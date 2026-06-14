/**
 * Filename: SystemMetrics.ts
 * Folder: /domain/entities/
 */

export interface SystemMetrics {
  cpu: number;
  memory: number;
  timestamp: number;
}

export interface MetricsHistory {
  cpu: number[];
  memory: number[];
  timestamps: number[];
  maxDataPoints: number;
}

export interface DiskMetrics {
  filesystem: string;
  size: number;
  used: number;
  available: number;
  usedPercent: number;
  mountPoint: string;
}

export interface NetworkMetrics {
  interface: string;
  bytesReceived: number;
  bytesSent: number;
  packetsReceived: number;
  packetsSent: number;
}
