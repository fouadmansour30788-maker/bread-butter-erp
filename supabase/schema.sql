-- Bread & Butter ERP Schema
-- Prices: cost in USD per unit, selling price in LBP per unit

-- Schools
create table schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  contact_name text,
  contact_phone text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Products
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  qty_per_box integer not null default 1,
  cost_price_usd numeric(10,4) not null,   -- cost per unit in USD
  selling_price_lbp integer not null,       -- selling price per unit in LBP
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Weekly Batches (one per school per week)
create table weekly_batches (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete cascade,
  week_start date not null,
  week_end date not null,
  status text default 'open' check (status in ('open', 'counted', 'closed')),
  delivery_signed_staff text,
  delivery_signed_driver text,
  delivery_date timestamptz,
  notes text,
  created_at timestamptz default now(),
  unique(school_id, week_start)
);

-- Delivery Items (quantities delivered per batch, tracked in units)
create table delivery_items (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references weekly_batches(id) on delete cascade,
  product_id uuid references products(id),
  delivered_qty integer not null default 0,  -- units
  created_at timestamptz default now(),
  unique(batch_id, product_id)
);

-- Closing Counts (end-of-week physical count, in units)
create table closing_counts (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references weekly_batches(id) on delete cascade,
  product_id uuid references products(id),
  remaining_qty integer not null default 0,
  counted_by text,
  counted_at timestamptz default now(),
  unique(batch_id, product_id)
);

-- Waste Entries
create table waste_entries (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references weekly_batches(id) on delete cascade,
  product_id uuid references products(id),
  waste_qty integer not null default 0,
  reason text,
  logged_by text,
  logged_at timestamptz default now()
);

-- Cash Collections (in LBP)
create table cash_collections (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references weekly_batches(id) on delete cascade,
  amount_collected_lbp bigint not null default 0,
  received_by text,
  collected_at timestamptz default now(),
  notes text
);

-- Reconciliation view (all amounts in LBP)
create or replace view reconciliation_summary as
select
  wb.id as batch_id,
  wb.school_id,
  s.name as school_name,
  wb.week_start,
  wb.week_end,
  wb.status,
  coalesce((
    select sum(di2.delivered_qty * p2.selling_price_lbp)
    from delivery_items di2
    join products p2 on p2.id = di2.product_id
    where di2.batch_id = wb.id
  ), 0) as total_value_delivered_lbp,
  coalesce((
    select sum(
      (di2.delivered_qty
        - coalesce(cc.remaining_qty, 0)
        - coalesce(we_sum.waste_qty, 0)
      ) * p2.selling_price_lbp
    )
    from delivery_items di2
    join products p2 on p2.id = di2.product_id
    left join closing_counts cc on cc.batch_id = di2.batch_id and cc.product_id = di2.product_id
    left join (
      select batch_id, product_id, sum(waste_qty) as waste_qty
      from waste_entries group by batch_id, product_id
    ) we_sum on we_sum.batch_id = di2.batch_id and we_sum.product_id = di2.product_id
    where di2.batch_id = wb.id
  ), 0) as expected_cash_lbp,
  coalesce((
    select sum(amount_collected_lbp) from cash_collections where batch_id = wb.id
  ), 0) as actual_cash_lbp,
  coalesce((
    select sum(
      (di2.delivered_qty
        - coalesce(cc.remaining_qty, 0)
        - coalesce(we_sum.waste_qty, 0)
      ) * p2.selling_price_lbp
    )
    from delivery_items di2
    join products p2 on p2.id = di2.product_id
    left join closing_counts cc on cc.batch_id = di2.batch_id and cc.product_id = di2.product_id
    left join (
      select batch_id, product_id, sum(waste_qty) as waste_qty
      from waste_entries group by batch_id, product_id
    ) we_sum on we_sum.batch_id = di2.batch_id and we_sum.product_id = di2.product_id
    where di2.batch_id = wb.id
  ), 0) - coalesce((
    select sum(amount_collected_lbp) from cash_collections where batch_id = wb.id
  ), 0) as variance_lbp
from weekly_batches wb
join schools s on s.id = wb.school_id;

-- =====================
-- SEED DATA
-- =====================

insert into schools (name, location, contact_name) values
  ('School 1 - Tripoli', 'Tripoli', 'Manager 1'),
  ('School 2 - Mina', 'Mina', 'Manager 2'),
  ('School 3 - Koura', 'Koura', 'Manager 3'),
  ('School 4 - Zgharta', 'Zgharta', 'Manager 4'),
  ('School 5 - Batroun', 'Batroun', 'Manager 5');

