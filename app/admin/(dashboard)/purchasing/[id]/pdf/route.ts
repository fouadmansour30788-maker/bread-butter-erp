import { createElement } from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { PurchaseOrderDocument } from '@/components/PurchaseOrderPdf'
import type { PurchaseOrder } from '@/lib/types'

export const runtime = 'nodejs'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: po } = await supabase
    .from('purchase_orders')
    .select('*, items:purchase_order_items(*)')
    .eq('id', id)
    .single()

  if (!po) {
    return new Response('Purchase order not found', { status: 404 })
  }

  // react-pdf's renderToBuffer types expect a ReactElement<DocumentProps>
  // specifically, which a wrapper function component can't statically prove.
  const element = createElement(PurchaseOrderDocument, { po: po as PurchaseOrder })
  const buffer = await renderToBuffer(element as Parameters<typeof renderToBuffer>[0])

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="PO-${id.slice(0, 8)}.pdf"`,
    },
  })
}
