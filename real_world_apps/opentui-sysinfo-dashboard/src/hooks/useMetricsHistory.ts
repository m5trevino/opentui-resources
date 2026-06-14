/**
 * Filename: useMetricsHistory.ts
 * Folder: /hooks/
 */

import { useEffect, useState } from "react";
import { MetricsService } from "../application/services/MetricsService";
import { MetricsHistory } from "../domain/entities/SystemMetrics";

export function useMetricsHistory(
  service: MetricsService,
  updateInterval: number = 1000,
) {
  const [history, setHistory] = useState<MetricsHistory>(service.getHistory());
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await service.updateHistory();
        setHistory(service.getHistory());
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    }, updateInterval);

    return () => clearInterval(interval);
  }, [service, updateInterval]);

  return { history, error };
}
