/**
 * Filename: ProgressBar.tsx
 * Folder: /components/ui/
 */

interface ProgressBarProps {
  value: number;
  max?: number;
  width?: number;
  showPercentage?: boolean;
  color?: string;
  label?: string;
}

export function ProgressBar({
  value,
  max = 100,
  width = 40,
  showPercentage = true,
  color = "cyan",
  label,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const filledWidth = Math.floor((percentage / 100) * width);
  const emptyWidth = width - filledWidth;

  const getColor = () => {
    if (percentage >= 90) return "red";
    if (percentage >= 70) return "yellow";
    return color;
  };

  return (
    <box style={{ flexDirection: "column", gap: 0 }}>
      {label && <text>{label}</text>}
      <box style={{ flexDirection: "row" }}>
        <box
          style={{ backgroundColor: getColor(), width: filledWidth, height: 1 }}
        />
        <box
          style={{ backgroundColor: "#333333", width: emptyWidth, height: 1 }}
        />
        {showPercentage && (
          <text style={{ marginLeft: 1 }}>{percentage.toFixed(1)}%</text>
        )}
      </box>
    </box>
  );
}