insert into products (name, category, qty_per_box, cost_price_usd, selling_price_lbp) values
  ('مكاو زجاج كوكتيل', 'Snacks', 24, 0.49, 80000),
  ('مكاو كرتون', 'Snacks', 24, 0.25, 45000),
  ('عالية مياه', 'Drinks', 12, 0.15, 30000),
  ('تنك سفن اب 185 مل', 'Drinks', 30, 0.43, 75000),
  ('زي كولا 330مل', 'Drinks', 24, 0.34, 85000),
  ('مستر جوسي كرتون', 'Drinks', 30, 0.13, 25000),
  ('ايي كراكس سنتيكس بهارات', 'Snacks', 21, 0.30, 50000),
  ('ايلبغانس بانواعه', 'Snacks', 24, 0.12, 25000),
  ('شوكو برنس', 'Chocolate', 40, 0.33, 70000),
  ('سنيكرز', 'Chocolate', 24, 0.54, 100000),
  ('مارس', 'Chocolate', 24, 0.54, 100000),
  ('نسكافيه 3 ان 1', 'Drinks', 30, 0.16, 40000),
  ('نسكويك وايفر اصفر', 'Snacks', 30, 0.18, 40000),
  ('ايي كومبو', 'Snacks', 24, 0.46, 75000),
  ('ميلكا ليو 4 اصابع', 'Chocolate', 32, 0.55, 100000),
  ('ايي كونغ رايس كيك', 'Snacks', 24, 0.30, 50000),
  ('ايي اديكتو براوني', 'Snacks', 24, 0.30, 50000),
  ('ايي ويف اب', 'Snacks', 24, 0.30, 50000),
  ('تويكس', 'Chocolate', 25, 0.44, 100000),
  ('كيت كات شلنكي', 'Chocolate', 12, 0.33, 60000),
  ('شولان بابيتا كراميل', 'Snacks', 24, 0.14, 30000),
  ('ريماكس كيك كبير موزايك', 'Snacks', 24, 0.19, 40000),
  ('كرانش نسلة شوكولا', 'Chocolate', 20, 0.52, 85000),
  ('اونيكا 18 غ', 'Snacks', 24, 0.11, 25000),
  ('اونيكا ماكس 45 غ', 'Snacks', 12, 0.24, 45000),
  ('بوني', 'Snacks', 32, 0.48, 90000),
  ('بيك رول بيتزا', 'Snacks', 24, 0.25, 50000),
  ('اولكر مالح', 'Snacks', 12, 0.25, 40000),
  ('ستارز ايلبغانس', 'Snacks', 24, 0.12, 25000),
  ('اوريو حليب', 'Snacks', 24, 0.28, 40000),
  ('اوريو ميني كاب بسكويت اوريجينال', 'Snacks', 1, 0.85, 150000),
  ('هولز نعناع ازرق 24 غ', 'Snacks', 24, 0.23, 50000),
  ('كيت كات بشوكولا الحليب 36 غ', 'Chocolate', 24, 0.44, 100000),
  ('برينغلز احمر 40 غ', 'Snacks', 12, 0.71, 130000),
  ('غندور كوكيز مع رفائق شوكولا 40غ', 'Snacks', 12, 0.42, 80000),
  ('مانتوس احمر واخضر', 'Snacks', 12, 0.38, 100000),
  ('كلورنس', 'Snacks', 12, 0.27, 40000),
  ('ميلكا شوكو كاوو', 'Chocolate', 24, 0.48, 100000),
  ('اولكر الباني', 'Snacks', 24, 0.22, 50000),
  ('كيندر بيونو شوكولا', 'Chocolate', 15, 0.83, 150000),
  ('كادبوري ديري مبلك اوريو', 'Chocolate', 12, 0.42, 80000),
  ('شاي ليبتون', 'Drinks', 36, 0.07, 50000),
  ('بيسوكلانا ستارز', 'Snacks', 24, 0.33, 80000),
  ('تنك ميرندا 185 ملم', 'Drinks', 30, 0.85, 150000),
  ('اونو اب', 'Drinks', 24, 0.12, 40000),
  ('زي كولا 250 ملم', 'Drinks', 24, 0.27, 80000),
  ('اكستراناناس', 'Drinks', 24, 0.28, 50000),
  ('مالتيزرز شوكولا', 'Chocolate', 25, 0.64, 120000),
  ('ميلك شيك', 'Drinks', 24, 0.39, 70000);
