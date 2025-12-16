-- =====================================================
-- Multi-Tenant Financial Dashboard Platform
-- Database Schema Migration
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TENANTS TABLE (ארגונים/לקוחות)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,                              -- שם הלקוח
  slug TEXT UNIQUE NOT NULL,                       -- URL slug (e.g., 'litay')
  logo_url TEXT,                                   -- לוגו

  -- צבעים
  primary_color TEXT DEFAULT '#528163',
  secondary_color TEXT DEFAULT '#8dd1bb',
  dark_color TEXT DEFAULT '#2d5f3f',
  accent_color TEXT DEFAULT '#17320b',

  -- פרטי קשר
  email TEXT,
  phone TEXT,
  address TEXT,

  -- הגדרות
  settings JSONB DEFAULT '{
    "locale": "he-IL",
    "currency": "ILS",
    "fiscalYearStart": 1,
    "showCancelledTransactions": false,
    "defaultReportView": "monthly"
  }'::jsonb,

  -- מנוי
  subscription_tier TEXT DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'standard', 'premium', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'suspended', 'cancelled', 'trial')),
  trial_ends_at TIMESTAMPTZ,

  -- מטא
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for slug lookup
CREATE INDEX idx_tenants_slug ON public.tenants(slug);

-- =====================================================
-- 2. USER PROFILES TABLE (פרופילי משתמשים)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,

  -- תפקיד והרשאות
  role TEXT DEFAULT 'viewer' CHECK (role IN ('platform_admin', 'tenant_admin', 'editor', 'viewer')),
  permissions JSONB DEFAULT '{}'::jsonb,

  -- מטא
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_profiles_tenant ON public.user_profiles(tenant_id);
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);

-- =====================================================
-- 3. TRANSACTIONS TABLE (תנועות)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  -- פרטי תנועה
  koteret INTEGER,                                 -- מספר מסמך
  sort_code INTEGER,                               -- קוד מיון
  sort_code_name TEXT,                             -- שם קוד מיון
  account_key INTEGER,                             -- מפתח חשבון
  account_name TEXT,                               -- שם חשבון
  amount DECIMAL(15,2),                            -- סכום
  details TEXT,                                    -- פרטים
  transaction_date DATE,                           -- תאריך תנועה
  counter_account_name TEXT,                       -- שם חשבון נגדי
  counter_account_number INTEGER,                  -- מספר חשבון נגדי

  -- שדות מחושבים (לשיפור ביצועים)
  month INTEGER GENERATED ALWAYS AS (EXTRACT(MONTH FROM transaction_date)) STORED,
  year INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM transaction_date)) STORED,

  -- מטא
  import_batch_id UUID,                            -- קישור להעלאה
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_transactions_tenant ON public.transactions(tenant_id);
CREATE INDEX idx_transactions_date ON public.transactions(tenant_id, year, month);
CREATE INDEX idx_transactions_sort_code ON public.transactions(tenant_id, sort_code);
CREATE INDEX idx_transactions_account ON public.transactions(tenant_id, account_key);

-- =====================================================
-- 4. BALANCES TABLE (יתרות)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  account_key INTEGER,
  account_name TEXT,
  month INTEGER,
  year INTEGER,
  opening_balance DECIMAL(15,2) DEFAULT 0,
  closing_balance DECIMAL(15,2) DEFAULT 0,

  import_batch_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(tenant_id, account_key, year, month)
);

CREATE INDEX idx_balances_tenant ON public.balances(tenant_id);
CREATE INDEX idx_balances_period ON public.balances(tenant_id, year, month);

-- =====================================================
-- 5. CATEGORIES TABLE (קטגוריות)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  code INTEGER NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('income', 'cogs', 'operating', 'financial', 'other')),
  parent_code INTEGER,
  sort_order INTEGER DEFAULT 0,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(tenant_id, code)
);

CREATE INDEX idx_categories_tenant ON public.categories(tenant_id);

