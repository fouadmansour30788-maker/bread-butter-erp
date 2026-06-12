import { createClient } from '@/lib/supabase/server'
import { formatLBP } from '@/lib/utils'
import { PlusCircle, Receipt } from 'lucide-react'
import Link from 'next/link'
import { DeleteExpenseButton } from '@/components/DeleteExpenseButton'

const CATEGORY_LABELS: Record<string, string> = {
  salary: 'Salaries',
  electricity: 'Electricity',
  rent: 'Rent',
  transport: 'Transport',
  maintenance: 'Maintenance',
  marketing: 'Marketing',
  communications: 'Communications',
  other: 'Other',
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  salary:         { bg: '#fef3c7', text: '#92400e' },
  electricity:    { bg: '#dbeafe', text: '#1e40af' },
  rent:           { bg: '#d1fae5', text: '#065f46' },
  transport:      { bg: '#ede9fe', text: '#5b21b6' },
  maintenance:    { bg: '#fee2e2', text: '#991b1b' },
  marketing:      { bg: '#fce7f3', text: '#9d174d' },
  communications: { bg: '#cffafe', text: '#155e75' },
  other:          { bg: '#f3f4f6', text: '#374151' },
}

export default async function ExpensesPage() {
  const supabase = await createClient()

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*, schools(name)')
    .order('week_start', { ascending: false })
    .order('created_at', { ascending: false })

  const total = (expenses ?? []).reduce((s, e) => s + Number(e.amount_lbp), 0)

  // Group by category for summary row
  const catTotals: Record<string, number> = {}
  for (const e of expenses ?? []) {
    catTotals[e.category] = (catTotals[e.category] ?? 0) + Number(e.amount_lbp)
  }

  return (
    <div className="p-8 space-y-8" style={{ background: '#f8fafc', minHeight: '100vh' }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Expenses</h2>
          <p className="text-gray-500 text-sm mt-0.5">Track indirect costs: salaries, electricity, rent, and more</p>
        </div>
        <Link
          href="/expenses/new"
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
          style={{ boxShadow: '0 4px 12px rgba(245,158,11,0.30)' }}
        >
          <PlusCircle size={16} />
          Add Expense
        </Link>
      </div>

      {/* Category Summary Cards */}
      {Object.keys(catTotals).length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(catTotals)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 4)
            .map(([cat, amt]) => {
              const col = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.other
              return (
                <div key={cat} className="bg-white rounded-2xl border border-gray-200 p-4" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: col.bg, color: col.text }}
                    >
                      {CATEGORY_LABELS[cat] ?? cat}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{formatLBP(amt)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{((amt / total) * 100).toFixed(1)}% of total</p>
                </div>
              )
            })}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">All Expenses</h3>
          <span className="text-sm text-gray-500">{expenses?.length ?? 0} entries</span>
        </div>

        {!expenses?.length ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
              <Receipt size={28} className="text-amber-600" />
            </div>
            <p className="text-gray-700 font-semibold text-lg">No expenses yet</p>
            <p className="text-gray-400 text-sm mt-1">Add salary, electricity, rent and other indirect costs here</p>
            <Link
              href="/expenses/new"
              className="inline-flex items-center gap-2 mt-5 bg-amber-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-amber-400 transition-colors"
            >
              <PlusCircle size={15} /> Add First Expense
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Week</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">School</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Category</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Description</th>
                  <th className="text-right px-5 py-3 text-gray-500 font-medium">Amount (LBP)</th>
                  <th className="text-right px-5 py-3 text-gray-500 font-medium">≈ USD</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => {
                  const col = CATEGORY_COLORS[exp.category] ?? CATEGORY_COLORS.other
                  const usd = Number(exp.amount_lbp) / 90000
                  const school = exp.schools as { name: string } | null
                  return (
                    <tr key={exp.id} className="border-b border-gray-50 hover:bg-amber-50/30 transition-colors">
                      <td className="px-5 py-3 text-gray-500 text-xs">{exp.week_start}</td>
                      <td className="px-5 py-3 text-gray-700">
                        {school?.name ?? (
                          <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">Company-Wide</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ background: col.bg, color: col.text }}>
                          {CATEGORY_LABELS[exp.category] ?? exp.category}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{exp.description ?? '—'}</td>
                      <td className="px-5 py-3 text-right font-semibold text-gray-900">{formatLBP(Number(exp.amount_lbp))}</td>
                      <td className="px-5 py-3 text-right text-gray-400 text-xs">${usd.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                      <td className="px-3 py-3">
                        <DeleteExpenseButton id={exp.id} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50">
                  <td colSpan={4} className="px-5 py-3 font-semibold text-gray-700">Total</td>
                  <td className="px-5 py-3 text-right font-bold text-gray-900">{formatLBP(total)}</td>
                  <td className="px-5 py-3 text-right text-gray-400 text-xs font-medium">
                    ${(total / 90000).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
