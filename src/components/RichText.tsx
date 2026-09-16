import { PortableText, type PortableTextProps } from '@portabletext/react'
import styles from './RichText.module.css'
import { RichTextLink } from './RichTextLink'

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

/**
 * Links default to <RichTextLink> so internal ones stay inside client routing.
 * Callers can still override `marks.link`; their version wins.
 */
const defaultComponents: PortableTextProps['components'] = {
  marks: {
    link: ({ value, children }) => (
      <RichTextLink href={value?.href} openInNewTab={value?.openInNewTab}>
        {children}
      </RichTextLink>
    ),
  },
}

export function RichText({ value, components, ...rest }: PortableTextProps) {
  const merged: PortableTextProps['components'] = {
    ...components,
    marks: { ...defaultComponents?.marks, ...components?.marks },
  }

  return (
    <div className={styles.richText}>
      <PortableText value={value} components={merged} {...rest} />
    </div>
  )
}
