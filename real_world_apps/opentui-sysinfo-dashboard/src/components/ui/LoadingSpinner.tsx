/**
 * Filename: LoadingSpinner.tsx
 * Folder: /components/ui/
 */

import { useEffect, useState } from "react";

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({
  message = "Loading...",
}: LoadingSpinnerProps) {
  const [frame, setFrame] = useState(0);
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % frames.length);
    }, 80);

    return () => clearInterval(interval);
  }, []);

  return (
    <box style={{ flexDirection: "row", gap: 1, alignItems: "center" }}>
      <text fg="cyan">{frames[frame]}</text>
      <text>{message}</text>
    </box>
  );
}
