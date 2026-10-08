import { expect, test } from '@playwright/test'
import { descriptionParagraphs } from '@/lib/shopify/description'

test('paragraphs from Shopify stay apart', () => {
  const html =
    '<p>Første avsnitt.<br></p>\n<p>Andre avsnitt.<br><br>Tredje, etter to linjeskift.</p>'

  expect(descriptionParagraphs(html)).toBe(
    'Første avsnitt.\n\nAndre avsnitt.\n\nTredje, etter to linjeskift.',
  )
})

test('tags and entities are turned into plain text', () => {
  expect(descriptionParagraphs('<p>Brød &amp; sm<span>ør&nbsp;</span></p>')).toBe('Brød & smør')
})
