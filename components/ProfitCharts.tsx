'use client'

import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from 'recharts'

export interface WeeklyPL {
  week: string
  sales: number
  directCost: number
  grossProfit: number
  indirectCost: number
  netProfit: number
}

export interface SchoolPL {
  name: string
  sales: number
  grossProfit: number
  netProfit: number
}

export interface CategoryBreakdown {
  name: string
  value: number
  color: string
}

interface Props {
  weeklyData: WeeklyPL[]
  schoolData: SchoolPL[]
  categoryData: CategoryBreakdown[]
  breakEvenSales: number
  totalSales: number
}

function fmtM(v: number) {
  const abs = Math.abs(v)
  if (abs >= 1) return `${v.toFixed(1)}M`
  return `${(v * 1000).toFixed(0)}K`
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'white', border: '1px solid #e5e7eb', borderRadius: 12,
      padding: '10px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 12,
    }}>
      {label && <p style={{ fontWeight: 600, color: '#374151', marginBottom: 8 }}>{label}</p>}
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0, display: 'inline-block' }} />
          <span style={{ color: '#6b7280' }}>{p.name}:</span>
          <span style={{ fontWeight: 600, color: '#111827' }}>{fmtM(p.value)} LBP</span>
        </div>
      ))}
    </div>
  )
}

export function ProfitCharts({ weeklyData, schoolData, categoryData, breakEvenSales, totalSales }: Props) {
  const hasWeekly = weeklyData.length > 0
  const hasCats = categoryData.length > 0
  const hasSchools = schoolData.length > 0

  return (
    <div className="space-y-6">

      {/* ── Weekly P&L Trend ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
        <h3 className="font-semibold text-gray-900">Weekly P&L Trend</h3>
        <p className="text-xs text-gray-400 mt-0.5 mb-5">Bars = Sales / Direct Cost / Indirect Cost &nbsp;·&nbsp; Lines = Gross & Net Profit &nbsp;·&nbsp; Dashed = Break-even</p>
        {!hasWeekly ? (
          <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 14 }}>
            No batch data yet — create reconciled batches to see trends
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={weeklyData} margin={{ top: 8, right: 24, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={fmtM} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />

              {/* Cost bars (behind) */}
              <Bar dataKey="directCost"   name="Direct Cost"   fill="#fca5a5" fillOpacity={0.9} radius={[3,3,0,0]} barSize={28} />
              <Bar dataKey="indirectCost" name="Indirect Cost" fill="#c7d2fe" fillOpacity={0.9} radius={[3,3,0,0]} barSize={28} />
              {/* Sales bar */}
              <Bar dataKey="sales"        name="Sales"         fill="#fcd34d" fillOpacity={0.85} radius={[3,3,0,0]} barSize={28} />

              {/* Profit lines */}
              <Line dataKey="grossProfit" name="Gross Profit" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} type="monotone" />
              <Line dataKey="netProfit"   name="Net Profit"   stroke="#06b6d4" strokeWidth={2.5} strokeDasharray="5 4" dot={{ r: 4, fill: '#06b6d4' }} type="monotone" />

              {/* Break-even reference */}
              {breakEvenSales > 0 && (
                <ReferenceLine
                  y={breakEvenSales}
                  stroke="#8b5cf6"
                  strokeDasharray="6 3"
                  strokeWidth={1.5}
                  label={{ value: `Break-even ${fmtM(breakEvenSales)}`, position: 'insideTopRight', fontSize: 10, fill: '#8b5cf6', fontWeight: 600 }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Pie + School side-by-side ────────────────────────── */}
      <div className="grid grid-cols-2 gap-6">

        {/* Expense Category Donut */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <h3 className="font-semibold text-gray-900">Indirect Cost Breakdown</h3>
          <p className="text-xs text-gray-400 mt-0.5 mb-4">By expense category (millions LBP)</p>
          {!hasCats ? (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 13 }}>
              No expenses recorded yet
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <ResponsiveContainer width={170} height={170}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={76}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: unknown) => [`${(v as number).toFixed(1)}M LBP`]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                {categoryData.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: c.color, display: 'inline-block', flexShrink: 0 }} />
                      <span style={{ color: '#6b7280' }}>{c.name}</span>
                    </div>
                    <span style={{ fontWeight: 600, color: '#111827' }}>{fmtM(c.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* School Comparison */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <h3 className="font-semibold text-gray-900">School Performance</h3>
          <p className="text-xs text-gray-400 mt-0.5 mb-4">Sales vs net profit per school (millions LBP)</p>
          {!hasSchools ? (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 13 }}>
              No school data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(180, schoolData.length * 52)}>
              <BarChart data={schoolData} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={fmtM} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: '#374151' }} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="sales"     name="Sales"      fill="#fcd34d" radius={[0,4,4,0]} barSize={14} />
                <Bar dataKey="grossProfit" name="Gross Profit" fill="#34d399" radius={[0,4,4,0]} barSize={14} />
                <Bar dataKey="netProfit" name="Net Profit"  fill="#06b6d4" radius={[0,4,4,0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Cost Structure (stacked) ─────────────────────────── */}
      {hasWeekly && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <h3 className="font-semibold text-gray-900">Cost Structure vs Revenue</h3>
          <p className="text-xs text-gray-400 mt-0.5 mb-5">Stacked cost composition against each week's sales</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData} margin={{ top: 8, right: 24, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={fmtM} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              <Bar dataKey="directCost"   name="Direct Cost"   stackId="cost" fill="#fca5a5" />
              <Bar dataKey="indirectCost" name="Indirect Cost" stackId="cost" fill="#c7d2fe" radius={[3,3,0,0]} />
              <Bar dataKey="sales"        name="Sales"         fill="none" stroke="#f59e0b" strokeWidth={2} radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
