export type School = {
  id: string
  name: string
  location: string | null
  contact_name: string | null
  contact_phone: string | null
  is_active: boolean
  created_at: string
}

export type Product = {
  id: string
  name: string
  category: string | null
  qty_per_box: number
  cost_price_usd: number   // cost per unit in USD
  selling_price_lbp: number // selling price per unit in LBP
  is_active: boolean
  created_at: string
}

export type BatchStatus = 'open' | 'counted' | 'closed'

export type WeeklyBatch = {
  id: string
  school_id: string
  week_start: string
  week_end: string
  status: BatchStatus
  delivery_signed_staff: string | null
  delivery_signed_driver: string | null
  delivery_date: string | null
  notes: string | null
  created_at: string
  school?: School
}

export type DeliveryItem = {
  id: string
  batch_id: string
  product_id: string
  delivered_qty: number  // in units
  created_at: string
  product?: Product
}

export type ClosingCount = {
  id: string
  batch_id: string
  product_id: string
  remaining_qty: number
  counted_by: string | null
  counted_at: string
  product?: Product
}

export type WasteEntry = {
  id: string
  batch_id: string
  product_id: string
  waste_qty: number
  reason: string | null
  logged_by: string | null
  logged_at: string
  product?: Product
}

export type CashCollection = {
  id: string
  batch_id: string
  amount_collected_lbp: number  // in LBP
  received_by: string | null
  collected_at: string
  notes: string | null
}

export type ExpenseCategory =
  | 'salary'
  | 'electricity'
  | 'rent'
  | 'transport'
  | 'maintenance'
  | 'marketing'
  | 'communications'
  | 'other'

export type Expense = {
  id: string
  school_id: string | null
  category: ExpenseCategory
  description: string | null
  amount_lbp: number
  week_start: string
  created_at: string
  schools?: { name: string } | null
}

export type ReconciliationSummary = {
  batch_id: string
  school_id: string
  school_name: string
  week_start: string
  week_end: string
  status: BatchStatus
  total_value_delivered_lbp: number
  expected_cash_lbp: number
  actual_cash_lbp: number
  variance_lbp: number
}
