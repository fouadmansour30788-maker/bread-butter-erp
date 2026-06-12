'use client'

import {
  ResponsiveContainer, ComposedChart, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line,
  PieChart, Pie, Cell, ReferenceLine,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
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

export interface WeeklyMargin {
  week: string
  gm: number   // gross margin %
  nm: number   // net margin %
}

export interface RevBreakdown {
  dc: number   // direct cost as % of sales
  ic: number   // indirect cost as % of sales
  np: number   // net profit as % of sales (can be negative)
}

interface Props {
  weeklyData: WeeklyPL[]
  schoolData: SchoolPL[]
  categoryData: CategoryBreakdown[]
  marginData: WeeklyMargin[]
  revBreakdown: RevBreakdown
  breakEvenSales: number
  totalSales: number
}

function fmtM(v: number) {
  const abs = Math.abs(v)
  if (abs >= 1) return `${v.toFixed(1)}M`
  return `${(v * 1000).toFixed(0)}K`
}

function ChartTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
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

function PctTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
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
          <span style={{ fontWeight: 600, color: '#111827' }}>{(p.value as number).toFixed(1)}%</span>
        </div>
      ))}
    </div>
  )
}

export function ProfitCharts({
  weeklyData, schoolData, categoryData, marginData,
  revBreakdown, breakEvenSales,
}: Props) {
  const hasWeekly  = weeklyData.length > 0
  const hasCats    = categoryData.length > 0
  const hasSchools = schoolData.length > 0
  const hasMargin  = marginData.length > 0

  // Revenue composition donut data
  const revData = [
    { name: 'Direct Cost',   value: Math.max(0, revBreakdown.dc), color: '#fca5a5' },
    { name: 'Indirect Cost', value: Math.max(0, revBreakdown.ic), color: '#c7d2fe' },
    { name: revBreakdown.np >= 0 ? 'Net Profit' : 'Net Loss',
      value: Math.abs(revBreakdown.np),
      color: revBreakdown.np >= 0 ? '#34d399' : '#ef4444' },
  ]

  // School radar: normalize each school's metrics to 0–100 for radar display
  const maxSales = Math.max(...schoolData.map(s => s.sales), 1)
  const maxGP    = Math.max(...schoolData.map(s => s.grossProfit), 1)
  const radarData = schoolData.length >= 2
    ? [
        { metric: 'Sales Volume',  ...Object.fromEntries(schoolData.map(s => [s.name, +(s.sales / maxSales * 100).toFixed(1)])) },
        { metric: 'Gross Profit',  ...Object.fromEntries(schoolData.map(s => [s.name, +(s.grossProfit / maxGP * 100).toFixed(1)])) },
        { metric: 'Net Profit',    ...Object.fromEntries(schoolData.map(s => [s.name, +Math.max(0, s.netProfit / maxSales * 100).toFixed(1)])) },
        { metric: 'Gross Margin',  ...Object.fromEntries(schoolData.map(s => [s.name, +Math.max(0, s.sales > 0 ? s.grossProfit / s.sales * 100 : 0).toFixed(1)])) },
        { metric: 'Net Margin',    ...Object.fromEntries(schoolData.map(s => [s.name, +Math.max(0, s.sales > 0 ? s.netProfit / s.sales * 100 : 0).toFixed(1)])) },
      ]
    : []

  const RADAR_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444']

  return (
    <div className="space-y-6">

      {/* ── 1. Weekly P&L Trend ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
        <h3 className="font-semibold text-gray-900">Weekly P&L Trend</h3>
        <p className="text-xs text-gray-400 mt-0.5 mb-5">Bars = Sales / Direct Cost / Indirect Cost · Lines = Gross & Net Profit · Dashed = Break-even</p>
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
              <Bar dataKey="directCost"   name="Direct Cost"   fill="#fca5a5" fillOpacity={0.9} radius={[3,3,0,0]} barSize={28} />
              <Bar dataKey="indirectCost" name="Indirect Cost" fill="#c7d2fe" fillOpacity={0.9} radius={[3,3,0,0]} barSize={28} />
              <Bar dataKey="sales"        name="Sales"         fill="#fcd34d" fillOpacity={0.85} radius={[3,3,0,0]} barSize={28} />
              <Line dataKey="grossProfit" name="Gross Profit" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} type="monotone" />
              <Line dataKey="netProfit"   name="Net Profit"   stroke="#06b6d4" strokeWidth={2.5} strokeDasharray="5 4" dot={{ r: 4, fill: '#06b6d4' }} type="monotone" />
              {breakEvenSales > 0 && (
                <ReferenceLine
                  y={breakEvenSales}
                  stroke="#8b5cf6" strokeDasharray="6 3" strokeWidth={1.5}
                  label={{ value: `Break-even ${fmtM(breakEvenSales)}`, position: 'insideTopRight', fontSize: 10, fill: '#8b5cf6', fontWeight: 600 }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── 2. Margin Trend + Revenue Composition ───────────────────────── */}
      {(hasMargin || true) && (
        <div className="grid grid-cols-2 gap-6">

          {/* Margin Trend Area Chart */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
            <h3 className="font-semibold text-gray-900">Margin Trend</h3>
            <p className="text-xs text-gray-400 mt-0.5 mb-5">Gross margin (GM%) and net margin (NM%) over time · Target: 25% GM</p>
            {!hasMargin ? (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 13 }}>
                No data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={marginData} margin={{ top: 5, right: 24, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="gradGM" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.03} />
                    </linearGradient>
                    <linearGradient id="gradNM" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `${(v as number).toFixed(0)}%`} />
                  <Tooltip content={<PctTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <ReferenceLine y={25} stroke="#f59e0b" strokeDasharray="5 3" strokeWidth={1.5}
                    label={{ value: '25% target', position: 'insideTopRight', fontSize: 10, fill: '#f59e0b', fontWeight: 600 }} />
                  <Area type="monotone" dataKey="gm" name="Gross Margin %" stroke="#10b981" strokeWidth={2.5} fill="url(#gradGM)" dot={{ r: 4, fill: '#10b981' }} />
                  <Area type="monotone" dataKey="nm" name="Net Margin %"   stroke="#06b6d4" strokeWidth={2} fill="url(#gradNM)" strokeDasharray="5 3" dot={{ r: 3, fill: '#06b6d4' }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Revenue Composition Donut */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
            <h3 className="font-semibold text-gray-900">Revenue Composition</h3>
            <p className="text-xs text-gray-400 mt-0.5 mb-4">How every sales LBP is allocated across costs & profit</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <ResponsiveContainer width={175} height={175}>
                <PieChart>
                  <Pie data={revData} cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={3} dataKey="value">
                    {revData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: unknown) => [`${(v as number).toFixed(1)}%`]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {revData.map((d, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12 }}>
                        <span style={{ width: 9, height: 9, borderRadius: 3, background: d.color, display: 'inline-block', flexShrink: 0 }} />
                        <span style={{ color: '#6b7280' }}>{d.name}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: d.color }}>{d.value.toFixed(1)}%</span>
                    </div>
                    <div style={{ height: 5, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, d.value)}%`, background: d.color, borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. School Radar + Expense Donut ─────────────────────────────── */}
      <div className="grid grid-cols-2 gap-6">

        {/* Expense Category Donut */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <h3 className="font-semibold text-gray-900">Indirect Cost Breakdown</h3>
          <p className="text-xs text-gray-400 mt-0.5 mb-4">By expense category (millions LBP)</p>
          {!hasCats ? (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 13 }}>No expenses recorded yet</div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <ResponsiveContainer width={170} height={170}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={48} outerRadius={76} paddingAngle={3} dataKey="value">
                    {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
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

        {/* School Radar (2+ schools) OR Horizontal Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          {radarData.length >= 2 ? (
            <>
              <h3 className="font-semibold text-gray-900">School Multi-Metric Radar</h3>
              <p className="text-xs text-gray-400 mt-0.5 mb-2">Normalized 0–100 score across key performance metrics</p>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData} margin={{ top: 0, right: 30, bottom: 0, left: 30 }}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#6b7280' }} />
                  {schoolData.map((s, i) => (
                    <Radar
                      key={s.name}
                      name={s.name}
                      dataKey={s.name}
                      stroke={RADAR_COLORS[i % RADAR_COLORS.length]}
                      fill={RADAR_COLORS[i % RADAR_COLORS.length]}
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  ))}
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </>
          ) : (
            <>
              <h3 className="font-semibold text-gray-900">School Performance</h3>
              <p className="text-xs text-gray-400 mt-0.5 mb-4">Sales vs net profit per school (millions LBP)</p>
              {!hasSchools ? (
                <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 13 }}>No school data</div>
              ) : (
                <ResponsiveContainer width="100%" height={Math.max(180, schoolData.length * 52)}>
                  <BarChart data={schoolData} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={fmtM} />
                    <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: '#374151' }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="sales"       name="Sales"       fill="#fcd34d" radius={[0,4,4,0]} barSize={14} />
                    <Bar dataKey="grossProfit" name="Gross Profit" fill="#34d399" radius={[0,4,4,0]} barSize={14} />
                    <Bar dataKey="netProfit"   name="Net Profit"   fill="#06b6d4" radius={[0,4,4,0]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── 4. School Horizontal Comparison (always shown when radar shown) ─ */}
      {radarData.length >= 2 && hasSchools && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <h3 className="font-semibold text-gray-900">School Performance Comparison</h3>
          <p className="text-xs text-gray-400 mt-0.5 mb-5">Sales, gross profit, and net profit by school (millions LBP)</p>
          <ResponsiveContainer width="100%" height={Math.max(180, schoolData.length * 56)}>
            <BarChart data={schoolData} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={fmtM} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: '#374151' }} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="sales"       name="Sales"       fill="#fcd34d" radius={[0,4,4,0]} barSize={12} />
              <Bar dataKey="grossProfit" name="Gross Profit" fill="#34d399" radius={[0,4,4,0]} barSize={12} />
              <Bar dataKey="netProfit"   name="Net Profit"   fill="#06b6d4" radius={[0,4,4,0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── 5. Cost Structure vs Revenue (stacked area) ─────────────────── */}
      {hasWeekly && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <h3 className="font-semibold text-gray-900">Cost Structure vs Revenue</h3>
          <p className="text-xs text-gray-400 mt-0.5 mb-5">Stacked cost composition week by week</p>
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
