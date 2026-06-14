import { useState } from "react";
import { useKeyboard } from "@opentui/react";
import { useAppContext } from "../contexts/AppContext";

interface TodoListProps {
	focused: boolean;
}

export function TodoList({ focused }: TodoListProps) {
	const { getFilteredTodos, toggleTodo, deleteTodo } = useAppContext();
	const [selectedIndex, setSelectedIndex] = useState(0);

	const filteredTodos = getFilteredTodos();

	useKeyboard((key) => {
		// 只有在 TodoList 获得焦点时才响应键盘事件
		if (!focused || filteredTodos.length === 0) return;

		if (key.name === "up" || key.name === "k") {
			setSelectedIndex((prev) => Math.max(0, prev - 1));
		} else if (key.name === "down" || key.name === "j") {
			setSelectedIndex((prev) => Math.min(filteredTodos.length - 1, prev + 1));
		} else if (key.name === "space" || key.name === "return") {
			const selected = filteredTodos[selectedIndex];
			if (selected) {
				toggleTodo(selected.id);
			}
		} else if (key.name === "d" || key.name === "delete") {
			const selected = filteredTodos[selectedIndex];
			if (selected) {
				deleteTodo(selected.id);
				// 调整选中索引
				if (selectedIndex >= filteredTodos.length - 1) {
					setSelectedIndex(Math.max(0, filteredTodos.length - 2));
				}
			}
		}
	});

	if (filteredTodos.length === 0) {
		return (
			<box
				style={{
					width: "100%",
					height: "100%",
					padding: 1,
					backgroundColor: "black",
					borderStyle: "single",
					borderColor: "brightBlack",
					flexDirection: "column",
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<text fg="gray">
					<em>No todos yet. Create one above!</em>
				</text>
			</box>
		);
	}

	return (
		<box
			style={{
				width: "100%",
				height: "100%",
				padding: 1,
				backgroundColor: "black",
				borderStyle: "single",
				borderColor: focused ? "magenta" : "brightBlack",
				flexDirection: "column",
			}}
		>
			<box style={{ marginBottom: 1, flexDirection: "row" }}>
				<text fg={focused ? "magenta" : "gray"}>
					<strong>{`${focused ? "Tasks:" : "Tasks (Tab to focus):"}`}</strong>
				</text>
				{focused && (
					<text fg="gray" style={{ marginLeft: 2 }}>
						<em>[↑↓/jk] Navigate [Space/Enter] Toggle [D/Del] Delete</em>
					</text>
				)}
			</box>

			<scrollbox focused={focused} style={{ width: "100%", height: "100%" }}>
				{filteredTodos.map((todo, index) => {
					const isSelected = index === selectedIndex;
					return (
						<box
							key={todo.id}
							style={{
								width: "100%",
								backgroundColor: isSelected ? "brightBlack" : "black",
								flexDirection: "row",
								alignItems: "center",
								marginBottom: 0,
							}}
						>
							{todo.completed ? (
								<text fg="green" style={{ marginRight: 1 }}>
									✅
								</text>
							) : (
								<text fg="yellow" style={{ marginRight: 1 }}>
									☑️
								</text>
							)}

							{todo.completed ? (
								<text fg="gray">
									<i>{todo.text}</i>
								</text>
							) : (
								<text fg="white">{todo.text}</text>
							)}

							{isSelected && (
								<text fg="cyan" style={{ marginLeft: 1 }}>
									<strong>◀</strong>
								</text>
							)}
						</box>
					);
				})}
			</scrollbox>
		</box>
	);
}
