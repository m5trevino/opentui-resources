# OpenTui MCP Server

MCP Server in Go for searching OpenTUI documentation. It uses Bleve BM25 for full-text indexing and exposes a single MCP tool: `search_docs`.

### Use Cases

- Documentation Search: Query OpenTUI docs with natural language and return relevant chunks.
- Agent Assist: Provide focused doc context to Claude Desktop, OpenCode, and any MCP host.
- Remote MCP: Run over HTTP/SSE for hosted deployments (Render, etc.).

Built for developers who want fast, local documentation search with a minimal MCP toolset.

---

## Local OpenTUI MCP Server

### Prerequisites

1. Go toolchain (pinned in `mise.toml`).
2. Network access to fetch OpenTUI docs during ingest.

### Installation

#### Build from source

```bash
cd /path/to/openTUI_mcp
mise install
```

```bash
cd /path/to/openTUI_mcp
mise exec -- go build -o opentui_mcp_server ./cmd/
```

### Configuration

#### Environment variables

- `INDEX_PATH`: path to the Bleve index (relative or absolute)
- `TRANSPORT`: `http` for HTTP/SSE, empty for stdio (default)
- `PORT`: HTTP port (default: `8080`)

> **Important:** Never hardcode `INDEX_PATH` in code and never use absolute paths from your machine in CI/CD. Always configure it via environment variables.
>
> Recommended values:
> - Local: `INDEX_PATH=./data/index`
> - Render (persistent disk): `INDEX_PATH=/data/index`

### Ingest (build the index)

```bash
cd /path/to/openTUI_mcp
INDEX_PATH=./data/index mise exec -- go run ./cmd/ingest/main.go
```

### Run the server

#### HTTP (remote deploys)

```bash
cd /path/to/openTUI_mcp
TRANSPORT=http PORT=8080 INDEX_PATH=./data/index ./opentui_mcp_server
```

#### Stdio (local default)

```bash
cd /path/to/openTUI_mcp
INDEX_PATH=./data/index ./opentui_mcp_server
```

### Typical execution order

```bash
cd /path/to/openTUI_mcp
mise exec -- go test ./...
```

```bash
cd /path/to/openTUI_mcp
INDEX_PATH=./data/index mise exec -- go run ./cmd/ingest/main.go
```

```bash
cd /path/to/openTUI_mcp
mise exec -- go build -o opentui_mcp_server ./cmd/
```

```bash
TRANSPORT=http PORT=8080 INDEX_PATH=./data/index ./opentui_mcp_server
```

---

## Install in MCP Hosts

### HTTP (remote server)

**Claude Desktop** — edit `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "opentui-mcp": {
      "type": "http",
      "url": "https://opentui-mcp-server.onrender.com/mcp"
    }
  }
}
```

**OpenCode** — edit `~/.config/opencode/config.json`:

```json
{
  "mcp": {
    "opentui-mcp": {
      "type": "remote",
      "url": "https://opentui-mcp-server.onrender.com/mcp"
    }
  }
}
```

> For remote deploys (Render, etc.), use `https://opentui-mcp-server.onrender.com/mcp`.

---

## Stack

- Go
- Bleve (BM25 full-text search)
- goquery (HTML parser)
- modelcontextprotocol/go-sdk

---

## Contributing

1. Fork the repo
2. Create a feature branch
3. Run tests
4. Open a PR

---

## Docs

- `docs/overview.md`
- `docs/configuration.md`
- `docs/ingest.md`
- `docs/usage-http.md`
- `docs/usage-stdio.md`
- `docs/deploy-render.md`
- `docs/troubleshooting.md`
