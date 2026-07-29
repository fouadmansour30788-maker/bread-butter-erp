'use client'

import { motion } from 'framer-motion'

/**
 * Reveals text one character at a time (staggered slide+fade), each char
 * clipped inside its own overflow-hidden box so it "rises into place"
 * rather than just fading. Spaces render as literal spaces, not animated.
 */
export function SplitText({ text, delay = 0, stagger = 0.02 }: { text: string; delay?: number; stagger?: number }) {
  const chars = text.split('')

  return (
    <>
      {chars.map((char, i) =>
        char === ' ' ? (
          <span key={i}>&nbsp;</span>
        ) : (
          <span key={i} className="inline-block overflow-hidden align-bottom">
            <motion.span
              className="inline-block"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              transition={{ duration: 0.5, delay: delay + i * stagger, ease: [0.22, 1, 0.36, 1] }}
            >
              {char}
            </motion.span>
          </span>
        )
      )}
    </>
  )
}
