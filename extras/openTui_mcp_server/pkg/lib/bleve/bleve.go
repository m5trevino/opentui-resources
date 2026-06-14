package bleve

import (
	"fmt"

	"github.com/blevesearch/bleve/v2"
	"github.com/blevesearch/bleve/v2/mapping"
	"github.com/carlosEA28/openTui_mcp_server/pkg/types"
)

// Store wraps a Bleve index and exposes Add, Search and Delete.
type Store struct {
	idx bleve.Index
}

// document is the internal shape that Bleve stores for each chunk.
// Exported fields are required — Bleve uses reflection to read them.
type document struct {
	ID    string
	Title string
	Text  string
	URL   string
}

// Open opens an existing index at path, or creates a new one if it does not exist.
func Open(path string) (*Store, error) {
	idx, err := bleve.Open(path)
	if err == bleve.ErrorIndexPathDoesNotExist {
		idx, err = bleve.New(path, buildMapping())
	}
	if err != nil {
		return nil, fmt.Errorf("index.Open: %w", err)
	}
	return &Store{idx: idx}, nil
}

// Close flushes and closes the index. Always call this on shutdown.
func (s *Store) Close() error {
	return s.idx.Close()
}

// Add indexes a single chunk. id must be unique — a good choice is a hash of url+title+text.
func (s *Store) Add(id, url string, chunk types.Chunk) error {
	doc := document{
		ID:    id,
		Title: chunk.Title,
		Text:  chunk.Text,
		URL:   url,
	}
	if err := s.idx.Index(id, doc); err != nil {
		return fmt.Errorf("index.Add: %w", err)
	}
	return nil
}

// Result is what Search returns for each matching chunk.
type Result struct {
	ID    string
	Title string
	Text  string
	URL   string
	Score float64
}

// Search runs a BM25 query against Title and Text fields and returns the top k results.
func (s *Store) Search(query string, k int) ([]Result, error) {
	if query == "" || k <= 0 {
		return nil, nil
	}

	// MultiPhraseQuery searches across both fields — Title hits score higher via boost.
	titleQuery := bleve.NewMatchQuery(query)
	titleQuery.SetField("Title")
	titleQuery.SetBoost(2.0) // title match is worth twice a body match

	textQuery := bleve.NewMatchQuery(query)
	textQuery.SetField("Text")

	combined := bleve.NewDisjunctionQuery(titleQuery, textQuery)

	req := bleve.NewSearchRequestOptions(combined, k, 0, false)
	req.Fields = []string{"Title", "Text", "URL"} // which fields to return in results

	res, err := s.idx.Search(req)
	if err != nil {
		return nil, fmt.Errorf("index.Search: %w", err)
	}

	results := make([]Result, 0, len(res.Hits))
	for _, hit := range res.Hits {
		results = append(results, Result{
			ID:    hit.ID,
			Title: fieldString(hit.Fields, "Title"),
			Text:  fieldString(hit.Fields, "Text"),
			URL:   fieldString(hit.Fields, "URL"),
			Score: hit.Score,
		})
	}
	return results, nil
}

// Delete removes a document from the index by its id.
func (s *Store) Delete(id string) error {
	if err := s.idx.Delete(id); err != nil {
		return fmt.Errorf("index.Delete: %w", err)
	}
	return nil
}

// buildMapping defines the schema: which fields exist and how they are indexed.
func buildMapping() mapping.IndexMapping {
	// textField: analysed — tokenised, lowercased, stopwords removed. Used for search.
	textField := bleve.NewTextFieldMapping()
	textField.Analyzer = "en" // swap to "standard" if the docs are not in English

	// keywordField: stored as-is, not analysed. Used for URL (exact value, not searched).
	keywordField := bleve.NewKeywordFieldMapping()

	docMapping := bleve.NewDocumentMapping()
	docMapping.AddFieldMappingsAt("Title", textField)
	docMapping.AddFieldMappingsAt("Text", textField)
	docMapping.AddFieldMappingsAt("URL", keywordField)

	idxMapping := bleve.NewIndexMapping()
	idxMapping.DefaultMapping = docMapping
	idxMapping.DefaultAnalyzer = "en"

	return idxMapping
}

// fieldString safely pulls a string field out of a Bleve hit's Fields map.
func fieldString(fields map[string]interface{}, key string) string {
	v, ok := fields[key]
	if !ok {
		return ""
	}
	s, _ := v.(string)
	return s
}
