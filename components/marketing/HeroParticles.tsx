'use client'

import { useEffect, useRef } from 'react'

type Particle = { x: number; y: number; r: number; vx: number; vy: number; o: number }

/**
 * Lightweight Canvas 2D ambient particle drift (warm floating motes) for
 * the hero background — the "wow" of a dynamic background without pulling
 * in WebGL/Three.js, consistent with the CSS/Framer Motion approach chosen
 * for the rest of the site over a full 3D scene.
 */
export function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let width = 0
    let height = 0
    let particles: Particle[] = []
    let frameId: number

    function resize() {
      width = canvas!.clientWidth
      height = canvas!.clientHeight
      canvas!.width = width * devicePixelRatio
      canvas!.height = height * devicePixelRatio
      ctx!.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
    }

    function init() {
      particles = Array.from({ length: 36 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 1 + Math.random() * 2.5,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -0.05 - Math.random() * 0.15,
        o: 0.15 + Math.random() * 0.35,
      }))
    }

    function tick() {
      ctx!.clearRect(0, 0, width, height)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width }
        if (p.x < -10) p.x = width + 10
        if (p.x > width + 10) p.x = -10
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(227,166,47,${p.o})`
        ctx!.fill()
      }
      frameId = requestAnimationFrame(tick)
    }

    resize()
    init()
    tick()

    const onResize = () => { resize(); init() }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden />
}
