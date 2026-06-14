/**
 * Engine Telemetry Panel
 *
 * Features:
 * - Scrolling hex data stream
 * - Thrust vector display
 * - Reactor temperature gauge
 * - Fuel consumption ticker
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

const HEX_CHARS = "0123456789ABCDEF";

export function createTelemetryPanel(renderer: CliRenderer): {
  container: BoxRenderable;
  update: (time: number) => void;
} {
  // Panel container
  const container = new BoxRenderable(renderer, {
    id: "telemetry-panel",
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
    id: "telem-title-bar",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingLeft: 1,
    paddingRight: 1,
    backgroundColor: theme.colors.bgAlt,
  });

  const title = new TextRenderable(renderer, {
    id: "telem-title",
    content: t`${bold(fg(theme.colors.fg)("ENGINE TELEMETRY"))}`,
  });

  const statusIndicator = new TextRenderable(renderer, {
    id: "telem-status",
    content: "ONLINE",
    fg: theme.colors.success,
  });

  titleBar.add(title);
  titleBar.add(statusIndicator);

  // Content area
  const content = new BoxRenderable(renderer, {
    id: "telem-content",
    flexDirection: "column",
    padding: 1,
    gap: 1,
    flexGrow: 1,
    overflow: "hidden",
  });

  // Hex data stream (multiple lines)
  const hexContainer = new BoxRenderable(renderer, {
    id: "telem-hex-container",
    flexDirection: "column",
  });

  const hexLabel = new TextRenderable(renderer, {
    id: "telem-hex-label",
    content: "DATA STREAM:",
    fg: theme.colors.fgMuted,
  });

  const hexLines: TextRenderable[] = [];
  for (let i = 0; i < 4; i++) {
    const line = new TextRenderable(renderer, {
      id: `telem-hex-${i}`,
      content: generateHexLine(),
      fg: theme.colors.accent2,
    });
    hexLines.push(line);
    hexContainer.add(line);
  }

  // Thrust vector display
  const thrustContainer = new BoxRenderable(renderer, {
    id: "telem-thrust-container",
    flexDirection: "column",
  });

  const thrustLabel = new TextRenderable(renderer, {
    id: "telem-thrust-label",
    content: "THRUST VECTOR:",
    fg: theme.colors.fgMuted,
  });

  const thrustX = new TextRenderable(renderer, {
    id: "telem-thrust-x",
    content: "X: +0.0000",
    fg: theme.colors.fg,
  });

  const thrustY = new TextRenderable(renderer, {
    id: "telem-thrust-y",
    content: "Y: +0.0000",
    fg: theme.colors.fg,
  });

  const thrustZ = new TextRenderable(renderer, {
    id: "telem-thrust-z",
    content: "Z: +0.0000",
    fg: theme.colors.fg,
  });

  thrustContainer.add(thrustLabel);
  thrustContainer.add(thrustX);
  thrustContainer.add(thrustY);
  thrustContainer.add(thrustZ);

  // Reactor temperature
  const reactorContainer = new BoxRenderable(renderer, {
    id: "telem-reactor-container",
    flexDirection: "column",
  });

  const reactorLabel = new TextRenderable(renderer, {
    id: "telem-reactor-label",
    content: "REACTOR:",
    fg: theme.colors.fgMuted,
  });

  const reactorTemp = new TextRenderable(renderer, {
    id: "telem-reactor-temp",
    content: "2847°K ████████░░",
    fg: theme.colors.success,
  });

  reactorContainer.add(reactorLabel);
  reactorContainer.add(reactorTemp);

  // Fuel consumption
  const fuelText = new TextRenderable(renderer, {
    id: "telem-fuel",
    content: "FUEL: 0.042 KG/S",
    fg: theme.colors.fgMuted,
  });

  content.add(hexLabel);
  content.add(hexContainer);
  content.add(thrustContainer);
  content.add(reactorContainer);
  content.add(fuelText);

  container.add(titleBar);
  container.add(content);

  // Hex data buffer
  let hexBuffer: string[] = [];
  for (let i = 0; i < 20; i++) {
    hexBuffer.push(generateHexLine());
  }
  let hexOffset = 0;

  function generateHexLine(): string {
    let line = "";
    for (let i = 0; i < 8; i++) {
      const byte = HEX_CHARS[Math.floor(Math.random() * 16)] +
                   HEX_CHARS[Math.floor(Math.random() * 16)];
      line += byte + " ";
    }
    return line.trim();
  }

  function formatVector(value: number): string {
    const sign = value >= 0 ? "+" : "";
    return sign + value.toFixed(4);
  }

  function makeGauge(value: number, max: number, width: number): string {
    const filled = Math.floor((value / max) * width);
    return "█".repeat(filled) + "░".repeat(width - filled);
  }

  function update(time: number) {
    // Scroll hex data (every ~100ms)
    if (Math.floor(time * 10) !== Math.floor((time - 0.016) * 10)) {
      hexBuffer.push(generateHexLine());
      hexBuffer.shift();
      hexOffset = (hexOffset + 1) % hexBuffer.length;
    }

    // Update hex display
    hexLines.forEach((line, i) => {
      const bufferIndex = (hexOffset + i) % hexBuffer.length;
      line.content = hexBuffer[bufferIndex];
    });

    // Update thrust vectors (small oscillations)
    const vx = Math.sin(time * 0.7) * 0.005;
    const vy = Math.cos(time * 0.5) * 0.003;
    const vz = Math.sin(time * 0.3) * 0.002;

    thrustX.content = `X: ${formatVector(vx)}`;
    thrustY.content = `Y: ${formatVector(vy)}`;
    thrustZ.content = `Z: ${formatVector(vz)}`;

    // Update reactor temperature (stable with minor fluctuation)
    const baseTemp = 2847;
    const tempFluctuation = Math.sin(time * 2) * 15;
    const currentTemp = Math.floor(baseTemp + tempFluctuation);
    const tempNormalized = (currentTemp - 2500) / 1000; // 2500-3500 range
    const gauge = makeGauge(tempNormalized, 1, 10);

    const tempColor = currentTemp > 3200 ? theme.colors.warning :
                      currentTemp > 2900 ? theme.colors.success :
                      theme.colors.accent2;

    reactorTemp.content = `${currentTemp}°K ${gauge}`;
    reactorTemp.fg = tempColor;

    // Update fuel consumption (slight variation)
    const baseFuel = 0.042;
    const fuelVariation = Math.sin(time * 1.5) * 0.003;
    fuelText.content = `FUEL: ${(baseFuel + fuelVariation).toFixed(3)} KG/S`;
  }

  return { container, update };
}
