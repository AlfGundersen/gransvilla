'use client'

import { useEffect, useState } from 'react'

export function DraftModeBanner() {
  const [isInIframe, setIsInIframe] = useState(true)

  useEffect(() => {
    setIsInIframe(window.self !== window.top)
  }, [])

  // Don't show banner inside the Presentation tool iframe
  if (isInIframe) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#000',
        color: '#F5F0E3',
        padding: '8px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '14px',
        zIndex: 9999,
      }}
    >
      <span>Utkastmodus er aktiv</span>
      <a
        href="/api/draft-mode/disable"
        style={{
          color: '#F5F0E3',
          textDecoration: 'underline',
          cursor: 'pointer',
        }}
      >
        Avslutt utkastmodus
      </a>
    </div>
  )
}
