-- MCOM eCommerce SaaS - Database Schema
-- Multi-tenant architecture with row-level security

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create main database if not exists (run separately)
-- CREATE DATABASE mcom_ecommerce;

-- Use the database
-- \c mcom_ecommerce;

-- Create schemas
CREATE SCHEMA IF NOT EXISTS public;
CREATE SCHEMA IF NOT EXISTS tenant_management;
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS catalog;
CREATE SCHEMA IF NOT EXISTS orders;
CREATE SCHEMA IF NOT EXISTS payments;
CREATE SCHEMA IF NOT EXISTS media;
CREATE SCHEMA IF NOT EXISTS themes;
CREATE SCHEMA IF NOT EXISTS notifications;
CREATE SCHEMA IF NOT EXISTS analytics;

-- =====================================================
-- TENANT MANAGEMENT SCHEMA
-- =====================================================

-- Tenants table (main tenant registry)
CREATE TABLE IF NOT EXISTS tenant_management.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subdomain VARCHAR(63) UNIQUE NOT NULL,
    custom_domain VARCHAR(253),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'terminated')),
    plan VARCHAR(50) DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise')),
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Tenant subscriptions
CREATE TABLE IF NOT EXISTS tenant_management.tenant_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant_management.tenants(id) ON DELETE CASCADE,
    plan VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ends_at TIMESTAMP WITH TIME ZONE,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    billing_cycle VARCHAR(20) DEFAULT 'monthly',
    price_per_cycle DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- AUTH SCHEMA
-- =====================================================

-- Roles table
CREATE TABLE IF NOT EXISTS auth.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    permissions JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Permissions table
CREATE TABLE IF NOT EXISTS auth.permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenant_management.tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url VARCHAR(500),
    phone VARCHAR(20),
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    last_login_at TIMESTAMP WITH TIME ZONE,
    password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- User roles
CREATE TABLE IF NOT EXISTS auth.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES auth.roles(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenant_management.tenants(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, role_id, tenant_id)
);

-- User sessions
CREATE TABLE IF NOT EXISTS auth.user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenant_management.tenants(id) ON DELETE CASCADE,
    token_id VARCHAR(255) UNIQUE NOT NULL,
    device_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CATALOG SCHEMA
-- =====================================================

-- Categories table
CREATE TABLE IF NOT EXISTS catalog.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant_management.tenants(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES catalog.categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    seo_title VARCHAR(255),
    seo_description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(tenant_id, slug)
);

-- Products table
CREATE TABLE IF NOT EXISTS catalog.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant_management.tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    short_description TEXT,
    sku VARCHAR(100),
    type VARCHAR(50) DEFAULT 'simple' CHECK (type IN ('simple', 'variable', 'grouped', 'digital')),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive', 'archived')),
    visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'password')),
    featured BOOLEAN DEFAULT false,
    
    -- Pricing
    price DECIMAL(10,2),
    compare_at_price DECIMAL(10,2),
    cost_per_item DECIMAL(10,2),
    
    -- Inventory
    track_inventory BOOLEAN DEFAULT true,
    continue_selling_when_out_of_stock BOOLEAN DEFAULT false,
    
    -- Physical properties
    weight DECIMAL(8,2),
    weight_unit VARCHAR(10) DEFAULT 'kg',
    requires_shipping BOOLEAN DEFAULT true,
    
    -- SEO
    seo_title VARCHAR(255),
    seo_description TEXT,
    
    -- Timestamps
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    metadata JSONB DEFAULT '{}',
    UNIQUE(tenant_id, slug)
);

-- Product variants
CREATE TABLE IF NOT EXISTS catalog.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant_management.tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES catalog.products(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    
    -- Pricing
    price DECIMAL(10,2),
    compare_at_price DECIMAL(10,2),
    cost_per_item DECIMAL(10,2),
    
    -- Inventory
    inventory_quantity INTEGER DEFAULT 0,
    inventory_policy VARCHAR(20) DEFAULT 'deny' CHECK (inventory_policy IN ('deny', 'continue')),
    
    -- Physical properties
    weight DECIMAL(8,2),
    weight_unit VARCHAR(10) DEFAULT 'kg',
    
    -- Variant options (e.g., size, color)
    option1_name VARCHAR(100),
    option1_value VARCHAR(100),
    option2_name VARCHAR(100),
    option2_value VARCHAR(100),
    option3_name VARCHAR(100),
    option3_value VARCHAR(100),
    
    position INTEGER DEFAULT 0,
    image_url VARCHAR(500),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    metadata JSONB DEFAULT '{}'
);

-- Product categories relationship
CREATE TABLE IF NOT EXISTS catalog.product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant_management.tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES catalog.products(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES catalog.categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, category_id)
);

-- Product images
CREATE TABLE IF NOT EXISTS catalog.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant_management.tenants(id) ON DELETE CASCADE,
    product_id UUID REFERENCES catalog.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES catalog.product_variants(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK ((product_id IS NOT NULL AND variant_id IS NULL) OR (product_id IS NULL AND variant_id IS NOT NULL))
);

