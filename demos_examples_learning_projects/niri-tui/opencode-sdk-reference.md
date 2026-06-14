# @opencode-ai/sdk Reference

Type-safe JS client for opencode server.

## Install

```bash
npm install @opencode-ai/sdk
```

## Create Client

Starts both a server and a client:

```typescript
import { createOpencode } from "@opencode-ai/sdk"
const { client } = await createOpencode()
```

### Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `hostname` | `string` | Server hostname | `127.0.0.1` |
| `port` | `number` | Server port | `4096` |
| `signal` | `AbortSignal` | Abort signal for cancellation | `undefined` |
| `timeout` | `number` | Timeout in ms for server start | `5000` |
| `config` | `Config` | Configuration object | `{}` |

### With Config

```typescript
import { createOpencode } from "@opencode-ai/sdk"
const opencode = await createOpencode({
  hostname: "127.0.0.1",
  port: 4096,
  config: {
    model: "anthropic/claude-3-5-sonnet-20241022",
  },
})
console.log(`Server running at ${opencode.server.url}`)
opencode.server.close()
```

## Client Only (Connect to Existing Server)

```typescript
import { createOpencodeClient } from "@opencode-ai/sdk"
const client = createOpencodeClient({
  baseUrl: "http://localhost:4096",
})
```

### Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `baseUrl` | `string` | URL of the server | `http://localhost:4096` |
| `fetch` | `function` | Custom fetch implementation | `globalThis.fetch` |
| `parseAs` | `string` | Response parsing method | `auto` |
| `responseStyle` | `string` | Return style: `data` or `fields` | `fields` |
| `throwOnError` | `boolean` | Throw errors instead of return | `false` |

## Types

```typescript
import type { Session, Message, Part } from "@opencode-ai/sdk"
```

## Error Handling

```typescript
try {
  await client.session.get({ path: { id: "invalid-id" } })
} catch (error) {
  console.error("Failed to get session:", (error as Error).message)
}
```

## Structured Output

Request structured JSON output from the model:

```typescript
const result = await client.session.prompt({
  path: { id: sessionId },
  body: {
    parts: [{ type: "text", text: "Research Anthropic and provide company info" }],
    format: {
      type: "json_schema",
      schema: {
        type: "object",
        properties: {
          company: { type: "string", description: "Company name" },
          founded: { type: "number", description: "Year founded" },
          products: {
            type: "array",
            items: { type: "string" },
            description: "Main products",
          },
        },
        required: ["company", "founded"],
      },
    },
  },
})

console.log(result.data.info.structured_output)
// { company: "Anthropic", founded: 2021, products: ["Claude", "Claude API"] }
```

### Output Format Types

| Type | Description |
|------|-------------|
| `text` | Default. Standard text response (no structured output) |
| `json_schema` | Returns validated JSON matching the provided schema |

### JSON Schema Format

| Field | Type | Description |
|-------|------|-------------|
| `type` | `'json_schema'` | Required. Specifies JSON schema mode |
| `schema` | `object` | Required. JSON Schema object defining the output structure |
| `retryCount` | `number` | Optional. Number of validation retries (default: 2) |

### Error Handling

```typescript
if (result.data.info.error?.name === "StructuredOutputError") {
  console.error("Failed to produce structured output:", result.data.info.error.message)
  console.error("Attempts:", result.data.info.error.retries)
}
```

## APIs

### Global

```typescript
const health = await client.global.health()
// { healthy: true, version: string }
```

### App

```typescript
// Write a log entry
await client.app.log({
  body: {
    service: "my-app",
    level: "info",
    message: "Operation completed",
  },
})

// List available agents
const agents = await client.app.agents()
```

### Project

```typescript
// List all projects
const projects = await client.project.list()

// Get current project
const currentProject = await client.project.current()
```

### Path

```typescript
const pathInfo = await client.path.get()
```

### Config

```typescript
const config = await client.config.get()
const { providers, default: defaults } = await client.config.providers()
```

### Sessions

```typescript
// Create session
const session = await client.session.create({
  body: { title: "My session" },
})

// List sessions
const sessions = await client.session.list()

// Get session
const session = await client.session.get({ path: { id: sessionId } })

// Delete session
await client.session.delete({ path: { id: sessionId } })

// Send a prompt message
const result = await client.session.prompt({
  path: { id: session.id },
  body: {
    model: { providerID: "anthropic", modelID: "claude-3-5-sonnet-20241022" },
    parts: [{ type: "text", text: "Hello!" }],
  },
})

// Inject context without triggering AI response
await client.session.prompt({
  path: { id: session.id },
  body: {
    noReply: true,
    parts: [{ type: "text", text: "You are a helpful assistant." }],
  },
})

// Abort a running session
await client.session.abort({ path: { id: sessionId } })

// List messages in a session
const messages = await client.session.messages({ path: { id: sessionId } })

// Run a shell command
const result = await client.session.shell({
  path: { id: sessionId },
  body: { command: "npm test" },
})
```

### Files

```typescript
// Search for text in files
const textResults = await client.find.text({
  query: { pattern: "function.*opencode" },
})

// Find files
const files = await client.find.files({
  query: { query: "*.ts", type: "file" },
})

// Find directories
const directories = await client.find.files({
  query: { query: "packages", type: "directory", limit: 20 },
})

// Read a file
const content = await client.file.read({
  query: { path: "src/index.ts" },
})

// Get status for tracked files
const status = await client.file.status()
```

### TUI

```typescript
// Append text to the prompt
await client.tui.appendPrompt({
  body: { text: "Add this to prompt" },
})

// Show toast notification
await client.tui.showToast({
  body: { message: "Task completed", variant: "success" },
})

// Open dialogs
await client.tui.openHelp()
await client.tui.openSessions()
await client.tui.openThemes()
await client.tui.openModels()

// Submit/clear prompt
await client.tui.submitPrompt()
await client.tui.clearPrompt()

// Execute a command
await client.tui.executeCommand({ body: { command: "/help" } })
```

### Auth

```typescript
await client.auth.set({
  path: { id: "anthropic" },
  body: { type: "api", key: "your-api-key" },
})
```

### Events

```typescript
// Listen to real-time events
const events = await client.event.subscribe()
for await (const event of events.stream) {
  console.log("Event:", event.type, event.properties)
}
```