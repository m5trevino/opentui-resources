package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"path/filepath"

	blevestore "github.com/carlosEA28/openTui_mcp_server/pkg/lib/bleve"
	"github.com/carlosEA28/openTui_mcp_server/pkg/tools"
	"github.com/carlosEA28/openTui_mcp_server/pkg/types"
	"github.com/modelcontextprotocol/go-sdk/mcp"
)

func main() {
	indexPath := os.Getenv("INDEX_PATH")
	if indexPath == "" {
		candidate := filepath.Join("data", "index")
		if _, err := os.Stat(candidate); err == nil {
			indexPath = candidate
		} else {
			alt := filepath.Join("openTUI_mcp", "data", "index")
			if _, err := os.Stat(alt); err == nil {
				indexPath = alt
			} else {
				indexPath = candidate
			}
		}
	}

	store, err := blevestore.Open(indexPath)
	if err != nil {
		log.Fatalf("failed to open index: %v", err)
	}
	defer store.Close()

	server := mcp.NewServer(&mcp.Implementation{
		Name:    "opentui-mcp",
		Version: "0.1.0",
	}, nil)

	mcp.AddTool(server, &mcp.Tool{
		Name:        "search_docs",
		Description: "Searches the OpenTUI documentation. Returns the top-k most relevant chunks of text from the docs. Call once with a specific query — do not call repeatedly with similar queries. If results are returned, use them directly to answer.",
	}, func(ctx context.Context, req *mcp.CallToolRequest, args types.SearchDocsArgs) (*mcp.CallToolResult, any, error) {
		result, _, err := tools.SearchDocs(ctx, req, args, store)
		return result, nil, err
	})

	transport := os.Getenv("TRANSPORT")

	switch transport {
	case "http":
		port := os.Getenv("PORT")
		if port == "" {
			port = "8080"
		}

		handler := mcp.NewStreamableHTTPHandler(func(r *http.Request) *mcp.Server {
			return server
		}, &mcp.StreamableHTTPOptions{
			Stateless:                  true,
			DisableLocalhostProtection: true,
		})

		http.Handle("/mcp", handler)
		log.Printf("opentui-mcp listening on :%s", port)

		if err := http.ListenAndServe(":"+port, nil); err != nil {
			log.Fatalf("http server error: %v", err)
		}

	default: // stdio — uso local
		if err := server.Run(context.Background(), &mcp.StdioTransport{}); err != nil {
			log.Fatalf("server error: %v", err)
		}
	}
}
