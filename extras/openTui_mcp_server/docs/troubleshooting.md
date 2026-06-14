# Troubleshooting

## tools/call returns empty results
- Confirm `INDEX_PATH` points to the correct index location.
- Ensure the index exists and has content.
- Re-run ingest after moving the project.

## Index path confusion
- Avoid absolute paths from your machine in CI/CD.
- Use `INDEX_PATH=./data/index` locally and `/data/index` on Render.

## Go toolchain mismatch
If you see errors like:
`compile: version "go1.25.0" does not match go tool version ...`
use the pinned toolchain:
```bash
cd /path/to/openTUI_mcp
mise exec -- go run ./cmd/ingest/main.go
```
