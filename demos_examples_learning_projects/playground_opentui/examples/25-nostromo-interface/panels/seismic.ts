/**
 * Seismic Analyzer Panel
 *
 * Features:
 * - 24 vertical waveform bars using Unicode height characters
 * - Frequency bands: LOW, MID, HIGH
 * - Color gradient based on activity level
 * - Easter egg: Spike pattern when motion tracker anomaly detected
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
import { nostromoEvents } from "../lib/events";

const BAR_CHARS = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
const NUM_BARS = 28;  // Increased from 20 for wider visual display

interface SeismicBar {
  frequency: number; // Speed of oscillation
  phase: number; // Offset
  band: "LOW" | "MID" | "HIGH";
  baseHeight: number; // 0-7
}

export function createSeismicPanel(renderer: CliRenderer): {
  container: BoxRenderable;
  update: (time: number) => void;
} {
  // Panel container
  const container = new BoxRenderable(renderer, {
    id: "seismic-panel",
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
    id: "seismic-title-bar",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingLeft: 1,
    paddingRight: 1,
    backgroundColor: theme.colors.bgAlt,
  });

  const title = new TextRenderable(renderer, {
    id: "seismic-title",
    content: t`${bold(fg(theme.colors.fg)("▓ SEISMIC ANALYZER ▓"))}`,  // Visual flair
  });

  const statusText = new TextRenderable(renderer, {
    id: "seismic-status",
    content: "NOMINAL".padEnd(7),
    fg: theme.colors.success,
  });

  titleBar.add(title);
  titleBar.add(statusText);

  // Content area
  const content = new BoxRenderable(renderer, {
    id: "seismic-content",
    flexDirection: "column",
    padding: 1,
    gap: 0,
    flexGrow: 1,
    overflow: "hidden",
  });

  // Band labels
  const bandLabels = new TextRenderable(renderer, {
    id: "seismic-bands",
    content: "LOW    MID    HIGH",
    fg: theme.colors.fgMuted,
  });

  // Waveform display line
  const waveformDisplay = new TextRenderable(renderer, {
    id: "seismic-waveform",
    content: "",
    fg: theme.colors.fg,
  });

  // Band activity indicators
  const bandActivity = new TextRenderable(renderer, {
    id: "seismic-activity",
    content: "◆ LOW  ◆ MID  ◆ HIGH",
    fg: theme.colors.fgMuted,
  });

  // Frequency readout
  const freqReadout = new TextRenderable(renderer, {
    id: "seismic-freq",
    content: "FREQ: 0.00 Hz  AMP: 0.0 dB",
    fg: theme.colors.fgMuted,
  });

  content.add(bandLabels);
  content.add(waveformDisplay);
  content.add(bandActivity);
  content.add(freqReadout);

  container.add(titleBar);
  container.add(content);

  // Initialize bars with different frequencies and phases
  const bars: SeismicBar[] = [];
  for (let i = 0; i < NUM_BARS; i++) {
    const bandIndex = Math.floor(i / (NUM_BARS / 3));
    const band: "LOW" | "MID" | "HIGH" =
      bandIndex === 0 ? "LOW" : bandIndex === 1 ? "MID" : "HIGH";

    bars.push({
      frequency: 0.5 + Math.random() * 2, // 0.5-2.5 Hz
      phase: Math.random() * Math.PI * 2,
      band,
      baseHeight: 1 + Math.floor(Math.random() * 3), // 1-3 (was 2-4, allows more variation)
    });
  }

  // Anomaly state
  let anomalyActive = false;
  let anomalyEndTime = 0;

  // Subscribe to anomaly events
  nostromoEvents.on("anomalyDetected", () => {
    anomalyActive = true;
    anomalyEndTime = Date.now() + 3000; // 3 seconds of spike
    statusText.content = "ANOMALY".padEnd(7);
    statusText.fg = theme.colors.error;
  });

  nostromoEvents.on("anomalyCleared", () => {
    // Will naturally clear after anomalyEndTime
  });

  // Enhanced color gradient based on height (cyan → green → amber → red)
  function getBarColor(height: number, band: string): string {
    // Height-based gradient matching reference aesthetic
    if (height >= 7) return theme.colors.accent7; // Hot red - max
    if (height >= 6) return theme.colors.accent4; // Orange - very high
    if (height >= 5) return theme.colors.warning; // Amber - high
    if (height >= 4) return theme.colors.success; // Green - nominal
    if (height >= 2) return theme.colors.accent2; // Cyan - low
    return theme.colors.accent8; // Muted cyan - very low
  }

  // Band-specific base colors
  const BAND_COLORS = {
    LOW: theme.colors.accent8,  // Muted cyan
    MID: theme.colors.success,  // Green
    HIGH: theme.colors.accent2, // Cyan
  };

  function update(time: number) {
    // Check if anomaly expired
    if (anomalyActive && Date.now() > anomalyEndTime) {
      anomalyActive = false;
      statusText.content = "NOMINAL".padEnd(7);
      statusText.fg = theme.colors.success;
    }

    // Build waveform string and track band peaks
    let waveform = "";
    let maxHeight = 0;
    const bandPeaks = { LOW: 0, MID: 0, HIGH: 0 };

    bars.forEach((bar, i) => {
      let height: number;

      if (anomalyActive) {
        // During anomaly: erratic spike pattern
        const spike = Math.sin(time * 15 + i * 0.5) * 0.5 + 0.5;
        const chaos = Math.random() * 0.3;
        height = Math.floor((spike + chaos) * 7);
      } else {
        // Normal: smooth sine wave oscillation
        const wave = Math.sin(time * bar.frequency + bar.phase);
        const normalizedWave = (wave + 1) / 2; // 0-1
        height = Math.floor(
          bar.baseHeight + normalizedWave * (7 - bar.baseHeight)
        );
      }

      height = Math.max(0, Math.min(7, height));
      maxHeight = Math.max(maxHeight, height);
      bandPeaks[bar.band] = Math.max(bandPeaks[bar.band], height);

      waveform += BAR_CHARS[height];
    });

    waveformDisplay.content = waveform;

    // Dynamic color based on overall activity level
    if (anomalyActive) {
      waveformDisplay.fg = theme.colors.error;
    } else if (maxHeight >= 7) {
      waveformDisplay.fg = theme.colors.accent7; // Hot red
    } else if (maxHeight >= 6) {
      waveformDisplay.fg = theme.colors.accent4; // Orange
    } else if (maxHeight >= 5) {
      waveformDisplay.fg = theme.colors.warning; // Amber
    } else if (maxHeight >= 4) {
      waveformDisplay.fg = theme.colors.success; // Green
    } else {
      waveformDisplay.fg = theme.colors.accent2; // Cyan
    }

    // Update band activity indicators with per-band colors
    const getLowColor = getBarColor(bandPeaks.LOW, "LOW");
    const getMidColor = getBarColor(bandPeaks.MID, "MID");
    const getHighColor = getBarColor(bandPeaks.HIGH, "HIGH");

    // Show peak levels per band
    const lowPeak = BAR_CHARS[Math.min(7, bandPeaks.LOW)];
    const midPeak = BAR_CHARS[Math.min(7, bandPeaks.MID)];
    const highPeak = BAR_CHARS[Math.min(7, bandPeaks.HIGH)];
    bandActivity.content = `${lowPeak} LOW   ${midPeak} MID   ${highPeak} HIGH`;

    // Color based on highest band
    const highestPeak = Math.max(bandPeaks.LOW, bandPeaks.MID, bandPeaks.HIGH);
    bandActivity.fg = getBarColor(highestPeak, "MID");

    // Update frequency readout (simulated dominant frequency)
    const dominantFreq = anomalyActive
      ? 8.5 + Math.random() * 4
      : 1.2 + Math.sin(time * 0.3) * 0.8;
    const amplitude = anomalyActive
      ? -3 + Math.random() * 6
      : -12 + maxHeight * 2;
    freqReadout.content = `FREQ: ${dominantFreq.toFixed(2)} Hz  AMP: ${amplitude.toFixed(1)} dB`;

    // Color frequency readout based on activity
    freqReadout.fg = anomalyActive ? theme.colors.error : theme.colors.fgMuted;
  }

  return { container, update };
}
