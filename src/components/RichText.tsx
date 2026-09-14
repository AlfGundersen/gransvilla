import { PortableText, type PortableTextProps } from '@portabletext/react'
import styles from './RichText.module.css'

/**
 * Portable Text with the project's rendering rules in one place.
 *
 * Editors use soft line breaks (Shift+Enter) inside a block — menu lists are
 * written that way — but Portable Text keeps those as `\n` inside the span, and
 * HTML collapses them to a space, so every item ran together on one line.
 * `white-space: pre-line` renders the newline while still collapsing ordinary
 * whitespace, which is the behaviour the editor is showing.
 *
 * Previously every caller rendered <PortableText> directly, so there was
 * nowhere to fix this once.
 */
export function RichText({ value, components, ...rest }: PortableTextProps) {
  return (
    <div className={styles.richText}>
      <PortableText value={value} components={components} {...rest} />
    </div>
  )
}
