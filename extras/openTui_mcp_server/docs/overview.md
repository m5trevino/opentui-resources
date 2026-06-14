# Overview

The OpenTui MCP Server exposes a single MCP tool, `search_docs`, backed by a local Bleve (BM25) index of OpenTUI documentation.

## What it does
- Builds a local index from OpenTUI documentation pages.
- Serves a minimal MCP server over stdio or HTTP/SSE.
- Returns ranked chunks for fast, focused answers.

## How it works
1. `cmd/ingest` fetches a curated list of docs URLs and builds the index.
2. `cmd/main` opens the index and registers `search_docs`.
3. MCP hosts call `search_docs` to retrieve the top results.

## Repository layout
- `cmd/main.go`: MCP server entrypoint
- `cmd/ingest/main.go`: index builder
- `data/index`: local Bleve index (generated)
- `pkg/lib/bleve`: Bleve index wrapper
- `pkg/tools`: MCP tool implementation
- `pkg/types`: MCP request/response types

