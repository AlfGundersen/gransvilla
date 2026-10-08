/**
 * A product description as plain text that still has its paragraphs.
 *
 * Shopify's own `description` is the HTML with the tags taken out and nothing
 * put in their place, so two paragraphs arrive as "…i november.Vi holder…".
 * This reads the HTML instead and leaves a blank line where a block ended and
 * a line break where there was a <br>; shown with `white-space: pre-line`, the
 * cards get the air the editor put in.
 */
export function descriptionParagraphs(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|div|h[1-6]|li|ul|ol|blockquote)>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;| /g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
