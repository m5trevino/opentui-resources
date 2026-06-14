/**
 * Filename: HelpScreen.tsx
 * Folder: /components/
 */

import { BoxPanel } from "./ui/BoxPanel";

interface HelpScreenProps {
  width: number;
  height: number;
}

export function HelpScreen({ width, height }: HelpScreenProps) {
  return (
    <BoxPanel
      title="Help - Keyboard Shortcuts"
      style={{
        width: width - 2,
        height: height - 2,
        flexDirection: "column",
        gap: 1,
        padding: 2,
      }}
    >
      <text fg="cyan">
        <strong>Navigation</strong>
      </text>
      <text>
        <span fg="yellow">[1]</span> - Dashboard (or click tab)
      </text>
      <text>
        <span fg="yellow">[2]</span> - Process List (or click tab)
      </text>
      <text>
        <span fg="yellow">[3]</span> - Settings (or click tab)
      </text>
      <text>
        <span fg="yellow">[?]</span> - Help (this screen)
      </text>

      <text fg="cyan" style={{ marginTop: 1 }}>
        <strong>Actions</strong>
      </text>
      <text>
        <span fg="yellow">[Q]</span> - Quit application
      </text>
      <text>
        <span fg="yellow">[R]</span> - Refresh data
      </text>
      <text>
        <span fg="yellow">[S]</span> - Change sort order (Process List)
      </text>
      <text>
        <span fg="yellow">[F]</span> - Filter processes (Process List)
      </text>

      <text fg="cyan" style={{ marginTop: 1 }}>
        <strong>Settings</strong>
      </text>
      <text>
        <span fg="yellow">[T]</span> - Change theme
      </text>
      <text>
        <span fg="yellow">[+/-]</span> - Adjust refresh interval
      </text>

      <text fg="cyan" style={{ marginTop: 1 }}>
        <strong>Mouse Support</strong>
      </text>
      <text>
        <span fg="yellow">Click</span> - Tab navigation
      </text>
      <text>
        <span fg="yellow">Click</span> - Dialog buttons (Yes/No)
      </text>
      <text>
        <span fg="yellow">Click</span> - Backdrop to cancel dialogs
      </text>

      <text fg="gray" style={{ marginTop: 2 }}>
        Press any key to return to the dashboard
      </text>
    </BoxPanel>
  );
}
