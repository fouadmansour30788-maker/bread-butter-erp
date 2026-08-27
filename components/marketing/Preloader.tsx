'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { colors } from './theme'

const SEEN_KEY = 'bb-preloader-seen'

/**
 * Brief branded intro, once per browser session (sessionStorage) — not on
 * every reload/navigation. `show` defaults false so SSR and the initial
 * client render match (no hydration mismatch); it only flips true inside
 * useEffect, after mount, if this session hasn't seen it yet.
 */
export function Preloader() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(SEEN_KEY)) return
    sessionStorage.setItem(SEEN_KEY, '1')
    setShow(true)
    const t = setTimeout(() => setShow(false), 1500)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background: colors.forestDeep }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <Image src="/logo-small.png" alt="Bread & Butter" width={192} height={192} unoptimized priority className="w-24 h-24" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
