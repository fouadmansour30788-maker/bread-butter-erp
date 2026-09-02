import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import type { PurchaseOrder } from '@/lib/types'

// Product names are in Arabic; the built-in PDF base fonts (Helvetica etc.)
// have no Arabic glyphs and render them as garbled placeholder boxes, so a
// real Unicode font has to be embedded for that column specifically.
//
// Fetched from this site's own /public URL rather than a local filesystem
// path — Next.js's serverless file-tracing can't see into react-pdf's
// internal fs.readFile call to know a local path needs to be bundled, but
// a public/ asset is always served at its own URL regardless of tracing.
Font.register({
  family: 'NotoNaskhArabic',
  src: 'https://bread-butter-erp.vercel.app/fonts/NotoNaskhArabic-Regular.ttf',
})

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#182119' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: '#122A1C',
  },
  brand: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#122A1C' },
  tagline: { fontSize: 9, color: '#666666', marginTop: 3 },
  title: { fontSize: 14, fontFamily: 'Helvetica-Bold', textAlign: 'right', color: '#122A1C' },
  meta: { fontSize: 9, color: '#555555', textAlign: 'right', marginTop: 4 },
  section: { marginBottom: 18 },
  label: { fontSize: 8, color: '#888888', marginBottom: 3, letterSpacing: 0.5 },
  value: { fontSize: 12, fontFamily: 'Helvetica-Bold' },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: '#333333',
    paddingBottom: 6,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    paddingVertical: 7,
  },
  th: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#444444' },
  colProduct: { flex: 3 },
  productName: { flex: 3, fontFamily: 'NotoNaskhArabic', textAlign: 'right', fontSize: 11 },
  colQty: { flex: 1, textAlign: 'center' },
  colCost: { flex: 1.3, textAlign: 'right' },
  colTotal: { flex: 1.3, textAlign: 'right' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#122A1C',
  },
  totalLabel: { fontSize: 10, color: '#555555', marginRight: 16 },
  totalValue: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#122A1C' },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#999999',
    textAlign: 'center',
  },
})

export function PurchaseOrderDocument({ po }: { po: PurchaseOrder }) {
  const items = po.items ?? []
  const total = items.reduce((sum, item) => sum + item.quantity * Number(item.unit_cost_usd), 0)
  const poNumber = `PO-${po.id.slice(0, 8).toUpperCase()}`
  const date = new Date(po.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Bread &amp; Butter</Text>
            <Text style={styles.tagline}>Smart Bites for Bright Minds</Text>
          </View>
          <View>
            <Text style={styles.title}>PURCHASE ORDER</Text>
            <Text style={styles.meta}>{poNumber}</Text>
            <Text style={styles.meta}>{date}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>SUPPLIER</Text>
          <Text style={styles.value}>{po.supplier_name}</Text>
        </View>

        <View>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.colProduct]}>Product</Text>
            <Text style={[styles.th, styles.colQty]}>Qty</Text>
            <Text style={[styles.th, styles.colCost]}>Unit Cost</Text>
            <Text style={[styles.th, styles.colTotal]}>Line Total</Text>
          </View>
          {items.map(item => (
            <View style={styles.tableRow} key={item.id}>
              <Text style={styles.productName}>{item.product_name}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colCost}>${Number(item.unit_cost_usd).toFixed(2)}</Text>
              <Text style={styles.colTotal}>${(item.quantity * Number(item.unit_cost_usd)).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Grand Total</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>

        {po.notes && (
          <View style={{ marginTop: 26 }}>
            <Text style={styles.label}>NOTES</Text>
            <Text style={{ fontSize: 10 }}>{po.notes}</Text>
          </View>
        )}

        <Text style={styles.footer}>Bread &amp; Butter · North Lebanon · Generated {new Date().toLocaleDateString('en-US')}</Text>
      </Page>
    </Document>
  )
}