-- =====================================================
-- 6. ACCOUNT MAPPINGS TABLE (מיפוי חשבונות)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.account_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  account_key INTEGER NOT NULL,
  account_name TEXT NOT NULL,
  category_code INTEGER,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(tenant_id, account_key)
);

CREATE INDEX idx_account_mappings_tenant ON public.account_mappings(tenant_id);

-- =====================================================
-- 7. VENDOR MAPPINGS TABLE (מיפוי ספקים)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.vendor_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  vendor_key INTEGER NOT NULL,
  vendor_name TEXT NOT NULL,
  category TEXT,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(tenant_id, vendor_key)
);

CREATE INDEX idx_vendor_mappings_tenant ON public.vendor_mappings(tenant_id);

-- =====================================================
-- 8. INVENTORY ADJUSTMENTS TABLE (מלאי והתאמות)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.inventory_adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('opening_inventory', 'closing_inventory', 'adjustment')),
  category_code INTEGER,
  month INTEGER,
  year INTEGER,
  amount DECIMAL(15,2),
  notes TEXT,

  created_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventory_adjustments_tenant ON public.inventory_adjustments(tenant_id);
CREATE INDEX idx_inventory_adjustments_period ON public.inventory_adjustments(tenant_id, year, month);

-- =====================================================
-- 9. BIURIM TABLE (ביאורים)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.biurim (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  category_code INTEGER,
  account_key INTEGER,
  month INTEGER,
  year INTEGER,
  note_text TEXT NOT NULL,
  note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'variance', 'audit', 'correction')),

  created_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_biurim_tenant ON public.biurim(tenant_id);
CREATE INDEX idx_biurim_transaction ON public.biurim(transaction_id);
CREATE INDEX idx_biurim_period ON public.biurim(tenant_id, year, month);

