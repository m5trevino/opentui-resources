/**
 * Example 01: Hello World
 *
 * Demonstrates the most basic OpenTUI setup:
 * - Creating a CLI renderer
 * - Adding a TextRenderable to the screen
 * - Handling Ctrl+C to exit
 */

import { TextRenderable, BoxRenderable } from "@opentui/core";
import { createExampleApp } from "@shared/utils/example-app";

createExampleApp(({ renderer }) => {
  // Create a container box for our content
  const container = new BoxRenderable(renderer, {
    id: "container",
    width: "100%",
    height: "100%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 1,
  });

  // Create the main greeting text
  const greeting = new TextRenderable(renderer, {
    id: "greeting",
    content: "Hello, OpenTUI!",
    fg: "#50fa7b", // Dracula green
  });

  // Create instructions text
  const instructions = new TextRenderable(renderer, {
    id: "instructions",
    content: "Press q or Ctrl+C to exit",
    fg: "#6272a4", // Muted comment color
  });

  // Build the component tree
  container.add(greeting);
  container.add(instructions);
  renderer.root.add(container);
});
