-- =====================================================
-- חשבשבת Index Tables
-- טבלאות אינדקס שמתעדכנות מחשבשבת
-- =====================================================

-- =====================================================
-- 1. קודי מיון (Sort Codes) - P&L Structure
-- =====================================================
CREATE TABLE IF NOT EXISTS public.sort_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  code INTEGER NOT NULL,                    -- קוד מיון (600, 700, 800...)
  name TEXT NOT NULL,                       -- שם קוד מיון
  parent_code INTEGER,                      -- קוד מיון אב (להיררכיה)

  -- סיווג לדוחות
  report_type TEXT CHECK (report_type IN ('income', 'cogs', 'operating', 'financial', 'other')),
  sort_order INTEGER DEFAULT 0,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(tenant_id, code)
);

CREATE INDEX idx_sort_codes_tenant ON public.sort_codes(tenant_id);
CREATE INDEX idx_sort_codes_parent ON public.sort_codes(tenant_id, parent_code);

-- =====================================================
-- 2. כרטיסי חשבון (Accounts Index)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.accounts_index (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  account_key INTEGER NOT NULL,             -- מפתח חשבון
  account_name TEXT NOT NULL,               -- שם חשבון
  sort_code INTEGER,                        -- קוד מיון משויך

  -- סוג כרטיס
  account_type TEXT CHECK (account_type IN (
    'customer',      -- לקוח
    'supplier',      -- ספק
    'bank',          -- בנק
    'cash',          -- קופה
    'expense',       -- הוצאה
    'income',        -- הכנסה
    'asset',         -- נכס
    'liability',     -- התחייבות
    'equity',        -- הון
    'other'          -- אחר
  )),

  -- פרטים נוספים
  id_number TEXT,                           -- ח.פ / ת.ז
  address TEXT,
  city TEXT,
  phone TEXT,
  email TEXT,

  -- יתרה נוכחית (מתעדכן בסנכרון)
  current_balance DECIMAL(15,2) DEFAULT 0,
  balance_date DATE,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(tenant_id, account_key)
);

CREATE INDEX idx_accounts_index_tenant ON public.accounts_index(tenant_id);
CREATE INDEX idx_accounts_index_sort_code ON public.accounts_index(tenant_id, sort_code);
CREATE INDEX idx_accounts_index_type ON public.accounts_index(tenant_id, account_type);

-- =====================================================
-- 3. לקוחות (Customers) - View מורחב
-- =====================================================
CREATE OR REPLACE VIEW public.v_customers AS
SELECT * FROM public.accounts_index
WHERE account_type = 'customer' AND is_active = true;

-- =====================================================
-- 4. ספקים (Suppliers) - View מורחב
-- =====================================================
CREATE OR REPLACE VIEW public.v_suppliers AS
SELECT * FROM public.accounts_index
WHERE account_type = 'supplier' AND is_active = true;

-- =====================================================
-- 5. כרטיסי הוצאה (Expense Accounts)
-- =====================================================
CREATE OR REPLACE VIEW public.v_expense_accounts AS
SELECT * FROM public.accounts_index
WHERE account_type = 'expense' AND is_active = true;

-- =====================================================
-- 6. סוגי מסמכים (Document Types)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.document_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  code INTEGER NOT NULL,                    -- קוד סוג מסמך
  name TEXT NOT NULL,                       -- שם סוג מסמך (חשבונית, קבלה, זיכוי...)
  short_name TEXT,                          -- שם מקוצר

  -- סיווג
  doc_category TEXT CHECK (doc_category IN ('invoice', 'receipt', 'credit', 'debit', 'journal', 'other')),
  affects_balance BOOLEAN DEFAULT true,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(tenant_id, code)
);

CREATE INDEX idx_document_types_tenant ON public.document_types(tenant_id);

