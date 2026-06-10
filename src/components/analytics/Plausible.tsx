'use client'

import { useEffect } from 'react'

let initialized = false

export default function PlausibleAnalytics() {
  useEffect(() => {
    if (initialized) return
    initialized = true
    import('@plausible-analytics/tracker').then(({ init }) => {
      init({
        domain: 'gransvilla.no',
        autoCapturePageviews: true,
      })
    })
  }, [])

  return null
}
