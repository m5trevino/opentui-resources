/**
 * Filename: useProcessList.ts
 * Folder: /hooks/
 */

import { useEffect, useState } from "react";
import { ProcessService } from "../application/services/ProcessService";
import {
  Process,
  ProcessFilter,
  ProcessSortField,
  SortDirection,
} from "../domain/entities/Process";

export function useProcessList(
  service: ProcessService,
  filter: ProcessFilter = {},
  sortField: ProcessSortField = "cpu",
  sortDirection: SortDirection = "desc",
  updateInterval: number = 2000,
) {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        const result = await service.getFilteredAndSortedProcesses(
          filter,
          sortField,
          sortDirection,
        );
        setProcesses(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchProcesses();
    const interval = setInterval(fetchProcesses, updateInterval);

    return () => clearInterval(interval);
  }, [service, filter, sortField, sortDirection, updateInterval]);

  return { processes, loading, error };
}
