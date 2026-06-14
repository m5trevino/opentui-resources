/**
 * Filename: DiskUsagePanel.tsx
 * Folder: /components/ui/
 */

import { DiskMetrics } from "../../domain/entities/SystemMetrics";
import { ProgressBar } from "./ProgressBar";

interface DiskUsagePanelProps {
  disks: DiskMetrics[];
  width?: number;
}

export function DiskUsagePanel({ disks, width = 50 }: DiskUsagePanelProps) {
  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return gb.toFixed(1) + " GB";
  };

  return (
    <box style={{ flexDirection: "column", gap: 1 }}>
      <text>
        <strong>Disk Usage</strong>
      </text>
      {disks.map((disk) => (
        <box key={disk.filesystem} style={{ flexDirection: "column", gap: 0 }}>
          <text fg="gray">
            {disk.mountPoint} ({disk.filesystem})
          </text>
          <ProgressBar
            value={disk.usedPercent}
            width={Math.min(width - 10, 40)}
            showPercentage
            color="blue"
          />
          <text fg="gray">
            {formatBytes(disk.used)} / {formatBytes(disk.size)} used
          </text>
        </box>
      ))}
    </box>
  );
}
