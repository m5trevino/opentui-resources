/**
 * Filename: AppSettings.ts
 * Folder: /domain/entities/
 */

export interface AppSettings {
  theme: string;
  refreshInterval: number;
  showSparklines: boolean;
  maxHistoryPoints: number;
  processUpdateInterval: number;
  showSystemInfo: boolean;
  alertThresholds: {
    cpu: number;
    memory: number;
    disk: number;
  };
  enableAlerts: boolean;
}

export const defaultSettings: AppSettings = {
  theme: "default",
  refreshInterval: 1000,
  showSparklines: true,
  maxHistoryPoints: 60,
  processUpdateInterval: 2000,
  showSystemInfo: true,
  alertThresholds: {
    cpu: 80,
    memory: 85,
    disk: 90,
  },
  enableAlerts: true,
};
