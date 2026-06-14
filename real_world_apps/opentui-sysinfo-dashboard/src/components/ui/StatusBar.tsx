/**
 * Filename: StatusBar.tsx
 * Folder: /components/ui/
 */

import os from "os";
import { useEffect, useState } from "react";

interface StatusBarProps {
  width: number;
}

export function StatusBar({ width }: StatusBarProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hostname = os.hostname();
  const platform = os.platform();
  const uptime = Math.floor(os.uptime() / 60);
  const timeStr = time.toLocaleTimeString();

  return (
    <box
      style={{
        width,
        height: 1,
        backgroundColor: "#1a1b26",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingLeft: 1,
        paddingRight: 1,
      }}
    >
      <text fg="cyan">
        {hostname} | {platform}
      </text>
      <text fg="gray">
        Uptime: {uptime}m | {timeStr}
      </text>
    </box>
  );
}
