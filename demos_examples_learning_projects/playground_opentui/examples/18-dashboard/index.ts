/**
 * Example 17: Dashboard
 *
 * Demonstrates a multi-panel monitoring dashboard:
 * - Real-time stats display
 * - ASCII charts
 * - Multiple panels layout
 * - Live data simulation
 */

import {
  TextRenderable,
  BoxRenderable,
  t,
  bold,
  fg,
} from "@opentui/core";
import { theme } from "@shared/themes";
import { createExampleApp } from "@shared/utils/example-app";
import { createHeader } from "@shared/widgets/Header";
import { createKeyBindingBar } from "@shared/widgets/KeyBindingBar";

createExampleApp(({ renderer, addInterval }) => {
  // Simulated data
  let cpuUsage = 45;
  let memoryUsage = 62;
  let networkIn = 125;
  let networkOut = 89;
  let requestsPerSec = 1250;
  let errorRate = 0.5;
  const cpuHistory: number[] = Array(20).fill(45);
  const memHistory: number[] = Array(20).fill(62);

  // Main container
  const main = new BoxRenderable(renderer, {
    id: "main",
    width: "100%",
    height: "100%",
    flexDirection: "column",
    padding: 1,
    gap: 1,
  });

  // Header
  const header = createHeader(renderer, {
    theme,
    title: "System Dashboard",
    rightContent: new Date().toLocaleTimeString(),
    paddingBottom: 1,
  });

  const timeDisplay = header;

  // Top row - CPU and Memory
  const topRow = new BoxRenderable(renderer, {
    id: "top-row",
    flexDirection: "row",
    gap: 2,
    width: "100%",
  });

  // CPU Panel
  const cpuPanel = new BoxRenderable(renderer, {
    id: "cpu-panel",
    flexGrow: 1,
    flexDirection: "column",
    padding: 1,
    border: true,
    borderStyle: "rounded",
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bgAlt,
  });

  const cpuTitle = new TextRenderable(renderer, {
    id: "cpu-title",
    content: t`${bold(fg(theme.colors.accent3)("CPU Usage"))}`,
  });

  const cpuValue = new TextRenderable(renderer, {
    id: "cpu-value",
    content: `${cpuUsage}%`,
    fg: theme.colors.fg,
  });

  const cpuBar = new TextRenderable(renderer, {
    id: "cpu-bar",
    content: "",
    fg: theme.colors.success,
  });

  const cpuChart = new BoxRenderable(renderer, {
    id: "cpu-chart",
    flexDirection: "column",
    height: 5,
    marginTop: 1,
  });

  const cpuChartLines: TextRenderable[] = [];
  for (let i = 0; i < 5; i++) {
    const line = new TextRenderable(renderer, {
      id: `cpu-chart-${i}`,
      content: "",
      fg: theme.colors.accent3,
    });
    cpuChartLines.push(line);
    cpuChart.add(line);
  }

  cpuPanel.add(cpuTitle);
  cpuPanel.add(cpuValue);
  cpuPanel.add(cpuBar);
  cpuPanel.add(cpuChart);

  // Memory Panel
  const memPanel = new BoxRenderable(renderer, {
    id: "mem-panel",
    flexGrow: 1,
    flexDirection: "column",
    padding: 1,
    border: true,
    borderStyle: "rounded",
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bgAlt,
  });

  const memTitle = new TextRenderable(renderer, {
    id: "mem-title",
    content: t`${bold(fg(theme.colors.accent1)("Memory Usage"))}`,
  });

  const memValue = new TextRenderable(renderer, {
    id: "mem-value",
    content: `${memoryUsage}% (4.9 GB / 8 GB)`,
    fg: theme.colors.fg,
  });

  const memBar = new TextRenderable(renderer, {
    id: "mem-bar",
    content: "",
    fg: theme.colors.accent1,
  });

  const memChart = new BoxRenderable(renderer, {
    id: "mem-chart",
    flexDirection: "column",
    height: 5,
    marginTop: 1,
  });

  const memChartLines: TextRenderable[] = [];
  for (let i = 0; i < 5; i++) {
    const line = new TextRenderable(renderer, {
      id: `mem-chart-${i}`,
      content: "",
      fg: theme.colors.accent1,
    });
    memChartLines.push(line);
    memChart.add(line);
  }

  memPanel.add(memTitle);
  memPanel.add(memValue);
  memPanel.add(memBar);
  memPanel.add(memChart);

  topRow.add(cpuPanel);
  topRow.add(memPanel);

  // Middle row - Network and Requests
  const middleRow = new BoxRenderable(renderer, {
    id: "middle-row",
    flexDirection: "row",
    gap: 2,
    width: "100%",
  });

  // Network Panel
  const netPanel = new BoxRenderable(renderer, {
    id: "net-panel",
    flexGrow: 1,
    flexDirection: "column",
    padding: 1,
    border: true,
    borderStyle: "rounded",
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bgAlt,
  });

  const netTitle = new TextRenderable(renderer, {
    id: "net-title",
    content: t`${bold(fg(theme.colors.accent4)("Network I/O"))}`,
  });

  const netIn = new TextRenderable(renderer, {
    id: "net-in",
    content: `In:  ${networkIn} KB/s`,
    fg: theme.colors.success,
  });

  const netOut = new TextRenderable(renderer, {
    id: "net-out",
    content: `Out: ${networkOut} KB/s`,
    fg: theme.colors.accent5,
  });

  netPanel.add(netTitle);
  netPanel.add(netIn);
  netPanel.add(netOut);

  // Requests Panel
  const reqPanel = new BoxRenderable(renderer, {
    id: "req-panel",
    flexGrow: 1,
    flexDirection: "column",
    padding: 1,
    border: true,
    borderStyle: "rounded",
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bgAlt,
  });

  const reqTitle = new TextRenderable(renderer, {
    id: "req-title",
    content: t`${bold(fg(theme.colors.accent6)("HTTP Requests"))}`,
  });

  const reqValue = new TextRenderable(renderer, {
    id: "req-value",
    content: `${requestsPerSec} req/s`,
    fg: theme.colors.fg,
  });

  const reqError = new TextRenderable(renderer, {
    id: "req-error",
    content: `Error rate: ${errorRate.toFixed(2)}%`,
    fg: errorRate > 1 ? theme.colors.error : theme.colors.success,
  });

  reqPanel.add(reqTitle);
  reqPanel.add(reqValue);
  reqPanel.add(reqError);

  middleRow.add(netPanel);
  middleRow.add(reqPanel);

  // Bottom row - Services status
  const bottomRow = new BoxRenderable(renderer, {
    id: "bottom-row",
    flexDirection: "column",
    padding: 1,
    border: true,
    borderStyle: "rounded",
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bgAlt,
    width: "100%",
  });

  const servicesTitle = new TextRenderable(renderer, {
    id: "services-title",
    content: t`${bold(fg(theme.colors.accent2)("Services Status"))}`,
  });

  const services = [
    { name: "API Server", status: "healthy", latency: "12ms" },
    { name: "Database", status: "healthy", latency: "3ms" },
    { name: "Cache", status: "healthy", latency: "1ms" },
    { name: "Queue", status: "degraded", latency: "45ms" },
    { name: "Storage", status: "healthy", latency: "8ms" },
  ];

  const servicesRow = new BoxRenderable(renderer, {
    id: "services-row",
    flexDirection: "row",
    gap: 3,
    flexWrap: "wrap",
  });

  const serviceRenderables: TextRenderable[] = [];
  services.forEach((service, i) => {
    const statusIcon =
      service.status === "healthy"
        ? "●"
        : service.status === "degraded"
        ? "◐"
        : "○";
    const color =
      service.status === "healthy"
        ? theme.colors.success
        : service.status === "degraded"
        ? theme.colors.warning
        : theme.colors.error;

    const text = new TextRenderable(renderer, {
      id: `service-${i}`,
      content: `${statusIcon} ${service.name} (${service.latency})`,
      fg: color,
    });
    serviceRenderables.push(text);
    servicesRow.add(text);
  });

  bottomRow.add(servicesTitle);
  bottomRow.add(servicesRow);

  // Instructions
  const instructions = createKeyBindingBar(
    renderer,
    [
      { key: "q", action: "Exit" },
      { key: "", action: "Data refreshes automatically" },
    ],
    { theme, id: "instructions" }
  );
  instructions.marginTop = 1;

  // Build tree
  main.add(header.getContainer());
  main.add(topRow);
  main.add(middleRow);
  main.add(bottomRow);
  main.add(instructions);
  renderer.root.add(main);

  // Helper functions
  function makeBar(value: number, width: number, filled: string, empty: string): string {
    const filledCount = Math.floor((value / 100) * width);
    return filled.repeat(filledCount) + empty.repeat(width - filledCount);
  }

  function makeChart(history: number[], height: number): string[] {
    const lines: string[] = [];
    for (let row = height - 1; row >= 0; row--) {
      const threshold = ((row + 1) / height) * 100;
      let line = "";
      for (const val of history) {
        line += val >= threshold ? "█" : " ";
      }
      lines.push(line);
    }
    return lines;
  }

  function getBarColor(value: number): string {
    if (value < 50) return theme.colors.success;
    if (value < 80) return theme.colors.warning;
    return theme.colors.error;
  }

  function updateDashboard() {
    // Simulate data changes
    cpuUsage = Math.max(5, Math.min(95, cpuUsage + (Math.random() - 0.5) * 10));
    memoryUsage = Math.max(30, Math.min(90, memoryUsage + (Math.random() - 0.5) * 5));
    networkIn = Math.max(10, Math.min(500, networkIn + (Math.random() - 0.5) * 50));
    networkOut = Math.max(10, Math.min(300, networkOut + (Math.random() - 0.5) * 30));
    requestsPerSec = Math.max(100, Math.min(5000, requestsPerSec + (Math.random() - 0.5) * 200));
    errorRate = Math.max(0, Math.min(5, errorRate + (Math.random() - 0.5) * 0.5));

    // Update history
    cpuHistory.shift();
    cpuHistory.push(cpuUsage);
    memHistory.shift();
    memHistory.push(memoryUsage);

    // Update time
    timeDisplay.setRightContent(new Date().toLocaleTimeString());

    // Update CPU
    cpuValue.content = `${Math.round(cpuUsage)}%`;
    cpuBar.content = makeBar(cpuUsage, 30, "█", "░");
    cpuBar.fg = getBarColor(cpuUsage);
    const cpuChartData = makeChart(cpuHistory, 5);
    cpuChartLines.forEach((line, i) => {
      line.content = cpuChartData[i];
    });

    // Update Memory
    const memGB = (memoryUsage / 100 * 8).toFixed(1);
    memValue.content = `${Math.round(memoryUsage)}% (${memGB} GB / 8 GB)`;
    memBar.content = makeBar(memoryUsage, 30, "█", "░");
    memBar.fg = getBarColor(memoryUsage);
    const memChartData = makeChart(memHistory, 5);
    memChartLines.forEach((line, i) => {
      line.content = memChartData[i];
    });

    // Update Network
    netIn.content = `In:  ${Math.round(networkIn)} KB/s`;
    netOut.content = `Out: ${Math.round(networkOut)} KB/s`;

    // Update Requests
    reqValue.content = `${Math.round(requestsPerSec)} req/s`;
    reqError.content = `Error rate: ${errorRate.toFixed(2)}%`;
    reqError.fg = errorRate > 1 ? theme.colors.error : theme.colors.success;

    // Randomly update service status
    if (Math.random() < 0.1) {
      const serviceIdx = Math.floor(Math.random() * services.length);
      services[serviceIdx].status =
        Math.random() < 0.8 ? "healthy" : "degraded";
      services[serviceIdx].latency = `${Math.floor(Math.random() * 50 + 1)}ms`;

      const statusIcon =
        services[serviceIdx].status === "healthy" ? "●" : "◐";
      const color =
        services[serviceIdx].status === "healthy"
          ? theme.colors.success
          : theme.colors.warning;

      serviceRenderables[serviceIdx].content = `${statusIcon} ${services[serviceIdx].name} (${services[serviceIdx].latency})`;
      serviceRenderables[serviceIdx].fg = color;
    }
  }

  // Initial update
  updateDashboard();

  // Update loop - register for auto cleanup
  addInterval(setInterval(updateDashboard, 1000));
});
