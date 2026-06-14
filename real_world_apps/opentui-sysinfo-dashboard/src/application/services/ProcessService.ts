/**
 * Filename: ProcessService.ts
 * Folder: /application/services/
 */

import {
  Process,
  ProcessFilter,
  ProcessSortField,
  SortDirection,
} from "../../domain/entities/Process";
import { ProcessRepository } from "../../domain/repositories/ProcessRepository";

export class ProcessService {
  constructor(private repository: ProcessRepository) {}

  async getAllProcesses(): Promise<Process[]> {
    return this.repository.getAll();
  }

  async getProcessById(pid: number): Promise<Process | null> {
    return this.repository.getById(pid);
  }

  async killProcess(pid: number, signal?: string): Promise<void> {
    return this.repository.kill(pid, signal);
  }

  filterProcesses(processes: Process[], filter: ProcessFilter): Process[] {
    return this.repository.filter(processes, filter);
  }

  sortProcesses(
    processes: Process[],
    field: ProcessSortField,
    direction: SortDirection,
  ): Process[] {
    return this.repository.sort(processes, field, direction);
  }

  async getFilteredAndSortedProcesses(
    filter: ProcessFilter,
    sortField: ProcessSortField,
    sortDirection: SortDirection,
  ): Promise<Process[]> {
    const allProcesses = await this.getAllProcesses();
    const filtered = this.filterProcesses(allProcesses, filter);
    return this.sortProcesses(filtered, sortField, sortDirection);
  }
}
