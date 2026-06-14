import { Tab } from "../../hooks/useActiveTab";

interface TabNavigationProps {
  active: Tab;
  onSelect: (tab: Tab) => void;
}

const tabs: Tab[] = ["dashboard", "processes", "settings"];

export const TabNavigation = ({ active, onSelect }: TabNavigationProps) => (
  <box
    style={{
      flexDirection: "row",
      gap: 3,
      justifyContent: "center",
      marginBottom: 1,
    }}
  >
    {tabs.map((t) => (
      <box key={t} onMouseDown={() => onSelect(t)}>
        <text fg={active === t ? "cyan" : "gray"}>
          {active === t ? (
            <strong>[{t.toUpperCase()}]</strong>
          ) : (
            `[${t.toUpperCase()}]`
          )}
        </text>
      </box>
    ))}
  </box>
);
