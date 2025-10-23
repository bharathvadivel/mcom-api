# Database Migration Commands
# Run these commands to set up the database

# 1. Create the main database (run this first)
docker-compose -f infra/docker/docker-compose.yml exec postgres psql -U postgres -c "CREATE DATABASE mcom_ecommerce;"

# 2. Run the main schema script
docker-compose -f infra/docker/docker-compose.yml exec -i postgres psql -U postgres -d mcom_ecommerce < scripts/database.sql

# 3. Create a sample tenant (optional for testing)
docker-compose -f infra/docker/docker-compose.yml exec postgres psql -U postgres -d mcom_ecommerce -c "
INSERT INTO tenant_management.tenants (subdomain, name, description, status, plan) 
VALUES ('demo', 'Demo Store', 'Demo eCommerce store for testing', 'active', 'professional');
"

# 4. Create a sample admin user (optional for testing)
# Password hash for 'admin123' - change this in production!
docker-compose -f infra/docker/docker-compose.yml exec postgres psql -U postgres -d mcom_ecommerce -c "
INSERT INTO auth.users (tenant_id, email, password_hash, first_name, last_name, status, email_verified)
SELECT t.id, 'admin@demo.com', '\$2b\$12\$LQv3c1yqBw/I7Y9XQdGhCu4PqU1T9JI1CQ1C1I9BU8F1T9JI1CQ1C1', 'Admin', 'User', 'active', true
FROM tenant_management.tenants t WHERE t.subdomain = 'demo';
"

# 5. Assign admin role to the user
docker-compose -f infra/docker/docker-compose.yml exec postgres psql -U postgres -d mcom_ecommerce -c "
INSERT INTO auth.user_roles (user_id, role_id, tenant_id)
SELECT u.id, r.id, u.tenant_id
FROM auth.users u, auth.roles r
WHERE u.email = 'admin@demo.com' AND r.name = 'admin';
"

# 6. Verify setup
docker-compose -f infra/docker/docker-compose.yml exec postgres psql -U postgres -d mcom_ecommerce -c "
SELECT 
    t.name as tenant_name,
    t.subdomain,
    u.email,
    u.first_name,
    u.last_name,
    r.name as role
FROM tenant_management.tenants t
JOIN auth.users u ON u.tenant_id = t.id
JOIN auth.user_roles ur ON ur.user_id = u.id
JOIN auth.roles r ON r.id = ur.role_id;
"