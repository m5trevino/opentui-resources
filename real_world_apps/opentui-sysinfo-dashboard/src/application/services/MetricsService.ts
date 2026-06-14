/**
 * Filename: MetricsService.ts
 * Folder: /application/services/
 */

import {
  MetricsHistory,
  SystemMetrics,
} from "../../domain/entities/SystemMetrics";
import { MetricsRepository } from "../../domain/repositories/MetricsRepository";

export class MetricsService {
  private history: MetricsHistory;

  constructor(
    private repository: MetricsRepository,
    maxDataPoints: number = 60,
  ) {
    this.history = {
      cpu: [],
      memory: [],
      timestamps: [],
      maxDataPoints,
    };
  }

  async getCurrentMetrics(): Promise<SystemMetrics> {
    return this.repository.getSystemMetrics();
  }

  async updateHistory(): Promise<void> {
    const metrics = await this.getCurrentMetrics();

    this.history.cpu.push(metrics.cpu);
    this.history.memory.push(metrics.memory);
    this.history.timestamps.push(metrics.timestamp);

    // Keep only the last N data points
    if (this.history.cpu.length > this.history.maxDataPoints) {
      this.history.cpu.shift();
      this.history.memory.shift();
      this.history.timestamps.shift();
    }
  }

  getHistory(): MetricsHistory {
    return { ...this.history };
  }

  clearHistory(): void {
    this.history.cpu = [];
    this.history.memory = [];
    this.history.timestamps = [];
  }

  async getDiskMetrics() {
    return this.repository.getDiskMetrics();
  }

  async getNetworkMetrics() {
    return this.repository.getNetworkMetrics();
  }
}
