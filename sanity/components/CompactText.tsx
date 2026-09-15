import type { ArrayOfObjectsInputProps } from 'sanity'

/**
 * A shorter rich text editor.
 *
 * Sanity gives every Portable Text field a fixed 19em box, which is more than
 * a line or two of button text ever needs and pushes the rest of the form off
 * the screen. The class is what studio.css halves; the editor stays resizable
 * by drag, as it is everywhere else.
 */
export function CompactText(props: ArrayOfObjectsInputProps) {
  return <div className="compact-text">{props.renderDefault(props)}</div>
}
