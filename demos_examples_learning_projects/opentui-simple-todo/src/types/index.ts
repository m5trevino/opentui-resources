export interface TodoItem {
	id: string;
	text: string;
	completed: boolean;
	createdAt: number;
}

export type Screen = "welcome" | "list";

export type Filter = "all" | "active" | "completed";

export interface AppState {
	screen: Screen;
	todos: TodoItem[];
	filter: Filter;
	inputValue: string;
}
