import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { AppProvider, useAppContext } from "./contexts/AppContext";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { TodoListScreen } from "./components/TodoListScreen";

function App() {
	const { screen } = useAppContext();

	return (
		<box
			style={{
				width: "100%",
				height: "100%",
				backgroundColor: "black",
			}}
		>
			{screen === "welcome" && <WelcomeScreen />}
			{screen === "list" && <TodoListScreen />}
		</box>
	);
}

function Root() {
	return (
		<AppProvider>
			<App />
		</AppProvider>
	);
}

const renderer = await createCliRenderer();
createRoot(renderer).render(<Root />);
