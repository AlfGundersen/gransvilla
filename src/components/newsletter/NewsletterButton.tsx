'use client'

import { useState } from 'react'
import { NewsletterModal } from './NewsletterModal'

interface NewsletterButtonProps {
  label: string
  className?: string
}

/** Button that opens the signup modal in place of following a link. */
export function NewsletterButton({ label, className }: NewsletterButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {label}
      </button>
      <NewsletterModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
