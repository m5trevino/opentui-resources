/**
 * Life Support Systems Panel
 *
 * Features:
 * - Animated horizontal bar charts
 * - Values oscillate within safe ranges
 * - Color coding for warnings
 */

import {
  BoxRenderable,
  TextRenderable,
  type CliRenderer,
  t,
  bold,
  fg,
} from "@opentui/core";
import { nostromoTheme as theme } from "../theme";

interface LifeSupportMetric {
  name: string;
  value: number;
  min: number;
  max: number;
  warningLow: number;
  warningHigh: number;
  unit: string;
}

const metrics: LifeSupportMetric[] = [
  { name: "O2 LEVEL", value: 21.0, min: 19, max: 23, warningLow: 19.5, warningHigh: 22.5, unit: "%" },
  { name: "CO2 SCRUB", value: 98.0, min: 85, max: 100, warningLow: 90, warningHigh: 100, unit: "%" },
  { name: "PRESSURE", value: 101.3, min: 95, max: 105, warningLow: 98, warningHigh: 103, unit: "kPa" },
  { name: "TEMP", value: 4.2, min: 2, max: 8, warningLow: 3, warningHigh: 6, unit: "C" },
  { name: "HUMIDITY", value: 45.0, min: 30, max: 60, warningLow: 35, warningHigh: 55, unit: "%" },
];

export function createLifeSupportPanel(renderer: CliRenderer): {
  container: BoxRenderable;
  update: (time: number) => void;
} {
  // Panel container
  const container = new BoxRenderable(renderer, {
    id: "life-support-panel",
    flexDirection: "column",
    border: true,
    borderStyle: "single",
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bg,
    padding: 0,
    overflow: "hidden",
  });

  // Title bar
  const titleBar = new BoxRenderable(renderer, {
    id: "ls-title-bar",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingLeft: 1,
    paddingRight: 1,
    backgroundColor: theme.colors.bgAlt,
  });

  const title = new TextRenderable(renderer, {
    id: "ls-title",
    content: t`${bold(fg(theme.colors.fg)("LIFE SUPPORT"))}`,
  });

  const status = new TextRenderable(renderer, {
    id: "ls-status",
    content: "NOMINAL ".padEnd(8),
    fg: theme.colors.success,
  });

  titleBar.add(title);
  titleBar.add(status);

  // Metrics container
  const metricsContainer = new BoxRenderable(renderer, {
    id: "ls-metrics",
    flexDirection: "column",
    padding: 1,
    gap: 1,
    flexGrow: 1,
    overflow: "hidden",
  });

  // Create metric displays
  interface MetricDisplay {
    label: TextRenderable;
    bar: TextRenderable;
    value: TextRenderable;
  }

  const metricDisplays: MetricDisplay[] = metrics.map((metric, i) => {
    const row = new BoxRenderable(renderer, {
      id: `ls-metric-${i}`,
      flexDirection: "column",
    });

    const topRow = new BoxRenderable(renderer, {
      id: `ls-metric-top-${i}`,
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
    });

    const label = new TextRenderable(renderer, {
      id: `ls-label-${i}`,
      content: metric.name,
      fg: theme.colors.fgMuted,
    });

    const value = new TextRenderable(renderer, {
      id: `ls-value-${i}`,
      content: `${metric.value.toFixed(1)}${metric.unit}`,
      fg: theme.colors.fg,
    });

    topRow.add(label);
    topRow.add(value);

    const bar = new TextRenderable(renderer, {
      id: `ls-bar-${i}`,
      content: "",
      fg: theme.colors.success,
    });

    row.add(topRow);
    row.add(bar);
    metricsContainer.add(row);

    return { label, bar, value };
  });

  container.add(titleBar);
  container.add(metricsContainer);

  // Current values (will oscillate) and previous values for trend
  const currentValues = metrics.map((m) => m.value);
  const previousValues = metrics.map((m) => m.value);

  function makeBar(value: number, min: number, max: number, width: number): string {
    const normalized = (value - min) / (max - min);
    const filled = Math.floor(normalized * width);
    return "█".repeat(Math.max(0, Math.min(width, filled))) +
           "░".repeat(Math.max(0, width - filled));
  }

  // Multi-stage color gradient matching reference aesthetic
  function getBarColor(value: number, metric: LifeSupportMetric): string {
    const range = metric.max - metric.min;
    const normalizedLow = (metric.warningLow - metric.min) / range;
    const normalizedHigh = (metric.warningHigh - metric.min) / range;
    const normalized = (value - metric.min) / range;

    // Critical low (below warning threshold) - blue/cyan for cold
    if (value < metric.warningLow) {
      return theme.colors.accent5; // Blue - cold/low
    }
    // Critical high (above max threshold) - red
    if (value > metric.max * 0.95) {
      return theme.colors.accent7; // Hot red - critical
    }
    // High warning - amber/orange
    if (value > metric.warningHigh) {
      return theme.colors.warning; // Amber - warning
    }
    // Nominal - green (with cyan tint for lower nominal)
    if (normalized < 0.4) {
      return theme.colors.accent2; // Cyan-ish for lower nominal
    }
    return theme.colors.success; // Green - nominal
  }

  // Get trend indicator based on rate of change
  function getTrendIndicator(current: number, previous: number): string {
    const diff = current - previous;
    const threshold = 0.05;
    if (diff > threshold) return "↑";
    if (diff < -threshold) return "↓";
    return "→";
  }

  function update(time: number) {
    let hasWarning = false;
    let hasCritical = false;

    metrics.forEach((metric, i) => {
      // Store previous value for trend
      previousValues[i] = currentValues[i];

      // Oscillate value using sine wave with different frequencies
      const freq = 0.3 + i * 0.1;
      const amplitude = (metric.max - metric.min) * 0.15;
      const center = (metric.max + metric.min) / 2;
      const newValue = center + Math.sin(time * freq + i) * amplitude;

      currentValues[i] = newValue;

      // Update display
      const display = metricDisplays[i];
      const trend = getTrendIndicator(newValue, previousValues[i]);
      display.value.content = `${newValue.toFixed(1)}${metric.unit} ${trend}`;
      display.bar.content = makeBar(newValue, metric.min, metric.max, 18);

      const color = getBarColor(newValue, metric);
      display.bar.fg = color;
      display.value.fg = color;

      if (color === theme.colors.accent7) {
        hasCritical = true;
      } else if (color === theme.colors.warning || color === theme.colors.accent5) {
        hasWarning = true;
      }
    });

    // Update overall status with multi-level (padded to fixed width)
    if (hasCritical) {
      status.content = "CRITICAL".padEnd(8);
      status.fg = theme.colors.error;
    } else if (hasWarning) {
      status.content = "CAUTION ".padEnd(8);
      status.fg = theme.colors.warning;
    } else {
      status.content = "NOMINAL ".padEnd(8);
      status.fg = theme.colors.success;
    }
  }

  return { container, update };
}