-- =====================================================
-- 10. UPLOAD HISTORY TABLE (היסטוריית העלאות)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.upload_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('transactions', 'balances', 'categories', 'vendors', 'accounts')),
  file_size INTEGER,
  rows_total INTEGER,
  rows_imported INTEGER,
  rows_skipped INTEGER DEFAULT 0,

  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'partial', 'failed')),
  error_log JSONB DEFAULT '[]'::jsonb,

  uploaded_by UUID REFERENCES public.user_profiles(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_upload_history_tenant ON public.upload_history(tenant_id);
CREATE INDEX idx_upload_history_status ON public.upload_history(status);

-- =====================================================
-- 11. AUDIT LOG TABLE (לוג פעולות)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,

  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_tenant ON public.audit_log(tenant_id);
CREATE INDEX idx_audit_log_user ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_action ON public.audit_log(action);
CREATE INDEX idx_audit_log_created ON public.audit_log(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biurim ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upload_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's tenant_id
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper function to check if user is platform admin
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'platform_admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- =====================================================
-- TENANTS POLICIES
-- =====================================================
CREATE POLICY "Platform admins can view all tenants"
  ON public.tenants FOR SELECT
  USING (public.is_platform_admin());

CREATE POLICY "Users can view their own tenant"
  ON public.tenants FOR SELECT
  USING (id = public.get_user_tenant_id());

CREATE POLICY "Platform admins can insert tenants"
  ON public.tenants FOR INSERT
  WITH CHECK (public.is_platform_admin());

CREATE POLICY "Platform admins can update tenants"
  ON public.tenants FOR UPDATE
  USING (public.is_platform_admin());

CREATE POLICY "Tenant admins can update their tenant"
  ON public.tenants FOR UPDATE
  USING (id = public.get_user_tenant_id() AND public.get_user_role() = 'tenant_admin');

-- =====================================================
-- USER PROFILES POLICIES
-- =====================================================
CREATE POLICY "Platform admins can view all users"
  ON public.user_profiles FOR SELECT
  USING (public.is_platform_admin());

CREATE POLICY "Users can view profiles in their tenant"
  ON public.user_profiles FOR SELECT
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Users can view their own profile"
  ON public.user_profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Platform admins can manage all users"
  ON public.user_profiles FOR ALL
  USING (public.is_platform_admin());

CREATE POLICY "Tenant admins can manage users in their tenant"
  ON public.user_profiles FOR ALL
  USING (
    tenant_id = public.get_user_tenant_id()
    AND public.get_user_role() IN ('tenant_admin', 'platform_admin')
  );

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (id = auth.uid());

-- =====================================================
-- TRANSACTIONS POLICIES
-- =====================================================
CREATE POLICY "Users can view transactions in their tenant"
  ON public.transactions FOR SELECT
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Platform admins can view all transactions"
  ON public.transactions FOR SELECT
  USING (public.is_platform_admin());

CREATE POLICY "Editors can insert transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (
    tenant_id = public.get_user_tenant_id()
    AND public.get_user_role() IN ('editor', 'tenant_admin', 'platform_admin')
  );

CREATE POLICY "Editors can update transactions"
  ON public.transactions FOR UPDATE
  USING (
    tenant_id = public.get_user_tenant_id()
    AND public.get_user_role() IN ('editor', 'tenant_admin', 'platform_admin')
  );

CREATE POLICY "Admins can delete transactions"
  ON public.transactions FOR DELETE
  USING (
    tenant_id = public.get_user_tenant_id()
    AND public.get_user_role() IN ('tenant_admin', 'platform_admin')
  );

-- =====================================================
-- BALANCES POLICIES
-- =====================================================
CREATE POLICY "Users can view balances in their tenant"
  ON public.balances FOR SELECT
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Editors can manage balances"
  ON public.balances FOR ALL
  USING (
    tenant_id = public.get_user_tenant_id()
    AND public.get_user_role() IN ('editor', 'tenant_admin', 'platform_admin')
  );

-- =====================================================
-- CATEGORIES POLICIES
-- =====================================================
CREATE POLICY "Users can view categories in their tenant"
  ON public.categories FOR SELECT
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (
    tenant_id = public.get_user_tenant_id()
    AND public.get_user_role() IN ('tenant_admin', 'platform_admin')
  );

-- =====================================================
-- ACCOUNT MAPPINGS POLICIES
-- =====================================================
CREATE POLICY "Users can view account mappings in their tenant"
  ON public.account_mappings FOR SELECT
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Editors can manage account mappings"
  ON public.account_mappings FOR ALL
  USING (
    tenant_id = public.get_user_tenant_id()
    AND public.get_user_role() IN ('editor', 'tenant_admin', 'platform_admin')
  );

-- =====================================================
-- VENDOR MAPPINGS POLICIES
-- =====================================================
CREATE POLICY "Users can view vendor mappings in their tenant"
  ON public.vendor_mappings FOR SELECT
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Editors can manage vendor mappings"
  ON public.vendor_mappings FOR ALL
  USING (
    tenant_id = public.get_user_tenant_id()
    AND public.get_user_role() IN ('editor', 'tenant_admin', 'platform_admin')
  );

-- =====================================================
-- INVENTORY ADJUSTMENTS POLICIES
-- =====================================================
CREATE POLICY "Users can view inventory adjustments in their tenant"
  ON public.inventory_adjustments FOR SELECT
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Editors can manage inventory adjustments"
  ON public.inventory_adjustments FOR ALL
  USING (
    tenant_id = public.get_user_tenant_id()
    AND public.get_user_role() IN ('editor', 'tenant_admin', 'platform_admin')
  );

-- =====================================================
-- BIURIM POLICIES
-- =====================================================
CREATE POLICY "Users can view biurim in their tenant"
  ON public.biurim FOR SELECT
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Editors can manage biurim"
  ON public.biurim FOR ALL
  USING (
    tenant_id = public.get_user_tenant_id()
    AND public.get_user_role() IN ('editor', 'tenant_admin', 'platform_admin')
  );

-- =====================================================
-- UPLOAD HISTORY POLICIES
-- =====================================================
CREATE POLICY "Users can view upload history in their tenant"
  ON public.upload_history FOR SELECT
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Editors can insert upload history"
  ON public.upload_history FOR INSERT
  WITH CHECK (
    tenant_id = public.get_user_tenant_id()
    AND public.get_user_role() IN ('editor', 'tenant_admin', 'platform_admin')
  );

CREATE POLICY "Platform admins can view all upload history"
  ON public.upload_history FOR SELECT
  USING (public.is_platform_admin());

-- =====================================================
-- AUDIT LOG POLICIES
-- =====================================================
CREATE POLICY "Users can view audit log in their tenant"
  ON public.audit_log FOR SELECT
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Platform admins can view all audit logs"
  ON public.audit_log FOR SELECT
  USING (public.is_platform_admin());

CREATE POLICY "System can insert audit logs"
  ON public.audit_log FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_tenants
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_user_profiles
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_balances
  BEFORE UPDATE ON public.balances
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_inventory_adjustments
  BEFORE UPDATE ON public.inventory_adjustments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_biurim
  BEFORE UPDATE ON public.biurim
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- TRIGGER TO CREATE USER PROFILE ON SIGNUP
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- SEED DATA: Default Categories (template for new tenants)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.default_categories (
  id SERIAL PRIMARY KEY,
  code INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('income', 'cogs', 'operating', 'financial', 'other')),
  sort_order INTEGER DEFAULT 0
);