-- =====================================================
-- 7. מטבעות (Currencies)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.currencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  code TEXT NOT NULL,                       -- קוד מטבע (ILS, USD, EUR)
  name TEXT NOT NULL,                       -- שם מטבע
  symbol TEXT,                              -- סימן (₪, $, €)

  -- שער חליפין
  exchange_rate DECIMAL(10,4) DEFAULT 1,
  rate_date DATE,

  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(tenant_id, code)
);

CREATE INDEX idx_currencies_tenant ON public.currencies(tenant_id);

-- =====================================================
-- 8. סניפים/מחלקות (Branches/Departments)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  code INTEGER NOT NULL,
  name TEXT NOT NULL,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(tenant_id, code)
);

CREATE INDEX idx_branches_tenant ON public.branches(tenant_id);

-- =====================================================
-- 9. היסטוריית סנכרון אינדקסים
-- =====================================================
CREATE TABLE IF NOT EXISTS public.index_sync_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  index_type TEXT NOT NULL,                 -- sort_codes, accounts, document_types, etc.
  sync_source TEXT,                         -- hashavshevet_export, manual, api

  records_total INTEGER,
  records_added INTEGER,
  records_updated INTEGER,
  records_deleted INTEGER,

  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'partial', 'failed')),
  error_message TEXT,

  synced_by UUID REFERENCES public.user_profiles(id),
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_index_sync_history_tenant ON public.index_sync_history(tenant_id);
CREATE INDEX idx_index_sync_history_type ON public.index_sync_history(index_type);

-- =====================================================
-- RLS POLICIES FOR NEW TABLES
-- =====================================================

ALTER TABLE public.sort_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.index_sync_history ENABLE ROW LEVEL SECURITY;

-- Sort Codes Policies
CREATE POLICY "Users can view sort codes in their tenant"
  ON public.sort_codes FOR SELECT
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Admins can manage sort codes"
  ON public.sort_codes FOR ALL
  USING (
    tenant_id = public.get_user_tenant_id()
    AND public.get_user_role() IN ('tenant_admin', 'platform_admin', 'editor')
  );

-- Accounts Index Policies
CREATE POLICY "Users can view accounts in their tenant"
  ON public.accounts_index FOR SELECT
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Admins can manage accounts"
  ON public.accounts_index FOR ALL
  USING (
    tenant_id = public.get_user_tenant_id()
    AND public.get_user_role() IN ('tenant_admin', 'platform_admin', 'editor')
  );

-- Document Types Policies
CREATE POLICY "Users can view document types in their tenant"
  ON public.document_types FOR SELECT
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Admins can manage document types"
  ON public.document_types FOR ALL
  USING (
    tenant_id = public.get_user_tenant_id()
    AND public.get_user_role() IN ('tenant_admin', 'platform_admin')
  );

-- Currencies Policies
CREATE POLICY "Users can view currencies in their tenant"
  ON public.currencies FOR SELECT
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Admins can manage currencies"
  ON public.currencies FOR ALL
  USING (
    tenant_id = public.get_user_tenant_id()
    AND public.get_user_role() IN ('tenant_admin', 'platform_admin')
  );

-- Branches Policies
CREATE POLICY "Users can view branches in their tenant"
  ON public.branches FOR SELECT
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Admins can manage branches"
  ON public.branches FOR ALL
  USING (
    tenant_id = public.get_user_tenant_id()
    AND public.get_user_role() IN ('tenant_admin', 'platform_admin')
  );

-- Sync History Policies
CREATE POLICY "Users can view sync history in their tenant"
  ON public.index_sync_history FOR SELECT
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "System can insert sync history"
  ON public.index_sync_history FOR INSERT
  WITH CHECK (tenant_id = public.get_user_tenant_id());

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE TRIGGER set_updated_at_sort_codes
  BEFORE UPDATE ON public.sort_codes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_accounts_index
  BEFORE UPDATE ON public.accounts_index
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- DEFAULT SORT CODES (Template from Hashavshevet)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.default_sort_codes (
  id SERIAL PRIMARY KEY,
  code INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  parent_code INTEGER,
  report_type TEXT,
  sort_order INTEGER DEFAULT 0
);

