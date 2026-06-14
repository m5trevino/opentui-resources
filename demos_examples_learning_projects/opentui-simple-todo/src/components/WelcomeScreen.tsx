import { useKeyboard } from "@opentui/react";
import { useAppContext } from "../contexts/AppContext";

export function WelcomeScreen() {
	const { setScreen, setInputValue } = useAppContext();

	useKeyboard((key) => {
		if (key.name === "l") {
			setScreen("list");
		} else if (key.name === "c") {
			setScreen("list");
			// 自动聚焦输入框（通过清空然后重设触发）
			setInputValue("");
		} else if (key.name === "escape") {
			process.exit(0);
		}
	});

	return (
		<box
			style={{
				width: "100%",
				height: "100%",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				padding: 2,
			}}
		>
			<box
				style={{
					border: true,
					borderStyle: "double",
					borderColor: "cyan",
					padding: 3,
					backgroundColor: "black",
				}}
			>
				<box style={{ flexDirection: "column", alignItems: "center" }}>
					<text fg="cyan">
						<strong>╔═══════════════════════════════╗</strong>
					</text>
					<text fg="white">
						<strong> 🚀 TODO TUI APP 🚀 </strong>
					</text>
					<text fg="cyan">
						<strong>╚═══════════════════════════════╝</strong>
					</text>

					<text fg="gray" style={{ marginBottom: 3 }}>
						<em>A beautiful terminal-based TODO manager</em>
					</text>

					<box style={{ flexDirection: "column", gap: 1 }}>
						<text fg="green">
							<strong>[L]</strong> - View TODO List
						</text>
						<text fg="yellow">
							<strong>[C]</strong> - Create New TODO
						</text>
						<text fg="red">
							<strong>[ESC]</strong> - Exit Application
						</text>
					</box>
				</box>
			</box>

			<box style={{ marginTop: 3 }}>
				<text fg="brightBlack">
					<em>Press any key to continue...</em>
				</text>
			</box>
		</box>
	);
}
