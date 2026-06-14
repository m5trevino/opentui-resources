import { useKeyboard } from "@opentui/react";
import { useAppContext } from "../contexts/AppContext";
import type { Filter } from "../types";

const tabs: Array<{ label: string; value: Filter; key: string }> = [
	{ label: "All", value: "all", key: "1" },
	{ label: "Active", value: "active", key: "2" },
	{ label: "Completed", value: "completed", key: "3" },
];

interface FilterTabsProps {
	focused: boolean;
}

export function FilterTabs({ focused }: FilterTabsProps) {
	const { filter, setFilter } = useAppContext();

	useKeyboard((key) => {
		// 只在列表获得焦点时才响应过滤键
		if (!focused) return;

		if (key.name === "1") setFilter("all");
		if (key.name === "2") setFilter("active");
		if (key.name === "3") setFilter("completed");
	});

	return (
		<box
			style={{
				width: "100%",
				padding: 1,
				backgroundColor: "black",
				borderStyle: "single",
				borderColor: "yellow",
				flexDirection: "row",
				justifyContent: "space-around",
			}}
		>
			<text fg="gray" style={{ marginRight: 2 }}>
				<strong>Filter:</strong>
			</text>

			{tabs.map((tab) => {
				const isActive = filter === tab.value;
				return (
					<box
						key={tab.value}
						style={{
							padding: 0,
							paddingLeft: 2,
							paddingRight: 2,
							backgroundColor: isActive ? "yellow" : "black",
							marginRight: 1,
						}}
					>
						<text fg={isActive ? "black" : "yellow"}>
							<strong>{`[${tab.key}] ${tab.label}`}</strong>
						</text>
					</box>
				);
			})}
		</box>
	);
}
