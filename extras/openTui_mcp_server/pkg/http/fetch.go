package fetcher

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
)

const userAgent = "opentui-mcp-server/1.0"

// Fetch performs an HTTP GET request to the specified URL and returns the response body.
// The context controls cancellation and timeout.
func Fetch(ctx context.Context, url string) ([]byte, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("fetch: failed to build request for %s: %w", url, err)
	}

	// User-Agent must be set before the request is sent, not after
	req.Header.Set("User-Agent", userAgent)
	req.Header.Set("Accept", "text/html,application/xhtml+xml")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("fetch: request failed for %s: %w", url, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("fetch: unexpected status %d for %s", resp.StatusCode, url)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("fetch: failed to read body from %s: %w", url, err)
	}

	if len(body) == 0 {
		return nil, errors.New("fetch: empty response body")
	}

	return body, nil
}
