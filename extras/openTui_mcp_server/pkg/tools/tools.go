package tools

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	blevestore "github.com/carlosEA28/openTui_mcp_server/pkg/lib/bleve"
	"github.com/carlosEA28/openTui_mcp_server/pkg/types"
	"github.com/modelcontextprotocol/go-sdk/mcp"
)

// SearchDocs runs a BM25 query against the Bleve index and returns matching chunks.
// store must be opened once at startup in main.go and passed here — never open it inside the tool.
func SearchDocs(
	ctx context.Context,
	req *mcp.CallToolRequest,
	args types.SearchDocsArgs,
	store *blevestore.Store,
) (*mcp.CallToolResult, types.SearchDocsOutput, error) {
	_ = ctx

	if req == nil || req.Params == nil {
		return nil, types.SearchDocsOutput{}, errors.New("missing tool params")
	}

	args.Query = strings.TrimSpace(args.Query)
	if args.Query == "" {
		return nil, types.SearchDocsOutput{}, errors.New("query is required")
	}

	limit := args.Limit
	switch {
	case limit <= 0:
		limit = 5
	case limit > 20:
		limit = 20
	}

	hits, err := store.Search(args.Query, limit)
	if err != nil {
		return nil, types.SearchDocsOutput{}, err
	}

	output := types.SearchDocsOutput{Query: args.Query}
	for _, hit := range hits {
		output.Results = append(output.Results, types.SearchDocsHit{
			Title: hit.Title,
			Text:  hit.Text,
			URL:   hit.URL,
			Score: hit.Score,
		})
	}

	// Serialize output to JSON — this is what the LLM reads
	raw, err := json.Marshal(output)
	if err != nil {
		return nil, types.SearchDocsOutput{}, fmt.Errorf("search_docs: failed to marshal output: %w", err)
	}

	result := &mcp.CallToolResult{
		Content: []mcp.Content{
			&mcp.TextContent{
				Text: string(raw),
			},
		},
	}

	return result, output, nil
}
