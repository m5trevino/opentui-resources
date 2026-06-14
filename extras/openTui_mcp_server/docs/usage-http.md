# HTTP usage

## Run the server
```bash
cd /path/to/openTUI_mcp
TRANSPORT=http PORT=8080 INDEX_PATH=./data/index ./opentui_mcp_server
```

## Test with curl
List tools:
```bash
curl -s -X POST https://opentui-mcp-server.onrender.com/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Call `search_docs`:
```bash
curl -s -X POST https://opentui-mcp-server.onrender.com/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"search_docs","arguments":{"query":"renderer","limit":3}}}'
```

## Response shape
`search_docs` returns JSON with `query` and `results`, where each result includes `title`, `text`, `url`, and `score`.
