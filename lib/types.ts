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
  weight: string | null
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

export type StockTransfer = {
  id: string
  from_batch_id: string
  to_batch_id: string
  product_id: string
  qty: number
  notes: string | null
  transferred_at: string
  product?: { name: string; qty_per_box: number }
  from_batch?: { school: { name: string }; week_start: string }
  to_batch?: { school: { name: string }; week_start: string }
}

export type ApplicationStatus = 'new' | 'contacted' | 'onboarded' | 'rejected'
export type SchoolType = 'kindergarten' | 'primary' | 'secondary' | 'mixed'
export type DeliveryFrequency = 'daily' | 'few_times_week' | 'events_only'
export type ReferralSource = 'referral' | 'social_media' | 'search' | 'other'
export type ServiceInterest = 'brunch_box' | 'bakery_menu' | 'catering'

export type SchoolApplication = {
  id: string
  school_name: string
  contact_name: string
  phone: string
  email: string
  location: string | null
  school_type: SchoolType | null
  student_count: number | null
  services_interested: ServiceInterest[]
  delivery_frequency: DeliveryFrequency | null
  preferred_start_date: string | null
  current_provider: string | null
  dietary_considerations: string | null
  referral_source: ReferralSource | null
  message: string | null
  status: ApplicationStatus
  created_at: string
}

export type PurchaseOrderItem = {
  id: string
  purchase_order_id: string
  product_id: string | null
  product_name: string
  quantity: number
  unit_cost_usd: number
  created_at: string
}

export type PurchaseOrder = {
  id: string
  supplier_name: string
  notes: string | null
  created_at: string
  items?: PurchaseOrderItem[]
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