INSERT INTO public.default_sort_codes (code, name, report_type, sort_order) VALUES
  -- הכנסות
  (600, 'הכנסות', 'income', 100),
  (601, 'הכנסות ממכירות', 'income', 101),
  (602, 'הכנסות משירותים', 'income', 102),
  (603, 'הכנסות אחרות', 'income', 103),

  -- עלות המכר
  (700, 'עלות המכר', 'cogs', 200),
  (701, 'קניות סחורה', 'cogs', 201),
  (702, 'קניות חומרי גלם', 'cogs', 202),
  (703, 'עלויות ייצור', 'cogs', 203),
  (704, 'קבלני משנה', 'cogs', 204),

  -- הוצאות תפעוליות
  (800, 'הוצאות הנהלה וכלליות', 'operating', 300),
  (801, 'שכר והוצאות נלוות', 'operating', 301),
  (802, 'שכירות ואחזקה', 'operating', 302),
  (803, 'שיווק ופרסום', 'operating', 303),
  (804, 'הוצאות משרד', 'operating', 304),
  (805, 'ביטוחים', 'operating', 305),
  (806, 'ייעוץ מקצועי', 'operating', 306),
  (807, 'תקשורת', 'operating', 307),
  (808, 'נסיעות ואש"ל', 'operating', 308),
  (809, 'הוצאות כלי רכב', 'operating', 309),
  (810, 'פחת', 'operating', 310),
  (811, 'הוצאות שונות', 'operating', 311),

  -- הוצאות מימון
  (990, 'הוצאות מימון', 'financial', 400),
  (991, 'עמלות בנק', 'financial', 401),
  (992, 'ריבית והצמדה', 'financial', 402),
  (993, 'הפרשי שער', 'financial', 403)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- FUNCTION TO COPY DEFAULT SORT CODES TO NEW TENANT
-- =====================================================
CREATE OR REPLACE FUNCTION public.copy_default_sort_codes_to_tenant(p_tenant_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.sort_codes (tenant_id, code, name, parent_code, report_type, sort_order)
  SELECT p_tenant_id, code, name, parent_code, report_type, sort_order
  FROM public.default_sort_codes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- USEFUL VIEWS
-- =====================================================

-- P&L Structure View
CREATE OR REPLACE VIEW public.v_pl_structure AS
SELECT
  sc.tenant_id,
  sc.code,
  sc.name,
  sc.parent_code,
  sc.report_type,
  sc.sort_order,
  COUNT(DISTINCT ai.account_key) as accounts_count
FROM public.sort_codes sc
LEFT JOIN public.accounts_index ai ON sc.tenant_id = ai.tenant_id AND sc.code = ai.sort_code
WHERE sc.is_active = true
GROUP BY sc.tenant_id, sc.code, sc.name, sc.parent_code, sc.report_type, sc.sort_order
ORDER BY sc.sort_order;

-- Account Balances Summary
CREATE OR REPLACE VIEW public.v_account_balances AS
SELECT
  ai.tenant_id,
  ai.account_key,
  ai.account_name,
  ai.account_type,
  sc.name as sort_code_name,
  sc.report_type,
  ai.current_balance,
  ai.balance_date
FROM public.accounts_index ai
LEFT JOIN public.sort_codes sc ON ai.tenant_id = sc.tenant_id AND ai.sort_code = sc.code
WHERE ai.is_active = true;

COMMENT ON TABLE public.sort_codes IS 'קודי מיון - מבנה דוח רווח והפסד';
COMMENT ON TABLE public.accounts_index IS 'אינדקס כרטיסי חשבון - לקוחות, ספקים, הוצאות';
COMMENT ON TABLE public.document_types IS 'סוגי מסמכים בחשבשבת';
COMMENT ON TABLE public.index_sync_history IS 'היסטוריית סנכרון אינדקסים מחשבשבת';
