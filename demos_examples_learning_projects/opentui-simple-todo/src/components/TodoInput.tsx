import { useAppContext } from "../contexts/AppContext";

interface TodoInputProps {
	focused: boolean;
}

export function TodoInput({ focused }: TodoInputProps) {
	const { inputValue, setInputValue, addTodo } = useAppContext();

	const handleSubmit = (value: string) => {
		addTodo(value);
	};

	return (
		<box
			style={{
				width: "100%",
				padding: 1,
				backgroundColor: "black",
				borderStyle: "single",
				borderColor: focused ? "green" : "brightBlack",
				flexDirection: "row",
				alignItems: "center",
			}}
		>
			<text fg={focused ? "green" : "gray"} style={{ marginRight: 1 }}>
				<strong>{`${focused ? "New:" : "New (Tab to focus):"}`}</strong>
			</text>

			<box style={{ width: "70%", marginRight: 1 }}>
				<input
					value={inputValue}
					placeholder="What needs to be done? (Press Enter to add)"
					focused={focused}
					onInput={setInputValue}
					onSubmit={handleSubmit}
					style={{
						backgroundColor: "brightBlack",
						textColor: "white",
						padding: 0,
					}}
				/>
			</box>

			<text fg="yellow">
				<strong>[Enter]</strong> Add
			</text>
		</box>
	);
}
