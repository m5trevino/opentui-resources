/**
 * Filename: SettingsEnhanced.tsx
 * Folder: /components/
 */

import { themes } from "../domain/entities/Theme";
import { useSettings } from "../hooks/useSettings";
import { BoxPanel } from "./ui/BoxPanel";

interface SettingsProps {
  width: number;
  height: number;
}

export function Settings({ width, height }: SettingsProps) {
  const { settings, updateSettings, resetSettings } = useSettings();

  const themeNames = Object.keys(themes);
  const currentThemeIndex = themeNames.indexOf(settings.theme);
  const isCompact = width < 70;

  return (
    <BoxPanel
      title="Settings"
      style={{
        width: width - 2,
        height: height - 2,
        flexDirection: "column",
        gap: 1,
        padding: 2,
      }}
    >
      <text fg="cyan">
        <strong>Appearance</strong>
      </text>
      <box style={{ flexDirection: "row", gap: 2 }}>
        <text style={{ width: isCompact ? 15 : 20 }}>Theme:</text>
        <text fg="yellow">{themes[settings.theme].name}</text>
        {!isCompact && <text fg="gray">(Press T to cycle)</text>}
      </box>

      <text fg="cyan" style={{ marginTop: 1 }}>
        <strong>Performance</strong>
      </text>
      <box style={{ flexDirection: "row", gap: 2 }}>
        <text style={{ width: 20 }}>Refresh Interval:</text>
        <text fg="yellow">{settings.refreshInterval}ms</text>
        <text fg="gray">(Press +/- to adjust)</text>
      </box>
      <box style={{ flexDirection: "row", gap: 2 }}>
        <text style={{ width: 20 }}>Process Update:</text>
        <text fg="yellow">{settings.processUpdateInterval}ms</text>
      </box>
      <box style={{ flexDirection: "row", gap: 2 }}>
        <text style={{ width: 20 }}>Max History Points:</text>
        <text fg="yellow">{settings.maxHistoryPoints}</text>
      </box>

      <text fg="cyan" style={{ marginTop: 1 }}>
        <strong>Display Options</strong>
      </text>
      <box style={{ flexDirection: "row", gap: 2 }}>
        <text style={{ width: 20 }}>Show Sparklines:</text>
        <text fg={settings.showSparklines ? "green" : "red"}>
          {settings.showSparklines ? "Enabled" : "Disabled"}
        </text>
      </box>
      <box style={{ flexDirection: "row", gap: 2 }}>
        <text style={{ width: 20 }}>Show System Info:</text>
        <text fg={settings.showSystemInfo ? "green" : "red"}>
          {settings.showSystemInfo ? "Enabled" : "Disabled"}
        </text>
      </box>

      <text fg="cyan" style={{ marginTop: 1 }}>
        <strong>Alert Thresholds</strong>
      </text>
      <box style={{ flexDirection: "row", gap: 2 }}>
        <text style={{ width: 20 }}>Enable Alerts:</text>
        <text fg={settings.enableAlerts ? "green" : "red"}>
          {settings.enableAlerts ? "Enabled" : "Disabled"}
        </text>
      </box>
      <box style={{ flexDirection: "row", gap: 2 }}>
        <text style={{ width: 20 }}>CPU Threshold:</text>
        <text fg="yellow">{settings.alertThresholds.cpu}%</text>
      </box>
      <box style={{ flexDirection: "row", gap: 2 }}>
        <text style={{ width: 20 }}>Memory Threshold:</text>
        <text fg="yellow">{settings.alertThresholds.memory}%</text>
      </box>
      <box style={{ flexDirection: "row", gap: 2 }}>
        <text style={{ width: 20 }}>Disk Threshold:</text>
        <text fg="yellow">{settings.alertThresholds.disk}%</text>
      </box>

      <box
        style={{
          border: true,
          borderStyle: "single",
          padding: 1,
          marginTop: 2,
          flexDirection: "column",
          gap: 0,
        }}
      >
        <text fg="yellow">
          <strong>Available Themes</strong>
        </text>
        {themeNames.map((themeName, index) => (
          <text
            key={themeName}
            fg={index === currentThemeIndex ? "cyan" : "gray"}
          >
            {index === currentThemeIndex ? "► " : "  "}
            {themes[themeName].name}
          </text>
        ))}
      </box>

      <text fg="gray" style={{ marginTop: 2 }}>
        Settings are automatically saved to ~/.opentui-dashboard/settings.json
      </text>
    </BoxPanel>
  );
}
