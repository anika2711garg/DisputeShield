-- DisputeShield schema + RLS
create extension if not exists pgcrypto;

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key,
  organization_id uuid not null references organizations(id),
  email text not null,
  full_name text not null,
  role text not null check (role in ('admin','reviewer','analyst')),
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  external_id text not null,
  name text not null,
  email text not null,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  sku text not null,
  name text not null,
  description text,
  unit_price numeric not null,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  external_id text not null,
  customer_id uuid not null references customers(id),
  currency text not null,
  amount numeric not null,
  status text not null,
  shipping_address jsonb not null default '{}',
  billing_address jsonb not null default '{}',
  created_at timestamptz not null default now(),
  fulfilled_at timestamptz
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id),
  product_id uuid not null references products(id),
  quantity int not null,
  unit_price numeric not null
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  razorpay_payment_id text not null,
  razorpay_order_id text,
  order_id uuid references orders(id),
  amount numeric not null,
  currency text not null,
  status text not null,
  method text,
  captured boolean not null default false,
  amount_refunded numeric not null default 0,
  raw_data jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists refunds (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  payment_id uuid not null references payments(id),
  razorpay_refund_id text not null,
  amount numeric not null,
  status text not null,
  raw_data jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists shipments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  order_id uuid not null references orders(id),
  provider text,
  tracking_id text,
  status text not null,
  shipped_at timestamptz,
  delivered_at timestamptz,
  delivery_location text,
  recipient_name text,
  raw_data jsonb not null default '{}'
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  order_id uuid not null references orders(id),
  invoice_number text not null,
  storage_path text,
  billing_address jsonb not null default '{}',
  shipping_address jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists customer_messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  customer_id uuid not null references customers(id),
  order_id uuid references orders(id),
  channel text not null,
  sender_type text not null check (sender_type in ('customer','merchant','system')),
  body text not null,
  sent_at timestamptz not null,
  metadata jsonb not null default '{}'
);

create table if not exists disputes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  razorpay_dispute_id text not null,
  payment_id uuid references payments(id),
  amount numeric not null,
  currency text not null,
  reason_code text not null,
  reason_description text,
  phase text not null,
  status text not null,
  respond_by timestamptz,
  raw_data jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (razorpay_dispute_id)
);

create table if not exists evidence_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  dispute_id uuid not null references disputes(id),
  order_id uuid references orders(id),
  type text not null,
  title text not null,
  source text,
  storage_path text,
  content_text text,
  metadata jsonb not null default '{}',
  verified boolean not null default false,
  relevance_score numeric not null default 0,
  strength_score numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists ai_investigations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  dispute_id uuid not null references disputes(id),
  model text not null,
  prompt_version text not null,
  reason_category text,
  reason_confidence numeric,
  summary text,
  recommendation text,
  recommendation_confidence numeric,
  evidence_score numeric,
  structured_output jsonb not null default '{}',
  input_hash text,
  latency_ms int,
  created_at timestamptz not null default now()
);

create table if not exists recommendations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  dispute_id uuid not null references disputes(id),
  ai_investigation_id uuid references ai_investigations(id),
  model_recommendation text not null,
  rules_recommendation text not null,
  final_recommendation text not null,
  confidence numeric,
  score numeric,
  override_reasons jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table if not exists approvals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  dispute_id uuid not null references disputes(id),
  user_id uuid references profiles(id),
  action text not null,
  status text not null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists razorpay_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  evidence_item_id uuid references evidence_items(id),
  razorpay_document_id text not null,
  purpose text not null,
  mime_type text,
  created_at timestamptz not null default now()
);

create table if not exists webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  external_event_key text not null unique,
  event_type text not null,
  payload jsonb not null,
  signature_valid boolean not null,
  processed boolean not null default false,
  processing_error text,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  dispute_id uuid,
  actor_type text not null,
  actor_id text not null,
  action text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists evaluation_cases (
  id uuid primary key default gen_random_uuid(),
  case_key text not null,
  split text not null check (split in ('development','held_out')),
  input_data jsonb not null,
  ground_truth text not null,
  difficulty text not null,
  created_at timestamptz not null default now()
);

create table if not exists evaluation_runs (
  id uuid primary key default gen_random_uuid(),
  model text not null,
  prompt_version text not null,
  total_cases int not null,
  precision numeric,
  recall numeric,
  accuracy numeric,
  false_positives int,
  false_negatives int,
  human_escalations int,
  false_positive_cost numeric,
  results jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists evaluation_predictions (
  id uuid primary key default gen_random_uuid(),
  evaluation_case_id uuid not null references evaluation_cases(id),
  run_id uuid not null references evaluation_runs(id),
  predicted_label text not null,
  confidence numeric,
  score numeric,
  correct boolean not null,
  created_at timestamptz not null default now()
);

create index if not exists disputes_org_status_idx on disputes (organization_id, status);
create unique index if not exists payments_rpid_idx on payments (razorpay_payment_id);
create index if not exists orders_external_idx on orders (external_id);
create index if not exists customer_messages_order_idx on customer_messages (order_id, sent_at);
create index if not exists evidence_dispute_type_idx on evidence_items (dispute_id, type);
create index if not exists audit_dispute_idx on audit_logs (dispute_id, created_at);

alter table organizations enable row level security;
alter table profiles enable row level security;
alter table customers enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table payments enable row level security;
alter table refunds enable row level security;
alter table shipments enable row level security;
alter table invoices enable row level security;
alter table customer_messages enable row level security;
alter table disputes enable row level security;
alter table evidence_items enable row level security;
alter table ai_investigations enable row level security;
alter table recommendations enable row level security;
alter table approvals enable row level security;
alter table razorpay_documents enable row level security;
alter table audit_logs enable row level security;

-- Organisation is resolved from the authenticated profile, never from a client-supplied id.
create policy org_select on disputes for select using (
  organization_id = (select organization_id from profiles where id = auth.uid())
);
create policy org_select_evidence on evidence_items for select using (
  organization_id = (select organization_id from profiles where id = auth.uid())
);
create policy org_select_payments on payments for select using (
  organization_id = (select organization_id from profiles where id = auth.uid())
);
create policy org_select_orders on orders for select using (
  organization_id = (select organization_id from profiles where id = auth.uid())
);
create policy org_select_audit on audit_logs for select using (
  organization_id = (select organization_id from profiles where id = auth.uid())
);
