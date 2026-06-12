'use client'

import dynamic from 'next/dynamic'
import type { WeeklyPL, SchoolPL, CategoryBreakdown } from './ProfitCharts'

const ProfitCharts = dynamic(
  () => import('./ProfitCharts').then(m => m.ProfitCharts),
  {
    ssr: false,
    loading: () => (
      <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 14 }}>
        Loading charts…
      </div>
    ),
  }
)

export function ProfitChartsWrapper(props: {
  weeklyData: WeeklyPL[]
  schoolData: SchoolPL[]
  categoryData: CategoryBreakdown[]
  breakEvenSales: number
  totalSales: number
}) {
  return <ProfitCharts {...props} />
}
