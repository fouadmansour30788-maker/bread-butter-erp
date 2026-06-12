'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import type { WeeklyPL, SchoolPL, CategoryBreakdown, WeeklyMargin, RevBreakdown } from './ProfitCharts'

export type ChartProps = {
  weeklyData: WeeklyPL[]
  schoolData: SchoolPL[]
  categoryData: CategoryBreakdown[]
  marginData: WeeklyMargin[]
  revBreakdown: RevBreakdown
  breakEvenSales: number
  totalSales: number
}

const ProfitCharts = dynamic<ChartProps>(
  () => import('./ProfitCharts').then(m => m.ProfitCharts as React.ComponentType<ChartProps>),
  {
    ssr: false,
    loading: () => (
      <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 14 }}>
        Loading charts…
      </div>
    ),
  }
)

export function ProfitChartsWrapper(props: ChartProps) {
  return <ProfitCharts {...props} />
}