-- =====================================================
-- ORDERS SCHEMA
-- =====================================================

-- Customers table
CREATE TABLE IF NOT EXISTS orders.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant_management.tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    accepts_marketing BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    total_spent DECIMAL(10,2) DEFAULT 0,
    orders_count INTEGER DEFAULT 0,
    last_order_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    UNIQUE(tenant_id, email)
);

-- Customer addresses
CREATE TABLE IF NOT EXISTS orders.customer_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant_management.tenants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES orders.customers(id) ON DELETE CASCADE,
    type VARCHAR(20) DEFAULT 'shipping' CHECK (type IN ('shipping', 'billing')),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(100),
    address1 VARCHAR(255) NOT NULL,
    address2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    zip VARCHAR(20),
    phone VARCHAR(20),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant_management.tenants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES orders.customers(id) ON DELETE SET NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Customer info (stored for historical purposes)
    customer_email VARCHAR(255),
    customer_first_name VARCHAR(100),
    customer_last_name VARCHAR(100),
    customer_phone VARCHAR(20),
    
    -- Pricing
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_discounts DECIMAL(10,2) DEFAULT 0,
    total_tax DECIMAL(10,2) DEFAULT 0,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partially_paid', 'refunded', 'partially_refunded')),
    fulfillment_status VARCHAR(20) DEFAULT 'unfulfilled' CHECK (fulfillment_status IN ('unfulfilled', 'partial', 'fulfilled', 'shipped', 'delivered')),
    
    -- Addresses (stored as JSONB for historical purposes)
    shipping_address JSONB,
    billing_address JSONB,
    
    -- Dates
    processed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Additional info
    notes TEXT,
    tags VARCHAR(255)[],
    metadata JSONB DEFAULT '{}'
);

