'use client'

import { ViewTransition } from 'react'

type SharedImageProps = {
  /**
   * Must match the name on the other side of the navigation, and must be
   * unique among mounted elements. Keyed on the slug or product handle, which
   * is what both sides already have in common.
   */
  name: string
  /** CSS hook — see `::view-transition-*(.page-image)` in globals.css. */
  transitionClass?: string
  children: React.ReactNode
}

/**
 * Pairs an image in a listing with the same image on the page it links to, so
 * the browser morphs one into the other instead of cross-fading the whole page
 * over it.
 *
 * A client component because <ViewTransition> needs one, but the image itself
 * is still rendered on the server and passed through as children.
 *
 * `default="none"` limits this to navigation. Without it, every unrelated
 * re-render in the subtree would animate too — which is what once left every
 * image on the site hidden behind an abandoned transition snapshot.
 *
 * enter/exit fall back to the page animation, and that is not optional. Naming
 * an element excludes it from its parent's snapshot, so with `share` alone an
 * unmatched image sat out the page transition entirely and popped into place
 * while everything around it faded — arriving at an event from the events
 * carousel or the "Andre arrangementer" list, or leaving the shop for anything
 * other than a product. `share` still wins whenever there is a match, so the
 * morph is unaffected; this only covers the case where there is nothing to
 * morph from.
 */
export function SharedImage({ name, transitionClass = 'page-image', children }: SharedImageProps) {
  return (
    <ViewTransition
      name={name}
      default="none"
      share={transitionClass}
      enter="page-content"
      exit="page-content"
    >
      {children}
    </ViewTransition>
  )
}
