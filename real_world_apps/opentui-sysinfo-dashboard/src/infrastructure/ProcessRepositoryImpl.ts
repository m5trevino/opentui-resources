/**
 * Filename: ProcessRepositoryImpl.ts
 * Folder: /infrastructure/
 */

import si from "systeminformation";
import {
  Process,
  ProcessFilter,
  ProcessSortField,
  SortDirection,
} from "../domain/entities/Process";
import { ProcessRepository } from "../domain/repositories/ProcessRepository";

export class ProcessRepositoryImpl implements ProcessRepository {
  async getAll(): Promise<Process[]> {
    try {
      const processList = await si.processes();
      const totalMem = (await si.mem()).total;

      return processList.list.map((proc) => ({
        pid: proc.pid,
        name: proc.name,
        cpu: proc.cpu || 0,
        memory: proc.mem || 0,
        user: proc.user || "unknown",
        command: proc.command || "",
        status: proc.state === "running" ? "running" : "sleeping",
      }));
    } catch (error) {
      console.error("Failed to get processes:", error);
      return [];
    }
  }

  async getById(pid: number): Promise<Process | null> {
    const processes = await this.getAll();
    return processes.find((p) => p.pid === pid) || null;
  }

  async kill(pid: number, signal: string = "SIGTERM"): Promise<void> {
    try {
      process.kill(pid, signal as NodeJS.Signals);
      console.log(`Successfully killed process ${pid} with signal ${signal}`);
    } catch (error) {
      console.error(`Failed to kill process ${pid}:`, error);
      throw new Error(`Failed to kill process ${pid}: ${error}`);
    }
  }

  filter(processes: Process[], filter: ProcessFilter): Process[] {
    return processes.filter((proc) => {
      if (filter.searchTerm) {
        const term = filter.searchTerm.toLowerCase();
        if (
          !proc.name.toLowerCase().includes(term) &&
          !proc.command.toLowerCase().includes(term) &&
          !proc.pid.toString().includes(term)
        ) {
          return false;
        }
      }

      if (filter.minCpu !== undefined && proc.cpu < filter.minCpu) {
        return false;
      }

      if (filter.minMemory !== undefined && proc.memory < filter.minMemory) {
        return false;
      }

      if (filter.status && proc.status !== filter.status) {
        return false;
      }

      return true;
    });
  }

  sort(
    processes: Process[],
    field: ProcessSortField,
    direction: SortDirection,
  ): Process[] {
    return [...processes].sort((a, b) => {
      let comparison = 0;

      switch (field) {
        case "pid":
          comparison = a.pid - b.pid;
          break;
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "cpu":
          comparison = a.cpu - b.cpu;
          break;
        case "memory":
          comparison = a.memory - b.memory;
          break;
      }

      return direction === "asc" ? comparison : -comparison;
    });
  }
}
