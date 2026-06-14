import { useAppContext } from "../contexts/AppContext";

export function Header() {
	const { todos } = useAppContext();

	const activeCount = todos.filter((t) => !t.completed).length;
	const completedCount = todos.filter((t) => t.completed).length;

	return (
		<box
			style={{
				width: "100%",
				backgroundColor: "blue",
				flexDirection: "row",
				justifyContent: "space-between",
				alignItems: "center",
				borderStyle: "single",
				borderColor: "cyan",
				padding: 1,
			}}
		>
			<box style={{ flexDirection: "row", alignItems: "center" }}>
				<text fg="white">
					<strong>📝 TODO Manager</strong>
				</text>
				<text fg="gray" style={{ marginLeft: 2 }}>
					{`(${activeCount} active, ${completedCount} done)`}
				</text>
			</box>

			<text fg="red">[ESC] Back</text>
		</box>
	);
}
