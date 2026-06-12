'use client'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-8 flex items-center justify-center min-h-screen" style={{ background: '#f8fafc' }}>
      <div className="bg-white rounded-2xl border border-red-100 p-8 max-w-md text-center shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <span className="text-red-500 text-xl">!</span>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-500 text-sm mb-1">{error.message}</p>
        <p className="text-gray-400 text-xs mb-6">Check that your Supabase environment variables are set correctly in Vercel.</p>
        <button onClick={reset} className="bg-amber-500 hover:bg-amber-400 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors">
          Try again
        </button>
      </div>
    </div>
  )
}
