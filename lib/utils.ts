import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatLBP(amount: number) {
  return new Intl.NumberFormat('en-US').format(amount) + ' LBP'
}

export function formatUSD(amount: number) {
  return '$' + amount.toFixed(2)
}

export function getWeekRange(date: Date = new Date()) {
  const day = date.getDay()
  const diffToMonday = (day === 0 ? -6 : 1 - day)
  const monday = new Date(date)
  monday.setDate(date.getDate() + diffToMonday)
  monday.setHours(0, 0, 0, 0)
  const friday = new Date(monday)
  friday.setDate(monday.getDate() + 4)
  return {
    week_start: monday.toISOString().split('T')[0],
    week_end: friday.toISOString().split('T')[0],
  }
}
