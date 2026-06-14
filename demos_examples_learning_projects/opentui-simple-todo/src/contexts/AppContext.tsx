import { createContext, useContext, useState, type ReactNode } from "react";
import type { Screen, Filter, TodoItem } from "../types";

interface AppContextValue {
	screen: Screen;
	setScreen: (screen: Screen) => void;

	todos: TodoItem[];
	addTodo: (text: string) => void;
	toggleTodo: (id: string) => void;
	deleteTodo: (id: string) => void;

	filter: Filter;
	setFilter: (filter: Filter) => void;

	inputValue: string;
	setInputValue: (value: string) => void;

	getFilteredTodos: () => TodoItem[];
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
	const [screen, setScreen] = useState<Screen>("welcome");
	const [todos, setTodos] = useState<TodoItem[]>([]);
	const [filter, setFilter] = useState<Filter>("all");
	const [inputValue, setInputValue] = useState("");

	const addTodo = (text: string) => {
		if (!text.trim()) return;

		const newTodo: TodoItem = {
			id: crypto.randomUUID(),
			text: text.trim(),
			completed: false,
			createdAt: Date.now(),
		};

		setTodos((prev) => [...prev, newTodo]);
		setInputValue("");
	};

	const toggleTodo = (id: string) => {
		setTodos((prev) =>
			prev.map((todo) =>
				todo.id === id ? { ...todo, completed: !todo.completed } : todo,
			),
		);
	};

	const deleteTodo = (id: string) => {
		setTodos((prev) => prev.filter((todo) => todo.id !== id));
	};

	const getFilteredTodos = () => {
		switch (filter) {
			case "active":
				return todos.filter((t) => !t.completed);
			case "completed":
				return todos.filter((t) => t.completed);
			default:
				return todos;
		}
	};

	return (
		<AppContext.Provider
			value={{
				screen,
				setScreen,
				todos,
				addTodo,
				toggleTodo,
				deleteTodo,
				filter,
				setFilter,
				inputValue,
				setInputValue,
				getFilteredTodos,
			}}
		>
			{children}
		</AppContext.Provider>
	);
}

export function useAppContext() {
	const context = useContext(AppContext);
	if (!context) {
		throw new Error("useAppContext must be used within AppProvider");
	}
	return context;
}
