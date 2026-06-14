package helpers

import (
	"strings"

	"github.com/carlosEA28/openTui_mcp_server/pkg/types"
)

// Chunk splits a page into smaller chunks using level-2/3 headings as delimiters.
func Chunk(page types.Page) []types.Chunk {
	sections := splitSections(page)
	if len(sections) == 0 {
		return nil
	}

	var chunks []types.Chunk
	for _, section := range sections {
		chunks = append(chunks, chunkSection(section)...)
	}

	return chunks
}

type section struct {
	parentTitle string
	text        string
}

const (
	minTokens = 150
	maxTokens = 500
)

func splitSections(page types.Page) []section {
	content := strings.ReplaceAll(page.Content, "\r\n", "\n")
	lines := strings.Split(content, "\n")

	pageTitle := strings.TrimSpace(page.Title)
	if pageTitle == "" {
		pageTitle = "Untitled"
	}

	currentH2 := ""
	currentParent := pageTitle
	var currentLines []string
	var sections []section

	flush := func() {
		text := strings.TrimSpace(strings.Join(currentLines, "\n"))
		if text == "" {
			return
		}
		parent := strings.TrimSpace(currentParent)
		if parent == "" {
			parent = pageTitle
		}
		sections = append(sections, section{parentTitle: parent, text: text})
	}

	for _, line := range lines {
		trimmed := strings.TrimSpace(line)

		if strings.HasPrefix(trimmed, "## ") {
			flush()
			currentLines = nil

			currentH2 = strings.TrimSpace(strings.TrimPrefix(trimmed, "## "))
			if currentH2 == "" {
				currentH2 = pageTitle
			}
			currentParent = currentH2

			// Include the heading as first line so BM25 picks it up as a strong signal
			currentLines = append(currentLines, trimmed)
			continue
		}

		if strings.HasPrefix(trimmed, "### ") {
			flush()
			currentLines = nil

			h3 := strings.TrimSpace(strings.TrimPrefix(trimmed, "### "))

			if currentH2 != "" {
				currentParent = currentH2
			} else {
				currentParent = pageTitle
			}

			// Include the H3 heading as first line for the same reason
			if h3 != "" {
				currentLines = append(currentLines, trimmed)
			}
			continue
		}

		currentLines = append(currentLines, line)
	}

	flush()
	return sections
}

func chunkSection(section section) []types.Chunk {
	paragraphs := splitParagraphs(section.text)
	var chunks []types.Chunk

	var current []string
	currentTokens := 0

	flush := func() {
		text := strings.TrimSpace(strings.Join(current, "\n\n"))
		if text == "" {
			return
		}
		chunks = append(chunks, types.Chunk{Title: section.parentTitle, Text: text})
		current = nil
		currentTokens = 0
	}

	for _, p := range paragraphs {
		pTokens := countTokens(p)
		if pTokens == 0 {
			continue
		}

		if currentTokens+pTokens <= maxTokens {
			current = append(current, p)
			currentTokens += pTokens
			continue
		}

		if currentTokens >= minTokens {
			flush()
		}

		if currentTokens == 0 && pTokens > maxTokens {
			for _, part := range splitByWords(p, maxTokens) {
				part = strings.TrimSpace(part)
				if part == "" {
					continue
				}
				chunks = append(chunks, types.Chunk{Title: section.parentTitle, Text: part})
			}
			continue
		}

		if currentTokens > 0 {
			flush()
		}

		if pTokens <= maxTokens {
			current = append(current, p)
			currentTokens = pTokens
			continue
		}

		for _, part := range splitByWords(p, maxTokens) {
			part = strings.TrimSpace(part)
			if part == "" {
				continue
			}
			chunks = append(chunks, types.Chunk{Title: section.parentTitle, Text: part})
		}
	}

	if currentTokens > 0 {
		flush()
	}

	return chunks
}

func splitParagraphs(text string) []string {
	lines := strings.Split(strings.ReplaceAll(text, "\r\n", "\n"), "\n")
	var paragraphs []string
	var current []string

	flush := func() {
		p := strings.TrimSpace(strings.Join(current, "\n"))
		if p != "" {
			paragraphs = append(paragraphs, p)
		}
		current = nil
	}

	for _, line := range lines {
		if strings.TrimSpace(line) == "" {
			flush()
			continue
		}
		current = append(current, line)
	}

	flush()
	return paragraphs
}

func countTokens(text string) int {
	return len(strings.Fields(text))
}

func splitByWords(text string, size int) []string {
	words := strings.Fields(text)
	if len(words) == 0 {
		return nil
	}

	var parts []string
	for start := 0; start < len(words); start += size {
		end := start + size
		if end > len(words) {
			end = len(words)
		}
		parts = append(parts, strings.Join(words[start:end], " "))
	}

	return parts
}
