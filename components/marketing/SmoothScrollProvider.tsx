'use client'

import { useEffect, type ReactNode } from 'react'
import Lenis from 'lenis'

/**
 * Site-wide inertia scrolling. Uses Lenis's default (non-wrapper) mode,
 * which smooths native document scroll via requestAnimationFrame rather
 * than a transform-based virtual scroll — real window.scrollY keeps
 * updating, so it coexists with Framer Motion's useScroll() and CSS
 * `position: sticky` (both used throughout this page, e.g. DayInLife's
 * pinned scrollytelling and every ParallaxSection/ParallaxMedia).
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
    })

    let frameId: number
    function raf(time: number) {
      lenis.raf(time)
      frameId = requestAnimationFrame(raf)
    }
    frameId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frameId)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
