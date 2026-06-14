/**
 * Filename: Process.ts
 * Folder: /domain/entities/
 */

export interface Process {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
  user: string;
  command: string;
  status: "running" | "sleeping" | "stopped" | "zombie";
}

export type ProcessSortField = "pid" | "name" | "cpu" | "memory";
export type SortDirection = "asc" | "desc";

export interface ProcessFilter {
  searchTerm?: string;
  minCpu?: number;
  minMemory?: number;
  status?: Process["status"];
}
