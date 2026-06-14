import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import { useState } from "react";
import { commandBus } from "../core/commandBus";
import { logger } from "../core/logger";
import { themes } from "../domain/entities/Theme";
import { useActiveTab } from "../hooks/useActiveTab";
import { useSettings } from "../hooks/useSettings";
import { Dashboard } from "./Dashboard";
import { HelpScreen } from "./HelpScreen";
import { ProcessListInteractive } from "./ProcessListInteractive";
import { Settings } from "./Settings";
import { SplashScreen } from "./ui/SplashScreen";
import { StatusBar } from "./ui/StatusBar";
import { TabNavigation } from "./ui/TabNavigation";

export function App() {
  const { tab, setTab } = useActiveTab();
  const { width, height } = useTerminalDimensions();
  const { settings, updateSettings } = useSettings();
  const [loaded, setLoaded] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const currentTheme = themes[settings.theme] || themes.default;
  // Register global commands
  commandBus.register("q", () => {
    logger.log("Quit application");
    process.exit(0);
  });
  commandBus.register("1", () => {
    setTab("dashboard");
    setShowHelp(false);
  });
  commandBus.register("2", () => {
    setTab("processes");
    setShowHelp(false);
  });
  commandBus.register("3", () => {
    setTab("settings");
    setShowHelp(false);
  });
  commandBus.register("?", () => setShowHelp(!showHelp));
  commandBus.register("h", () => setShowHelp(!showHelp));

  // Theme cycling
  commandBus.register("t", () => {
    const themeNames = Object.keys(themes);
    const currentIndex = themeNames.indexOf(settings.theme);
    const nextIndex = (currentIndex + 1) % themeNames.length;
    updateSettings({ theme: themeNames[nextIndex] });
  });

  // Refresh interval adjustment
  commandBus.register("+", () => {
    updateSettings({
      refreshInterval: Math.max(100, settings.refreshInterval - 100),
    });
  });
  commandBus.register("-", () => {
    updateSettings({
      refreshInterval: Math.min(10000, settings.refreshInterval + 100),
    });
  });

  // Refresh data
  commandBus.register("r", () => {
    logger.log("Refreshing data...");
  });

  // Keyboard binding
  useKeyboard((key) => {
    if (showHelp) {
      setShowHelp(false);
      return;
    }
    commandBus.execute(key.name);
  });

  if (!loaded) {
    return <SplashScreen onFinish={() => setLoaded(true)} />;
  }

  return (
    <box
      style={{
        flexDirection: "column",
        width,
        height,
        padding: 1,
      }}
    >
      <TabNavigation active={tab} onSelect={setTab} />

      <box style={{ flexGrow: 1, width: "100%" }}>
        {showHelp ? (
          <HelpScreen width={width} height={height - 5} />
        ) : (
          <>
            {tab === "dashboard" && (
              <Dashboard width={width} height={height - 5} />
            )}
            {tab === "processes" && (
              <ProcessListInteractive width={width} height={height - 5} />
            )}
            {tab === "settings" && (
              <Settings width={width} height={height - 5} />
            )}
          </>
        )}
      </box>

      {settings.showSystemInfo && <StatusBar width={width} />}

      <text fg={currentTheme.colors.muted} style={{ marginTop: 0 }}>
        [1] Dashboard | [2] Processes | [3] Settings | [?] Help | [T] Theme |
        [Q] Quit
      </text>
    </box>
  );
}
