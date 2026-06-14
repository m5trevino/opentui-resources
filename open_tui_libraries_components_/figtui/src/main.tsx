// Demo entry renders App via OpenTUI CLI renderer for preview.
// Separates showcase runtime from library exports for clean publishing only.

import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { App } from "./App";

createRoot(await createCliRenderer()).render(<App />);
