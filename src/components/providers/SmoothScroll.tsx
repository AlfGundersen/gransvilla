'use client'

import Lenis from 'lenis'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    // Don't initialize Lenis on Sanity Studio
    if (pathname?.startsWith('/studio')) {
      return
    }

    // DEBUG(nav-bisect): ?nolenis skips smooth scrolling entirely, so one
    // deploy can test the page with and without it.
    if (new URLSearchParams(window.location.search).has('nolenis')) {
      return
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wrapper: window,
      content: document.documentElement,
    })

    lenisRef.current = lenis

    // The loop has to be cancellable. This effect re-runs on every route
    // change, so a loop left running would outlive its Lenis instance and
    // keep calling raf() on a destroyed one — one extra loop per page
    // visited, all of them on the main thread for the rest of the session.
    let frame = 0

    function raf(time: number) {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }

    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [pathname])

  return <>{children}</>
}
