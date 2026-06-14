/**
 * Filename: MetricsRepository.ts
 * Folder: /domain/repositories/
 */

import {
  DiskMetrics,
  NetworkMetrics,
  SystemMetrics,
} from "../entities/SystemMetrics";

export interface MetricsRepository {
  getSystemMetrics(): Promise<SystemMetrics>;
  getDiskMetrics(): Promise<DiskMetrics[]>;
  getNetworkMetrics(): Promise<NetworkMetrics[]>;
}
