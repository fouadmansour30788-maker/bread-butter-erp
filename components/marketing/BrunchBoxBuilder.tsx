'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence, type PanInfo } from 'framer-motion'
import { Apple, Sandwich, Carrot, Milk, RotateCcw, Plus } from 'lucide-react'
import { TiltCard, TiltLayer } from './TiltCard'
import { ConfettiBurst } from './ConfettiBurst'
import { colors } from './theme'

const FOODS = [
  { id: 'sandwich', icon: Sandwich, label: 'Sandwich' },
  { id: 'apple', icon: Apple, label: 'Fruit' },
  { id: 'carrot', icon: Carrot, label: 'Veggies' },
  { id: 'milk', icon: Milk, label: 'Drink' },
] as const

type Food = (typeof FOODS)[number]

export function BrunchBoxBuilder() {
  const [slots, setSlots] = useState<(Food | null)[]>([null, null, null, null])
  const filledCount = slots.filter((s) => s !== null).length
  const isFull = filledCount === slots.length
  const boxRef = useRef<HTMLDivElement>(null)

  function addFood(food: Food) {
    setSlots((prev) => {
      const idx = prev.findIndex((s) => s === null)
      if (idx === -1) return prev
      const next = [...prev]
      next[idx] = food
      return next
    })
  }

  function reset() {
    setSlots([null, null, null, null])
  }

  function handleDragEnd(food: Food, info: PanInfo) {
    const box = boxRef.current
    if (!box) return
    const rect = box.getBoundingClientRect()
    const { x, y } = info.point
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      addFood(food)
    }
  }

  return (
    <TiltCard maxTilt={4} className="max-w-md mx-auto">
      <div
        className="relative overflow-hidden rounded-[2rem] p-8 sm:p-10"
        style={{ background: 'white', boxShadow: '0 30px 60px -24px rgba(18,42,28,0.35)', border: `1px solid ${colors.sageLight}` }}
      >
        {isFull && <ConfettiBurst />}

        <TiltLayer z={30} className="flex flex-col items-center">
          {/* Lunchbox */}
          <div
            ref={boxRef}
            className="relative w-full rounded-[1.5rem] p-4 mb-3"
            style={{ background: colors.forestDeep, boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.2)' }}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="font-display text-sm text-white">Your Brunch Box</span>
              <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>{filledCount}/{slots.length}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {slots.map((slot, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-2xl flex items-center justify-center"
                  style={{ background: colors.cream }}
                >
                  <AnimatePresence mode="wait">
                    {slot ? (
                      <motion.div
                        key={slot.id}
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 14 }}
                      >
                        <slot.icon size={34} color={colors.forest} strokeWidth={1.75} />
                      </motion.div>
                    ) : (
                      <span
                        className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ border: `1.5px dashed ${colors.sage}` }}
                      >
                        <Plus size={14} color={colors.sage} />
                      </span>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5 mb-7">
            {slots.map((slot, i) => (
              <span
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: slot ? 18 : 6,
                  height: 6,
                  background: slot ? colors.gold : colors.sageLight,
                }}
              />
            ))}
          </div>

          {/* Palette */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-2">
            {FOODS.map((food, i) => (
              <motion.button
                key={food.id}
                type="button"
                drag={!isFull}
                dragSnapToOrigin
                dragElastic={0.15}
                whileDrag={{ scale: 1.15, zIndex: 10 }}
                whileHover={!isFull ? { scale: 1.08 } : undefined}
                whileTap={!isFull ? { scale: 0.94 } : undefined}
                animate={!isFull ? { y: [0, -5, 0] } : { y: 0 }}
                transition={!isFull ? { y: { duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 } } : undefined}
                onDragEnd={(_, info) => handleDragEnd(food, info)}
                onClick={() => addFood(food)}
                disabled={isFull}
                className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl disabled:opacity-40"
                style={{ background: colors.creamDeep, border: `1px solid ${colors.sageLight}`, touchAction: 'none' }}
              >
                <food.icon size={22} color={colors.forestDeep} />
                <span className="text-xs font-medium" style={{ color: colors.inkSoft }}>{food.label}</span>
              </motion.button>
            ))}
          </div>
          <p className="text-xs mb-6" style={{ color: colors.inkSoft, opacity: 0.6 }}>Click or drag into the box</p>

          <div className="flex flex-col items-center gap-3 min-h-[2.5rem] justify-center">
            <AnimatePresence>
              {isFull && (
                <motion.p
                  initial={{ opacity: 0, y: 8, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-display text-lg text-center"
                  style={{ color: colors.forestDeep }}
                >
                  That&apos;s a balanced Brunch Box!
                </motion.p>
              )}
            </AnimatePresence>
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-1.5 text-xs font-medium"
              style={{ color: colors.inkSoft }}
            >
              <RotateCcw size={13} /> Reset
            </button>
          </div>
        </TiltLayer>
      </div>
    </TiltCard>
  )
}
