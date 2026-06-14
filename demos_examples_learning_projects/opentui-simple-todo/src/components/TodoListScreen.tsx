import { useState } from "react";
import { useKeyboard } from "@opentui/react";
import { useAppContext } from "../contexts/AppContext";
import { Header } from "./Header";
import { TodoInput } from "./TodoInput";
import { FilterTabs } from "./FilterTabs";
import { TodoList } from "./TodoList";

export function TodoListScreen() {
	const { setScreen } = useAppContext();
	const [inputFocused, setInputFocused] = useState(true);

	useKeyboard((key) => {
		if (key.name === "escape") {
			setScreen("welcome");
		} else if (key.name === "tab") {
			// Tab 键切换焦点
			setInputFocused((prev) => !prev);
		}
	});

	return (
		<box
			style={{
				width: "100%",
				height: "100%",
				flexDirection: "column",
				backgroundColor: "black",
			}}
		>
			<Header />
			<TodoInput focused={inputFocused} />
			<FilterTabs focused={!inputFocused} />
			<TodoList focused={!inputFocused} />

			<box
				style={{
					width: "100%",
					height: 1,
					backgroundColor: "blue",
				}}
			>
				<text fg="white">
					<em>Tip: Use keyboard shortcuts for quick navigation!</em>
				</text>
			</box>
		</box>
	);
}
