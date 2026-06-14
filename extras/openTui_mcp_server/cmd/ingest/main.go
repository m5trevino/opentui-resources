package main

import (
	"context"
	"flag"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/carlosEA28/openTui_mcp_server/internal/ingestion"
	"github.com/carlosEA28/openTui_mcp_server/pkg/lib/bleve"
)

const (
	defaultConfigPath = "config.yaml"
	defaultIndexPath  = "data/index"
)

func parseConfig(path string) ([]string, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var urls []string
	for _, line := range strings.Split(string(data), "\n") {
		line = strings.TrimSpace(line)
		if strings.HasPrefix(line, "- ") {
			url := strings.TrimPrefix(line, "- ")
			url = strings.TrimSpace(url)
			if url != "" && strings.HasPrefix(url, "http") {
				urls = append(urls, url)
			}
		}
	}
	return urls, nil
}

func main() {
	configFlag := flag.String("config", defaultConfigPath, "Path to config.yaml")
	indexFlag := flag.String("index", defaultIndexPath, "Path to Bleve index directory")
	flag.Parse()

	configPath := filepath.Clean(*configFlag)
	dataIndexPath := filepath.Clean(*indexFlag)

	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		log.Fatalf("config.yaml not found at %s", configPath)
	}

	urls, err := parseConfig(configPath)
	if err != nil {
		log.Fatalf("Failed to parse config.yaml: %v", err)
	}
	if len(urls) == 0 {
		log.Fatal("No URLs found in config.yaml under sources.urls")
	}

	log.Printf("Opening index at: %s", dataIndexPath)
	store, err := bleve.Open(dataIndexPath)
	if err != nil {
		log.Fatalf("Failed to open index: %v", err)
	}
	defer store.Close()

	log.Printf("Starting ingestion of %d URLs...", len(urls))
	report := ingestion.Ingest(context.Background(), urls, store)

	log.Printf("=== Ingest Report ===")
	log.Printf("Total URLs: %d", report.Total)
	log.Printf("Indexed chunks: %d", report.Indexed)
	if len(report.Errors) > 0 {
		log.Printf("Errors: %d", len(report.Errors))
		for _, e := range report.Errors {
			log.Printf("  - %s", e)
		}
	}
}
