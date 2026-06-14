package types

// SearchDocsArgs are the input params for the SearchDocs tool.
type SearchDocsArgs struct {
	Query     string `json:"query"`
	Limit     int    `json:"limit,omitempty"`
	IndexPath string `json:"indexPath,omitempty"`
}

// SearchDocsHit is a single search result entry.
type SearchDocsHit struct {
	Title string  `json:"title"`
	Text  string  `json:"text"`
	URL   string  `json:"url"`
	Score float64 `json:"score"`
}

// SearchDocsOutput is the structured output of SearchDocs.
type SearchDocsOutput struct {
	Query   string          `json:"query"`
	Results []SearchDocsHit `json:"results"`
}
