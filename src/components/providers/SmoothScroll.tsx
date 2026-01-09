'use client'

import Lenis from 'lenis'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    // Don't initialize Lenis on Sanity Studio
    if (pathname?.startsWith('/studio')) {
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

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
      lenisRef.current = null
    }
  }, [pathname])

  return <>{children}</>
}
