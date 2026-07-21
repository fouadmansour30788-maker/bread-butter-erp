'use client'

import { useActionState } from 'react'
import { Lock, ShoppingBag } from 'lucide-react'
import { login, type LoginState } from './actions'

const initialState: LoginState = {}

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState)

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#f8fafc' }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #b45309)', boxShadow: '0 8px 20px rgba(180,83,9,0.30)' }}
          >
            <ShoppingBag size={26} color="white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Bread &amp; Butter ERP</h1>
          <p className="text-sm text-gray-500 mt-1">Staff access only</p>
        </div>

        <form action={formAction} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <label className="block">
            <span className="block text-xs font-semibold text-gray-600 mb-1.5">Password</span>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="password"
                type="password"
                required
                autoFocus
                className="w-full rounded-lg pl-9 pr-3 py-2.5 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </div>
          </label>

          {state.error && <p className="text-sm text-red-600">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors"
          >
            {pending ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
