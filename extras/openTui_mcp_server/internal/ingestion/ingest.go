package ingestion

import (
	"context"
	"crypto/sha256"
	"fmt"
	"log"
	"time"

	"github.com/carlosEA28/openTui_mcp_server/pkg/helpers"
	http "github.com/carlosEA28/openTui_mcp_server/pkg/http"
	"github.com/carlosEA28/openTui_mcp_server/pkg/lib/bleve"
)

type IngestReport struct {
	Total   int
	Indexed int
	Errors  []string
}

func Ingest(ctx context.Context, urls []string, store *bleve.Store) IngestReport {
	report := IngestReport{
		Total: len(urls),
	}

	for i, url := range urls {
		log.Printf("[%d/%d] Processing: %s", i+1, len(urls), url)

		urlCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
		defer cancel()

		html, err := http.Fetch(urlCtx, url)
		if err != nil {
			errMsg := fmt.Sprintf("fetch failed for %s: %v", url, err)
			log.Printf("ERROR: %s", errMsg)
			report.Errors = append(report.Errors, errMsg)
			continue
		}

		page, err := helpers.Parser(html)
		if err != nil {
			errMsg := fmt.Sprintf("parse failed for %s: %v", url, err)
			log.Printf("ERROR: %s", errMsg)
			report.Errors = append(report.Errors, errMsg)
			continue
		}

		chunks := helpers.Chunk(page)
		if len(chunks) == 0 {
			errMsg := fmt.Sprintf("no chunks generated for %s", url)
			log.Printf("WARNING: %s", errMsg)
			report.Errors = append(report.Errors, errMsg)
			continue
		}

		for j, chunk := range chunks {
			id := fmt.Sprintf("%x", sha256.Sum256([]byte(url+chunk.Title+chunk.Text)))

			if err := store.Add(id, url, chunk); err != nil {
				errMsg := fmt.Sprintf("index failed for chunk %d of %s: %v", j+1, url, err)
				log.Printf("ERROR: %s", errMsg)
				report.Errors = append(report.Errors, errMsg)
				continue
			}

			report.Indexed++
		}

		log.Printf("[%d/%d] Indexed %d chunks from: %s", i+1, len(urls), len(chunks), url)
	}

	log.Printf("Ingest complete. Total: %d, Indexed: %d, Errors: %d",
		report.Total, report.Indexed, len(report.Errors))

	return report
}
