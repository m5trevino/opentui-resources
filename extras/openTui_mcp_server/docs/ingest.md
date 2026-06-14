# Ingest

The ingest command downloads the OpenTUI docs and builds the Bleve index.

## Run
```bash
cd /path/to/openTUI_mcp
INDEX_PATH=./data/index mise exec -- go run ./cmd/ingest/main.go
```

## Notes
- Re-run ingest after moving the project or when docs change.
- The index is written to `data/index` unless `INDEX_PATH` is set.
- In CI/CD, write the index to a persistent disk path.
