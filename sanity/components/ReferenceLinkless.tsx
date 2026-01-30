import { useCallback, useRef } from 'react'
import type { ReferenceInputProps } from 'sanity'

export function ReferenceLinkless(props: ReferenceInputProps) {
  const wrapRef = useRef<HTMLDivElement>(null)

  const handleClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    // Allow clicks on buttons (menu, clear, etc.) but block the preview card link
    if (target.closest('button') || target.closest('[data-ui="MenuButton"]')) {
      return
    }
    // Block click on the preview card that opens the referenced document
    const previewCard = target.closest('a')
    if (previewCard) {
      e.preventDefault()
      e.stopPropagation()
    }
  }, [])

  return (
    <div ref={wrapRef} onClickCapture={handleClick}>
      {props.renderDefault(props)}
    </div>
  )
}