-- Order line items
CREATE TABLE IF NOT EXISTS orders.order_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant_management.tenants(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES catalog.products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES catalog.product_variants(id) ON DELETE SET NULL,
    
    -- Product info (stored for historical purposes)
    product_name VARCHAR(255) NOT NULL,
    variant_name VARCHAR(255),
    sku VARCHAR(100),
    
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    total_discount DECIMAL(10,2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- =====================================================
-- PAYMENTS SCHEMA
-- =====================================================

-- Payment methods
CREATE TABLE IF NOT EXISTS payments.payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant_management.tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'stripe', 'paypal', 'bank_transfer', etc.
    is_active BOOLEAN DEFAULT true,
    configuration JSONB DEFAULT '{}',
    supported_currencies VARCHAR(3)[] DEFAULT ARRAY['USD'],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment transactions
CREATE TABLE IF NOT EXISTS payments.payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant_management.tenants(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders.orders(id) ON DELETE SET NULL,
    payment_method_id UUID REFERENCES payments.payment_methods(id) ON DELETE SET NULL,
    
    external_id VARCHAR(255), -- ID from payment provider
    type VARCHAR(20) NOT NULL CHECK (type IN ('payment', 'refund', 'partial_refund')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    gateway_response JSONB DEFAULT '{}',
    failure_reason TEXT,
    
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    metadata JSONB DEFAULT '{}'
);

-- =====================================================
-- MEDIA SCHEMA
-- =====================================================

-- Media files
CREATE TABLE IF NOT EXISTS media.media_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant_management.tenants(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    width INTEGER,
    height INTEGER,
    url VARCHAR(500) NOT NULL,
    cdn_url VARCHAR(500),
    alt_text VARCHAR(255),
    description TEXT,
    tags VARCHAR(100)[],
    folder VARCHAR(255),
    is_public BOOLEAN DEFAULT true,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'
);

-- =====================================================
-- THEMES SCHEMA
-- =====================================================

-- Themes
CREATE TABLE IF NOT EXISTS themes.themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant_management.tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    version VARCHAR(20) DEFAULT '1.0.0',
    description TEXT,
    author VARCHAR(100),
    is_active BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    preview_image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Theme settings
CREATE TABLE IF NOT EXISTS themes.theme_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant_management.tenants(id) ON DELETE CASCADE,
    theme_id UUID NOT NULL REFERENCES themes.themes(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    value JSONB,
    type VARCHAR(20) DEFAULT 'string' CHECK (type IN ('string', 'number', 'boolean', 'color', 'image', 'select', 'textarea')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(theme_id, key)
);

-- =====================================================
-- NOTIFICATIONS SCHEMA
-- =====================================================

-- Notification templates
CREATE TABLE IF NOT EXISTS notifications.notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant_management.tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'email', 'sms', 'push', 'webhook'
    event_type VARCHAR(100) NOT NULL, -- 'order_created', 'payment_completed', etc.
    subject VARCHAR(255),
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Notification queue
CREATE TABLE IF NOT EXISTS notifications.notification_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant_management.tenants(id) ON DELETE CASCADE,
    template_id UUID REFERENCES notifications.notification_templates(id) ON DELETE SET NULL,
    recipient VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- =====================================================
-- ANALYTICS SCHEMA
-- =====================================================

-- Events table for tracking
CREATE TABLE IF NOT EXISTS analytics.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant_management.tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES orders.customers(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    event_type VARCHAR(100) NOT NULL,
    event_name VARCHAR(100) NOT NULL,
    properties JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    referrer VARCHAR(500),
    page_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily metrics aggregation
CREATE TABLE IF NOT EXISTS analytics.daily_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant_management.tenants(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    metric_type VARCHAR(50) NOT NULL, -- 'revenue', 'orders', 'visitors', 'conversions'
    value DECIMAL(15,2) NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, date, metric_type)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Tenant indexes
CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON tenant_management.tenants(subdomain);
CREATE INDEX IF NOT EXISTS idx_tenants_custom_domain ON tenant_management.tenants(custom_domain);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenant_management.tenants(status);

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON auth.users(email);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON auth.users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON auth.users(status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_id ON auth.user_sessions(token_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON auth.user_sessions(user_id);

-- Product indexes
CREATE INDEX IF NOT EXISTS idx_products_tenant_id ON catalog.products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON catalog.products(tenant_id, slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON catalog.products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON catalog.products(featured);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON catalog.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON catalog.product_variants(tenant_id, sku);

-- Order indexes
CREATE INDEX IF NOT EXISTS idx_orders_tenant_id ON orders.orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_line_items_order_id ON orders.order_line_items(order_id);

-- Customer indexes
CREATE INDEX IF NOT EXISTS idx_customers_tenant_id ON orders.customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON orders.customers(tenant_id, email);

-- Payment indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payments.payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payments.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_external_id ON payments.payment_transactions(external_id);

-- Media indexes
CREATE INDEX IF NOT EXISTS idx_media_files_tenant_id ON media.media_files(tenant_id);
CREATE INDEX IF NOT EXISTS idx_media_files_filename ON media.media_files(filename);
CREATE INDEX IF NOT EXISTS idx_media_files_mime_type ON media.media_files(mime_type);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_events_tenant_id ON analytics.events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON analytics.events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON analytics.events(created_at);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_tenant_date ON analytics.daily_metrics(tenant_id, date);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables that have updated_at column
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenant_management.tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tenant_subscriptions_updated_at BEFORE UPDATE ON tenant_management.tenant_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON catalog.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON catalog.product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON catalog.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON orders.customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_addresses_updated_at BEFORE UPDATE ON orders.customer_addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payments.payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payments.payment_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_media_files_updated_at BEFORE UPDATE ON media.media_files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_themes_updated_at BEFORE UPDATE ON themes.themes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_theme_settings_updated_at BEFORE UPDATE ON themes.theme_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON notifications.notification_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_queue_updated_at BEFORE UPDATE ON notifications.notification_queue FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('order_number_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Create trigger for order number generation
CREATE TRIGGER generate_order_number_trigger 
    BEFORE INSERT ON orders.orders 
    FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all multi-tenant tables
ALTER TABLE tenant_management.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_management.tenant_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders.order_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE media.media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes.theme_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications.notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics.daily_metrics ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert default roles
INSERT INTO auth.roles (id, name, description, is_system, permissions) VALUES
    (uuid_generate_v4(), 'super_admin', 'Super Administrator with full system access', true, '["*"]'),
    (uuid_generate_v4(), 'admin', 'Store Administrator', false, '["store:*"]'),
    (uuid_generate_v4(), 'manager', 'Store Manager', false, '["products:*", "orders:read", "orders:update", "customers:*"]'),
    (uuid_generate_v4(), 'staff', 'Store Staff', false, '["products:read", "orders:read", "customers:read"]'),
    (uuid_generate_v4(), 'customer', 'Customer', false, '["profile:*", "orders:read"]')
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO auth.permissions (name, description, resource, action) VALUES
    ('products:create', 'Create products', 'products', 'create'),
    ('products:read', 'Read products', 'products', 'read'),
    ('products:update', 'Update products', 'products', 'update'),
    ('products:delete', 'Delete products', 'products', 'delete'),
    ('orders:create', 'Create orders', 'orders', 'create'),
    ('orders:read', 'Read orders', 'orders', 'read'),
    ('orders:update', 'Update orders', 'orders', 'update'),
    ('orders:delete', 'Delete orders', 'orders', 'delete'),
    ('customers:create', 'Create customers', 'customers', 'create'),
    ('customers:read', 'Read customers', 'customers', 'read'),
    ('customers:update', 'Update customers', 'customers', 'update'),
    ('customers:delete', 'Delete customers', 'customers', 'delete'),
    ('store:manage', 'Manage store settings', 'store', 'manage'),
    ('analytics:read', 'Read analytics', 'analytics', 'read'),
    ('themes:manage', 'Manage themes', 'themes', 'manage')
ON CONFLICT (name) DO NOTHING;

COMMIT;