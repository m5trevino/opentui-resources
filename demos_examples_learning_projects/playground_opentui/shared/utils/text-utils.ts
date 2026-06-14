/**
 * Text utilities for OpenTUI widgets
 */

import { isStyledText, type StyledText } from "@opentui/core";

/**
 * Extract plain text from a StyledText object or string
 * Useful for re-styling text content
 */
export function extractPlainText(content: StyledText | string | undefined | null): string {
  if (!content) return "";

  if (isStyledText(content)) {
    return content.chunks.map(chunk => chunk.text).join('');
  }

  return String(content);
}
