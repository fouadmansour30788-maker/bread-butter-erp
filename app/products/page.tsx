import { createClient } from '@/lib/supabase/server'
import { formatLBP, formatUSD } from '@/lib/utils'
import { Plus } from 'lucide-react'
import Link from 'next/link'

const CATEGORIES = ['All', 'Chocolate', 'Snacks', 'Drinks', 'Bakery', 'Meals']

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams
  const supabase = await createClient()

  let query = supabase.from('products').select('*').order('category').order('name')
  if (category && category !== 'All') query = query.eq('category', category)

  const { data: products } = await query

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          <p className="text-gray-500 text-sm mt-1">{products?.length ?? 0} products in catalog</p>
        </div>
        <Link href="/products/new" className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <div className="flex gap-2">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={cat === 'All' ? '/products' : `/products?category=${cat}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              (category ?? 'All') === cat
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Product</th>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Category</th>
              <th className="text-center px-5 py-3 text-gray-500 font-medium">Qty/Box</th>
              <th className="text-right px-5 py-3 text-gray-500 font-medium">Cost (USD/unit)</th>
              <th className="text-right px-5 py-3 text-gray-500 font-medium">Sale Price (LBP)</th>
              <th className="text-right px-5 py-3 text-gray-500 font-medium">Profit/Unit</th>
              <th className="text-center px-5 py-3 text-gray-500 font-medium">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {products?.map((p) => {
              const costLbp = p.cost_price_usd * 90000
              const profitLbp = p.selling_price_lbp - costLbp
              const margin = ((profitLbp / p.selling_price_lbp) * 100).toFixed(0)
              return (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-900" dir="rtl">{p.name}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{p.category}</span>
                  </td>
                  <td className="px-5 py-3.5 text-center text-gray-700">{p.qty_per_box}</td>
                  <td className="px-5 py-3.5 text-right text-gray-700">{formatUSD(p.cost_price_usd)}</td>
                  <td className="px-5 py-3.5 text-right text-gray-700">{formatLBP(p.selling_price_lbp)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-green-600 font-medium">{formatLBP(Math.round(profitLbp))}</span>
                    <span className="text-gray-400 text-xs ml-1">({margin}%)</span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Link href={`/products/${p.id}/edit`} className="text-xs text-amber-600 hover:underline">Edit</Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
