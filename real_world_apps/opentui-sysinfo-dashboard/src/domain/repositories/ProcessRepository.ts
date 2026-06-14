/**
 * Filename: ProcessRepository.ts
 * Folder: /domain/repositories/
 */

import {
  Process,
  ProcessFilter,
  ProcessSortField,
  SortDirection,
} from "../entities/Process";

export interface ProcessRepository {
  getAll(): Promise<Process[]>;
  getById(pid: number): Promise<Process | null>;
  kill(pid: number, signal?: string): Promise<void>;
  filter(processes: Process[], filter: ProcessFilter): Process[];
  sort(
    processes: Process[],
    field: ProcessSortField,
    direction: SortDirection,
  ): Process[];
}
