'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence, type PanInfo } from 'framer-motion'
import { Apple, Sandwich, Carrot, Milk, RotateCcw } from 'lucide-react'
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
  const isFull = slots.every((s) => s !== null)
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
    <div className="flex flex-col items-center">
      <div
        ref={boxRef}
        className="grid grid-cols-2 gap-3 p-5 rounded-[1.75rem] mb-8"
        style={{ background: colors.creamDeep, border: `2px solid ${colors.sageLight}` }}
      >
        {slots.map((slot, i) => (
          <div
            key={i}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center"
            style={{ background: 'white', border: `1px dashed ${colors.sage}` }}
          >
            <AnimatePresence mode="wait">
              {slot ? (
                <motion.div
                  key={slot.id}
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                >
                  <slot.icon size={32} color={colors.forest} />
                </motion.div>
              ) : (
                <span className="w-2 h-2 rounded-full" style={{ background: colors.sageLight }} />
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
        {FOODS.map((food) => (
          <motion.button
            key={food.id}
            type="button"
            drag={!isFull}
            dragSnapToOrigin
            dragElastic={0.15}
            whileDrag={{ scale: 1.15, zIndex: 10 }}
            onDragEnd={(_, info) => handleDragEnd(food, info)}
            onClick={() => addFood(food)}
            disabled={isFull}
            className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
            style={{ background: 'white', border: `1px solid ${colors.sageLight}`, touchAction: 'none' }}
          >
            <food.icon size={22} color={colors.forestDeep} />
            <span className="text-xs font-medium" style={{ color: colors.inkSoft }}>{food.label}</span>
          </motion.button>
        ))}
      </div>
      <p className="text-xs mb-6 -mt-4" style={{ color: colors.inkSoft, opacity: 0.7 }}>Click or drag into the box</p>

      <div className="flex flex-col items-center gap-3">
        <AnimatePresence>
          {isFull && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="font-display text-base sm:text-lg text-center"
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
    </div>
  )
}
