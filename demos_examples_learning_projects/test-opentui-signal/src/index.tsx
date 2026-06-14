import { render, useKeyboard } from "@opentui/solid"
import { createSignal } from "solid-js"

const App = () => {
  const [count, setCount] = createSignal(0)

  useKeyboard((key) => {
    if (key.name === "up") setCount((c) => c + 1)
    if (key.name === "down") setCount((c) => c - 1)
    if (key.name === "escape") process.exit(0)
  })

  return (
    <box border padding={2}>
      <text>Count: {count()}</text>
      <text fg="#888">Up/Down to change, ESC to exit</text>
    </box>
  )
}

render(App)