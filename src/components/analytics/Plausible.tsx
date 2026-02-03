'use client'

import { useEffect } from 'react'

export default function PlausibleAnalytics() {
  useEffect(() => {
    import('@plausible-analytics/tracker').then(({ init }) => {
      init({
        domain: 'gransvilla.no',
        autoCapturePageviews: true,
      })
    })
  }, [])

  return null
}
