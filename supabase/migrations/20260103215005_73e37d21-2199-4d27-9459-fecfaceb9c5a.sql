-- ============================================================================
-- MIGRATION: Tables essentielles pour PNAVIM
-- ============================================================================

-- Créer l'enum pour les rôles
CREATE TYPE public.app_role AS ENUM ('admin', 'agent', 'merchant', 'cooperative');

-- Table des rôles utilisateurs (sécurité)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Fonction pour vérifier les rôles (évite récursion RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id INTEGER, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- ============================================================================
-- TABLE: merchants (profils marchands)
-- ============================================================================
CREATE TABLE public.merchants (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    merchant_number VARCHAR(50) UNIQUE,
    business_name VARCHAR(255),
    activity_type VARCHAR(100),
    market_id INTEGER,
    location_description TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    enrolled_by INTEGER,
    is_active BOOLEAN DEFAULT true,
    cnps_number VARCHAR(50),
    cnps_expiry DATE,
    cmu_number VARCHAR(50),
    cmu_expiry DATE,
    rsti_number VARCHAR(50),
    rsti_expiry DATE,
    suta_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;

-- Policies pour merchants
CREATE POLICY "Users can view own merchant profile"
    ON public.merchants FOR SELECT
    USING (user_id = (SELECT id FROM public.users WHERE open_id = auth.uid()::text));

CREATE POLICY "Users can update own merchant profile"
    ON public.merchants FOR UPDATE
    USING (user_id = (SELECT id FROM public.users WHERE open_id = auth.uid()::text));

CREATE POLICY "Agents can view all merchants"
    ON public.merchants FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.users u ON ur.user_id = u.id
        WHERE u.open_id = auth.uid()::text
        AND ur.role IN ('agent', 'admin')
    ));

CREATE POLICY "Agents can insert merchants"
    ON public.merchants FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.users u ON ur.user_id = u.id
        WHERE u.open_id = auth.uid()::text
        AND ur.role IN ('agent', 'admin')
    ));

-- ============================================================================
-- TABLE: products (catalogue produits)
-- ============================================================================
CREATE TABLE public.products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_dioula VARCHAR(255),
    category VARCHAR(100),
    unit VARCHAR(50) NOT NULL DEFAULT 'kg',
    base_price DECIMAL(10, 2),
    image_url TEXT,
    pictogram_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products sont lisibles par tous les utilisateurs authentifiés
CREATE POLICY "Authenticated users can view products"
    ON public.products FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage products"
    ON public.products FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.users u ON ur.user_id = u.id
        WHERE u.open_id = auth.uid()::text
        AND ur.role = 'admin'
    ));

-- ============================================================================
-- TABLE: merchant_stock (stock par marchand)
-- ============================================================================
CREATE TABLE public.merchant_stock (
    id SERIAL PRIMARY KEY,
    merchant_id INTEGER REFERENCES public.merchants(id) ON DELETE CASCADE NOT NULL,
    product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    quantity DECIMAL(10, 2) DEFAULT 0,
    min_threshold DECIMAL(10, 2) DEFAULT 5,
    last_restocked TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE (merchant_id, product_id)
);

ALTER TABLE public.merchant_stock ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can view own stock"
    ON public.merchant_stock FOR SELECT
    USING (merchant_id IN (
        SELECT m.id FROM public.merchants m
        JOIN public.users u ON m.user_id = u.id
        WHERE u.open_id = auth.uid()::text
    ));

CREATE POLICY "Merchants can manage own stock"
    ON public.merchant_stock FOR ALL
    USING (merchant_id IN (
        SELECT m.id FROM public.merchants m
        JOIN public.users u ON m.user_id = u.id
        WHERE u.open_id = auth.uid()::text
    ));

-- ============================================================================
-- TABLE: sales (ventes)
-- ============================================================================
CREATE TABLE public.sales (
    id SERIAL PRIMARY KEY,
    merchant_id INTEGER REFERENCES public.merchants(id) ON DELETE CASCADE NOT NULL,
    product_id INTEGER REFERENCES public.products(id) ON DELETE SET NULL,
    product_name VARCHAR(255),
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'cash',
    sale_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    is_synced BOOLEAN DEFAULT true,
    voice_input BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can view own sales"
    ON public.sales FOR SELECT
    USING (merchant_id IN (
        SELECT m.id FROM public.merchants m
        JOIN public.users u ON m.user_id = u.id
        WHERE u.open_id = auth.uid()::text
    ));

CREATE POLICY "Merchants can create sales"
    ON public.sales FOR INSERT
    WITH CHECK (merchant_id IN (
        SELECT m.id FROM public.merchants m
        JOIN public.users u ON m.user_id = u.id
        WHERE u.open_id = auth.uid()::text
    ));

-- ============================================================================
-- TABLE: savings_goals (objectifs d'épargne)
-- ============================================================================
CREATE TABLE public.savings_goals (
    id SERIAL PRIMARY KEY,
    merchant_id INTEGER REFERENCES public.merchants(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(12, 2) NOT NULL,
    current_amount DECIMAL(12, 2) DEFAULT 0,
    deadline DATE,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can manage own savings goals"
    ON public.savings_goals FOR ALL
    USING (merchant_id IN (
        SELECT m.id FROM public.merchants m
        JOIN public.users u ON m.user_id = u.id
        WHERE u.open_id = auth.uid()::text
    ));

-- ============================================================================
-- TABLE: agents (profils agents terrain)
-- ============================================================================
CREATE TABLE public.agents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    agent_code VARCHAR(50) UNIQUE,
    zone VARCHAR(255),
    total_enrollments INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view own profile"
    ON public.agents FOR SELECT
    USING (user_id = (SELECT id FROM public.users WHERE open_id = auth.uid()::text));

CREATE POLICY "Admins can manage agents"
    ON public.agents FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.users u ON ur.user_id = u.id
        WHERE u.open_id = auth.uid()::text
        AND ur.role = 'admin'
    ));

-- ============================================================================
-- Trigger pour updated_at automatique
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_merchants_updated_at
    BEFORE UPDATE ON public.merchants
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_merchant_stock_updated_at
    BEFORE UPDATE ON public.merchant_stock
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_savings_goals_updated_at
    BEFORE UPDATE ON public.savings_goals
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();