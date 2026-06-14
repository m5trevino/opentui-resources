# Configuration

## Environment variables
- `INDEX_PATH`: path to the Bleve index (relative or absolute)
- `TRANSPORT`: `http` for HTTP/SSE, empty for stdio (default)
- `PORT`: HTTP port (default: `8080`)

## INDEX_PATH guidance
> **Important:** Never hardcode `INDEX_PATH` in code and never use absolute paths from your machine in CI/CD.

Recommended values:
- Local: `INDEX_PATH=./data/index`
- Render (persistent disk): `INDEX_PATH=/data/index`

Always configure via environment variables.

## .env files
An example file exists at `./.env.example`. A local `.env` is ignored by Git.

