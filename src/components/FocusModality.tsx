'use client'

import { useEffect } from 'react'

/**
 * Marks the document while it is being used with a pointer, so the focus ring
 * can be kept for those who steer by keyboard.
 *
 * `:focus-visible` alone is not enough: a browser always counts a text field
 * as visibly focused, so tapping the allergy field drew a ring around it. The
 * mark goes on with a click or a touch and comes off again at the first Tab or
 * arrow key — which is also how a screen reader or a switch moves focus — so
 * the ring is there for exactly the people who navigate by it. With no script
 * the mark is never set and the ring always shows, which is the safe way to
 * fail. Renders nothing; the rule is in globals.css.
 */
const KEYS = new Set(['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'F6'])

export function FocusModality() {
  useEffect(() => {
    const root = document.documentElement
    const onPointer = () => root.setAttribute('data-pointer', '')
    const onKey = (event: KeyboardEvent) => {
      if (KEYS.has(event.key)) root.removeAttribute('data-pointer')
    }

    window.addEventListener('pointerdown', onPointer, true)
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('pointerdown', onPointer, true)
      window.removeEventListener('keydown', onKey, true)
    }
  }, [])

  return null
}
