package helpers

import (
	"bytes"
	"fmt"
	"strings"

	"github.com/PuerkitoBio/goquery"
	"github.com/carlosEA28/openTui_mcp_server/pkg/types"
)

// Parser parses raw HTML and extracts a types.Page with title and clean text content.
func Parser(html []byte) (types.Page, error) {
	doc, err := goquery.NewDocumentFromReader(bytes.NewReader(html))
	if err != nil {
		return types.Page{}, fmt.Errorf("parser: failed to parse html: %w", err)
	}

	// Title: prefer <h1> inside main, fallback to <title> tag
	title := strings.TrimSpace(doc.Find("main h1").First().Text())
	if title == "" {
		title = strings.TrimSpace(doc.Find("title").First().Text())
	}

	// Content: extract from <main>, <article>, or <body> in that order of preference
	var contentSel *goquery.Selection
	if doc.Find("main").Length() > 0 {
		contentSel = doc.Find("main")
	} else if doc.Find("article").Length() > 0 {
		contentSel = doc.Find("article")
	} else {
		contentSel = doc.Find("body")
	}

	// Remove noise: nav, footer, header, sidebar, scripts, styles
	contentSel.Find("nav, footer, header, aside, script, style, [aria-hidden='true']").Remove()

	// Build markdown-like text preserving heading hierarchy
	var sb strings.Builder
	contentSel.Children().Each(func(_ int, s *goquery.Selection) {
		extractText(s, &sb)
	})

	content := strings.TrimSpace(sb.String())

	return types.Page{
		Title:   title,
		Content: content,
	}, nil
}

// extractText walks a goquery selection and writes markdown-like text into sb.
func extractText(s *goquery.Selection, sb *strings.Builder) {
	node := s.Get(0)
	if node == nil {
		return
	}

	tag := node.Data
	text := strings.TrimSpace(s.Text())
	if text == "" {
		return
	}

	switch tag {
	case "h1":
		sb.WriteString("# " + text + "\n\n")
	case "h2":
		sb.WriteString("## " + text + "\n\n")
	case "h3":
		sb.WriteString("### " + text + "\n\n")
	case "h4", "h5", "h6":
		sb.WriteString("#### " + text + "\n\n")
	case "pre", "code":
		sb.WriteString("```\n" + text + "\n```\n\n")
	case "p", "li":
		sb.WriteString(text + "\n\n")
	case "ul", "ol":
		s.Find("li").Each(func(_ int, li *goquery.Selection) {
			sb.WriteString("- " + strings.TrimSpace(li.Text()) + "\n")
		})
		sb.WriteString("\n")
	default:
		// For div, section, and other containers: recurse into children
		s.Children().Each(func(_ int, child *goquery.Selection) {
			extractText(child, sb)
		})
	}
}
