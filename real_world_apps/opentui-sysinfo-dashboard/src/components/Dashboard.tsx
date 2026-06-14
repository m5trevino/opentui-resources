import { useEffect, useMemo, useState } from "react";
import { MetricsService } from "../application/services/MetricsService";
import { MetricsRepositoryImpl } from "../infrastructure/MetricsRepositoryImpl";
import { useMetricsHistory } from "../hooks/useMetricsHistory";
import { useSettings } from "../hooks/useSettings";
import { DiskMetrics } from "../domain/entities/SystemMetrics";
import { BoxPanel } from "./ui/BoxPanel";
import { ProgressBar } from "./ui/ProgressBar";
import { Sparkline } from "./ui/Sparkline";
import { LoadingSpinner } from "./ui/LoadingSpinner";
import { DiskUsagePanel } from "./ui/DiskUsagePanel";

interface DashboardProps {
  width: number;
  height: number;
}

export const Dashboard = ({ width, height }: DashboardProps) => {
  const { settings } = useSettings();

  const metricsService = useMemo(
    () =>
      new MetricsService(
        new MetricsRepositoryImpl(),
        settings.maxHistoryPoints,
      ),
    [settings.maxHistoryPoints],
  );

  const { history, error } = useMetricsHistory(
    metricsService,
    settings.refreshInterval,
  );

  const [disks, setDisks] = useState<DiskMetrics[]>([]);

  useEffect(() => {
    const fetchDisks = async () => {
      const diskData = await metricsService.getDiskMetrics();
      setDisks(diskData);
    };
    fetchDisks();
    const interval = setInterval(fetchDisks, 5000);
    return () => clearInterval(interval);
  }, [metricsService]);

  if (error) {
    return (
      <BoxPanel
        title="System Dashboard"
        style={{
          width: width - 2,
          height: height - 2,
        }}
      >
        <text fg="red">
          <strong>Error:</strong> {error.message}
        </text>
      </BoxPanel>
    );
  }

  const currentCpu = history.cpu[history.cpu.length - 1] || 0;
  const currentMemory = history.memory[history.memory.length - 1] || 0;
  const sparklineWidth = Math.max(20, Math.min(60, width - 10));

  return (
    <BoxPanel
      title="System Dashboard - Real-Time Monitoring"
      style={{
        width: width - 2,
        height: height - 2,
        flexDirection: "column",
        gap: 1,
        padding: 2,
      }}
    >
      {history.cpu.length === 0 ? (
        <LoadingSpinner message="Collecting metrics..." />
      ) : (
        <>
          {/* CPU Section */}
          <box style={{ flexDirection: "column", gap: 0, marginBottom: 1 }}>
            <text>
              <strong>CPU Usage</strong>
            </text>
            <ProgressBar
              value={currentCpu}
              width={Math.max(20, Math.min(50, width - 15))}
              showPercentage
              color="cyan"
            />
            {settings.showSparklines && width > 50 && (
              <Sparkline
                data={history.cpu}
                width={sparklineWidth}
                height={3}
                color="cyan"
                label="History"
              />
            )}
          </box>

          {/* Memory Section */}
          <box style={{ flexDirection: "column", gap: 0, marginBottom: 1 }}>
            <text>
              <strong>Memory Usage</strong>
            </text>
            <ProgressBar
              value={currentMemory}
              width={Math.max(20, Math.min(50, width - 15))}
              showPercentage
              color="green"
            />
            {settings.showSparklines && width > 50 && (
              <Sparkline
                data={history.memory}
                width={sparklineWidth}
                height={3}
                color="green"
                label="History"
              />
            )}
          </box>

          {/* Disk Usage */}
          {width > 60 && disks.length > 0 && (
            <box style={{ marginBottom: 1 }}>
              <DiskUsagePanel disks={disks} width={width - 10} />
            </box>
          )}

          {/* Stats Summary with Alerts */}
          <box
            style={{
              border: true,
              borderStyle: "single",
              padding: 1,
              flexDirection: "column",
              gap: 0,
            }}
          >
            <text fg="gray">
              <strong>Statistics</strong>
            </text>
            <text>
              Avg CPU:{" "}
              {(
                history.cpu.reduce((a, b) => a + b, 0) / history.cpu.length
              ).toFixed(1)}
              %
            </text>
            <text>
              Avg Memory:{" "}
              {(
                history.memory.reduce((a, b) => a + b, 0) /
                history.memory.length
              ).toFixed(1)}
              %
            </text>
            <text>
              Data Points: {history.cpu.length}/{history.maxDataPoints}
            </text>

            {/* Alert Indicators */}
            {settings.enableAlerts && (
              <box style={{ marginTop: 1, flexDirection: "column", gap: 0 }}>
                {currentCpu > settings.alertThresholds.cpu && (
                  <text fg="red">⚠ CPU Alert: {currentCpu.toFixed(1)}%</text>
                )}
                {currentMemory > settings.alertThresholds.memory && (
                  <text fg="red">
                    ⚠ Memory Alert: {currentMemory.toFixed(1)}%
                  </text>
                )}
              </box>
            )}

            <text fg="gray" style={{ marginTop: 1 }}>
              Updated:{" "}
              {new Date(
                history.timestamps[history.timestamps.length - 1],
              ).toLocaleTimeString()}
            </text>
          </box>
        </>
      )}
    </BoxPanel>
  );
};
