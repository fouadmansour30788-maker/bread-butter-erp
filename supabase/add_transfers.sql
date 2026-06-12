-- ── Step 1: weight field on products ──────────────────────────────────────────
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight text;

-- ── Step 2: stock_transfers table ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock_transfers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_batch_id   uuid REFERENCES weekly_batches(id) ON DELETE CASCADE,
  to_batch_id     uuid REFERENCES weekly_batches(id) ON DELETE CASCADE,
  product_id      uuid REFERENCES products(id),
  qty             integer NOT NULL CHECK (qty > 0),
  notes           text,
  transferred_at  timestamptz DEFAULT now()
);

-- ── Step 3: rebuild reconciliation_summary to include transfers ────────────────
CREATE OR REPLACE VIEW reconciliation_summary AS
SELECT
  wb.id AS batch_id,
  wb.school_id,
  s.name AS school_name,
  wb.week_start,
  wb.week_end,
  wb.status,
  -- total value of goods delivered (before transfers)
  COALESCE((
    SELECT SUM(di2.delivered_qty * p2.selling_price_lbp)
    FROM delivery_items di2
    JOIN products p2 ON p2.id = di2.product_id
    WHERE di2.batch_id = wb.id
  ), 0) AS total_value_delivered_lbp,
  -- expected cash = (delivered + incoming - outgoing - remaining - waste) * price
  COALESCE((
    SELECT SUM(
      (di2.delivered_qty
        + COALESCE(in_t.qty,  0)
        - COALESCE(out_t.qty, 0)
        - COALESCE(cc.remaining_qty, 0)
        - COALESCE(we_sum.waste_qty, 0)
      ) * p2.selling_price_lbp
    )
    FROM delivery_items di2
    JOIN products p2 ON p2.id = di2.product_id
    LEFT JOIN closing_counts cc
      ON cc.batch_id = di2.batch_id AND cc.product_id = di2.product_id
    LEFT JOIN (
      SELECT batch_id, product_id, SUM(waste_qty) AS waste_qty
      FROM waste_entries GROUP BY batch_id, product_id
    ) we_sum ON we_sum.batch_id = di2.batch_id AND we_sum.product_id = di2.product_id
    LEFT JOIN (
      SELECT to_batch_id AS batch_id, product_id, SUM(qty) AS qty
      FROM stock_transfers GROUP BY to_batch_id, product_id
    ) in_t ON in_t.batch_id = di2.batch_id AND in_t.product_id = di2.product_id
    LEFT JOIN (
      SELECT from_batch_id AS batch_id, product_id, SUM(qty) AS qty
      FROM stock_transfers GROUP BY from_batch_id, product_id
    ) out_t ON out_t.batch_id = di2.batch_id AND out_t.product_id = di2.product_id
    WHERE di2.batch_id = wb.id
  ), 0) AS expected_cash_lbp,
  COALESCE((
    SELECT SUM(amount_collected_lbp) FROM cash_collections WHERE batch_id = wb.id
  ), 0) AS actual_cash_lbp,
  -- variance = expected - actual
  COALESCE((
    SELECT SUM(
      (di2.delivered_qty
        + COALESCE(in_t.qty,  0)
        - COALESCE(out_t.qty, 0)
        - COALESCE(cc.remaining_qty, 0)
        - COALESCE(we_sum.waste_qty, 0)
      ) * p2.selling_price_lbp
    )
    FROM delivery_items di2
    JOIN products p2 ON p2.id = di2.product_id
    LEFT JOIN closing_counts cc
      ON cc.batch_id = di2.batch_id AND cc.product_id = di2.product_id
    LEFT JOIN (
      SELECT batch_id, product_id, SUM(waste_qty) AS waste_qty
      FROM waste_entries GROUP BY batch_id, product_id
    ) we_sum ON we_sum.batch_id = di2.batch_id AND we_sum.product_id = di2.product_id
    LEFT JOIN (
      SELECT to_batch_id AS batch_id, product_id, SUM(qty) AS qty
      FROM stock_transfers GROUP BY to_batch_id, product_id
    ) in_t ON in_t.batch_id = di2.batch_id AND in_t.product_id = di2.product_id
    LEFT JOIN (
      SELECT from_batch_id AS batch_id, product_id, SUM(qty) AS qty
      FROM stock_transfers GROUP BY from_batch_id, product_id
    ) out_t ON out_t.batch_id = di2.batch_id AND out_t.product_id = di2.product_id
    WHERE di2.batch_id = wb.id
  ), 0) - COALESCE((
    SELECT SUM(amount_collected_lbp) FROM cash_collections WHERE batch_id = wb.id
  ), 0) AS variance_lbp
FROM weekly_batches wb
JOIN schools s ON s.id = wb.school_id;
