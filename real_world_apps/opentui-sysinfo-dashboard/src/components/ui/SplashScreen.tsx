import { useTerminalDimensions, useTimeline } from "@opentui/react";
import { useEffect, useState } from "react";

export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [done, setDone] = useState(false);
  const { width, height } = useTerminalDimensions();
  const timeline = useTimeline({
    duration: 1200,
    onComplete: () => setDone(true),
  });

  useEffect(() => {
    if (done) {
      onFinish();
    }
  }, [done, onFinish]);

  return (
    <box
      style={{
        width,
        height,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <text fg="cyan">Loading TUI Dashboard...</text>
    </box>
  );
}
