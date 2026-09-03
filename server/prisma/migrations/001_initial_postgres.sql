-- ============================================================================
-- GO JULEX 0% PLATFORM FEE MULTI-TENANT COMMERCE SAAS PLATFORM
-- PostgreSQL Migration: 001_initial_postgres.sql
-- Supports Role-Based Separation, Super Admin & Merchant Invoicing Distribution
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. ENUM DEFINITIONS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'MERCHANT_OWNER', 'MERCHANT_STAFF', 'USER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE plan_tier AS ENUM ('SIX_MONTH', 'ONE_YEAR', 'TRIAL', 'FREE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tenant_status AS ENUM ('ACTIVE', 'TRIALING', 'SUSPENDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE template_tier AS ENUM ('FREE', 'PRO_EXCLUSIVE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_channel AS ENUM ('WEB', 'WHATSAPP', 'INSTAGRAM', 'POS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('PAID', 'PENDING', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE fulfillment_status AS ENUM ('PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TENANTS (STORES) TABLE
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    custom_domain VARCHAR(255) UNIQUE,
    category VARCHAR(100) DEFAULT 'General',
    city VARCHAR(100),
    state VARCHAR(100),
    plan_tier plan_tier DEFAULT 'SIX_MONTH',
    status tenant_status DEFAULT 'ACTIVE',
    active_theme_id VARCHAR(100) DEFAULT 'theme_aura_soft_peach',
    active_invoice_template_id VARCHAR(100) DEFAULT 'tpl_classic_a4',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON tenants (subdomain);
CREATE INDEX IF NOT EXISTS idx_tenants_custom_domain ON tenants (custom_domain);

-- 3. USERS (ROLE-BASED AUTH) TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'MERCHANT_OWNER',
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    phone VARCHAR(50),
    address JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_tenant_role ON users (tenant_id, role);

-- 4. MASTER INVOICE TEMPLATES (SUPER ADMIN REGISTRY)
CREATE TABLE IF NOT EXISTS master_invoice_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    is_published BOOLEAN DEFAULT TRUE,
    tier_access template_tier DEFAULT 'FREE',
    installed_count INT DEFAULT 0,
    default_layout_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_master_invoice_slug ON master_invoice_templates (slug);

-- 5. TENANT INVOICE CONFIGS (MERCHANT CUSTOMIZATION LAYER)
CREATE TABLE IF NOT EXISTS tenant_invoice_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID UNIQUE NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES master_invoice_templates(id) ON DELETE RESTRICT,
    store_gstin VARCHAR(50),
    store_legal_name VARCHAR(255) NOT NULL,
    store_trade_name VARCHAR(255),
    store_address TEXT NOT NULL,
    store_phone VARCHAR(50),
    store_email VARCHAR(255),
    authorized_signatory_url TEXT,
    custom_styles JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. PRODUCTS & PRODUCT VARIANTS
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    product_type VARCHAR(100),
    price NUMERIC(12, 2) NOT NULL,
    compare_at_price NUMERIC(12, 2),
    discount_percent INT DEFAULT 0,
    stock INT DEFAULT 10,
    sku VARCHAR(100) UNIQUE,
    charge_tax BOOLEAN DEFAULT TRUE,
    gst_rate_percent INT DEFAULT 3,
    description TEXT NOT NULL,
    specs_json JSONB,
    images_array JSONB NOT NULL,
    has_variants BOOLEAN DEFAULT FALSE,
    variants_json JSONB,
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_tenant ON products (tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);

-- 7. ORDERS & ORDER ITEMS
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    channel order_channel DEFAULT 'WEB',
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    subtotal_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    shipping_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL,
    payment_status payment_status DEFAULT 'PAID',
    fulfillment_status fulfillment_status DEFAULT 'PROCESSING',
    shipping_address JSONB NOT NULL,
    delivery_method VARCHAR(100) DEFAULT 'Standard Courier',
    payment_method VARCHAR(100) DEFAULT 'UPI / Razorpay',
    tracking_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_tenant ON orders (tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders (customer_email);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100),
    product_image TEXT NOT NULL,
    quantity INT NOT NULL,
    price_at_purchase NUMERIC(12, 2) NOT NULL,
    gst_percent INT DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. AUDIT LOGS (SUPER ADMIN IMPERSONATION & TELEMETRY)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    actor_id UUID NOT NULL,
    actor_email VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    details_json JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs (actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON audit_logs (tenant_id);
