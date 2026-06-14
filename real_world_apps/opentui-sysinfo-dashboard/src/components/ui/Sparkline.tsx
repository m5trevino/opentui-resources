/**
 * Filename: Sparkline.tsx
 * Folder: /components/ui/
 */

interface SparklineProps {
  data: number[];
  width: number;
  height: number;
  color?: string;
  label?: string;
}

export function Sparkline({
  data,
  width,
  height,
  color = "cyan",
  label,
}: SparklineProps) {
  if (data.length === 0) {
    return (
      <box style={{ width, height }}>
        <text fg="gray">No data</text>
      </box>
    );
  }

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  // Create ASCII sparkline
  const chars = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
  const sparkline = data
    .slice(-width)
    .map((value) => {
      const normalized = (value - min) / range;
      const index = Math.floor(normalized * (chars.length - 1));
      return chars[Math.max(0, Math.min(chars.length - 1, index))];
    })
    .join("");

  return (
    <box style={{ flexDirection: "column" }}>
      {label && (
        <text>
          {label}: <span fg={color}>{data[data.length - 1]?.toFixed(1)}%</span>
        </text>
      )}
      <text fg={color}>{sparkline}</text>
    </box>
  );
}