INSERT INTO public.default_categories (code, name, type, sort_order) VALUES
  (600, 'הכנסות', 'income', 1),
  (700, 'עלות המכר', 'cogs', 2),
  (800, 'הוצאות תפעוליות', 'operating', 3),
  (801, 'שכר והוצאות נלוות', 'operating', 4),
  (802, 'שכירות ואחזקה', 'operating', 5),
  (803, 'שיווק ופרסום', 'operating', 6),
  (804, 'הוצאות משרד', 'operating', 7),
  (805, 'ביטוחים', 'operating', 8),
  (806, 'ייעוץ מקצועי', 'operating', 9),
  (811, 'הוצאות רכב', 'operating', 10),
  (813, 'הוצאות שונות', 'operating', 11),
  (990, 'הוצאות מימון', 'financial', 12),
  (991, 'עמלות בנק', 'financial', 13)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- FUNCTION TO COPY DEFAULT CATEGORIES TO NEW TENANT
-- =====================================================
CREATE OR REPLACE FUNCTION public.copy_default_categories_to_tenant(p_tenant_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.categories (tenant_id, code, name, type, sort_order)
  SELECT p_tenant_id, code, name, type, sort_order
  FROM public.default_categories;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Monthly P&L Summary View
CREATE OR REPLACE VIEW public.v_monthly_pl_summary AS
SELECT
  t.tenant_id,
  t.year,
  t.month,
  c.type as category_type,
  SUM(t.amount) as total_amount,
  COUNT(*) as transaction_count
FROM public.transactions t
LEFT JOIN public.categories c ON t.tenant_id = c.tenant_id AND t.sort_code = c.code
GROUP BY t.tenant_id, t.year, t.month, c.type;

-- Tenant Statistics View
CREATE OR REPLACE VIEW public.v_tenant_stats AS
SELECT
  t.id as tenant_id,
  t.name as tenant_name,
  (SELECT COUNT(*) FROM public.user_profiles WHERE tenant_id = t.id AND is_active = true) as active_users,
  (SELECT COUNT(*) FROM public.transactions WHERE tenant_id = t.id) as total_transactions,
  (SELECT MAX(transaction_date) FROM public.transactions WHERE tenant_id = t.id) as last_transaction_date,
  (SELECT COUNT(*) FROM public.upload_history WHERE tenant_id = t.id AND status = 'success') as successful_uploads
FROM public.tenants t;

COMMENT ON TABLE public.tenants IS 'Organizations/clients using the platform';
COMMENT ON TABLE public.user_profiles IS 'User profiles linked to tenants';
COMMENT ON TABLE public.transactions IS 'Financial transactions per tenant';
COMMENT ON TABLE public.balances IS 'Account balances per period';
COMMENT ON TABLE public.categories IS 'Transaction categories (P&L structure)';
COMMENT ON TABLE public.biurim IS 'Notes and explanations for transactions/categories';
