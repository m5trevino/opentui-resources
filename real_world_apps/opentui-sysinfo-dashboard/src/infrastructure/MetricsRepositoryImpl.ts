/**
 * Filename: MetricsRepositoryImpl.ts
 * Folder: /infrastructure/
 */

import si from "systeminformation";
import {
  DiskMetrics,
  NetworkMetrics,
  SystemMetrics,
} from "../domain/entities/SystemMetrics";
import { MetricsRepository } from "../domain/repositories/MetricsRepository";

export class MetricsRepositoryImpl implements MetricsRepository {
  async getSystemMetrics(): Promise<SystemMetrics> {
    try {
      const [cpuLoad, mem] = await Promise.all([si.currentLoad(), si.mem()]);

      return {
        cpu: cpuLoad.currentLoad,
        memory: (mem.used / mem.total) * 100,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Failed to get system metrics:", error);
      // Fallback to 0 values
      return {
        cpu: 0,
        memory: 0,
        timestamp: Date.now(),
      };
    }
  }

  async getDiskMetrics(): Promise<DiskMetrics[]> {
    try {
      const fsSize = await si.fsSize();

      return fsSize.map((fs) => ({
        filesystem: fs.fs,
        size: fs.size,
        used: fs.used,
        available: fs.available,
        usedPercent: fs.use,
        mountPoint: fs.mount,
      }));
    } catch (error) {
      console.error("Failed to get disk metrics:", error);
      return [];
    }
  }

  async getNetworkMetrics(): Promise<NetworkMetrics[]> {
    try {
      const netStats = await si.networkStats();

      return netStats.map((net) => ({
        interface: net.iface,
        bytesReceived: net.rx_bytes,
        bytesSent: net.tx_bytes,
        packetsReceived: net.rx_sec,
        packetsSent: net.tx_sec,
      }));
    } catch (error) {
      console.error("Failed to get network metrics:", error);
      return [];
    }
  }
}
