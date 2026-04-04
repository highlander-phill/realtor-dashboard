-- TeamGoals SaaS Schema

-- Main tenant (property group) table
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#000000',
  theme TEXT DEFAULT 'realtor',
  onboarding_completed INTEGER DEFAULT 0,
  admin_password_hash TEXT,
  viewer_password_hash TEXT,
  trial_ends_at DATETIME DEFAULT (datetime('now', '+30 days')),
  subscription_status TEXT DEFAULT 'trialing', -- 'trialing', 'active', 'past_due', 'canceled'
  stripe_customer_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Optional Sub-Teams within a tenant
CREATE TABLE IF NOT EXISTS sub_teams (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  goal REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Authorized tenants for master dashboard
CREATE TABLE IF NOT EXISTS authorized_tenants (
  id TEXT PRIMARY KEY,
  subdomain TEXT UNIQUE NOT NULL,
  temp_password TEXT NOT NULL,
  theme TEXT DEFAULT 'realtor',
  customer_name TEXT,
  customer_phone TEXT,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Updated team data with tenant_id, sub_team_id, and year support
CREATE TABLE IF NOT EXISTS team_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  sub_team_id TEXT, -- Optional
  year INTEGER NOT NULL,
  goal REAL NOT NULL DEFAULT 0,
  ytd_production REAL NOT NULL DEFAULT 0,
  last_updated TEXT NOT NULL,
  UNIQUE(tenant_id, sub_team_id, year),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (sub_team_id) REFERENCES sub_teams(id)
);

-- Updated agents with tenant_id, sub_team_id, and status
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  sub_team_id TEXT, -- Optional
  name TEXT NOT NULL,
  goal REAL NOT NULL DEFAULT 0,
  closings INTEGER NOT NULL DEFAULT 0,
  volume_closed REAL NOT NULL DEFAULT 0,
  volume_pending REAL NOT NULL DEFAULT 0,
  listings_volume REAL NOT NULL DEFAULT 0,
  buyers INTEGER NOT NULL DEFAULT 0,
  sellers INTEGER NOT NULL DEFAULT 0,
  listings INTEGER NOT NULL DEFAULT 0,
  mls_link TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'expired'
  count_in_total INTEGER DEFAULT 1, -- Whether expired agent progress counts
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (sub_team_id) REFERENCES sub_teams(id)
);

-- New transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  address TEXT NOT NULL,
  price REAL NOT NULL,
  status TEXT CHECK (status IN ('Active', 'Pending', 'Sold')) NOT NULL,
  side TEXT CHECK (side IN ('Buyer', 'Seller')) NOT NULL,
  date TEXT NOT NULL,
  year INTEGER NOT NULL, -- To help filter by year
  FOREIGN KEY (agent_id) REFERENCES agents(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Seed Initial Tenant (NSPG)
INSERT OR IGNORE INTO tenants (id, name, subdomain, logo_url, primary_color, onboarding_completed, admin_password_hash)
VALUES ('nspg-group', 'Nik Shehu Property Group', 'nspg', NULL, '#000000', 1, 'nspg2026');

-- Seed Team Data for NSPG 2026
INSERT OR IGNORE INTO team_data (tenant_id, sub_team_id, year, goal, ytd_production, last_updated)
VALUES ('nspg-group', NULL, 2026, 50000000, 18500000, CURRENT_TIMESTAMP);

-- Seed Agents for NSPG
INSERT OR IGNORE INTO agents (id, tenant_id, name, goal, closings, volume_closed, volume_pending, listings_volume, buyers, sellers, listings, mls_link, status, count_in_total)
VALUES 
  ('1', 'nspg-group', 'Nik Shehu', 10000000, 12, 8500000, 2500000, 1500000, 5, 7, 4, 'https://nspgrealty.com/listings', 'active', 1),
  ('2', 'nspg-group', 'Agent Two', 8000000, 8, 4200000, 1200000, 600000, 3, 5, 2, 'https://nspgrealty.com/listings', 'active', 1),
  ('3', 'nspg-group', 'Agent Three', 6000000, 5, 2100000, 800000, 400000, 4, 1, 3, 'https://nspgrealty.com/listings', 'active', 1);

-- Seed Sample Transactions for Nik
INSERT OR IGNORE INTO transactions (id, agent_id, tenant_id, address, price, status, side, date, year)
VALUES
  ('t1', '1', 'nspg-group', '123 Maple St', 450000, 'Sold', 'Seller', '2026-03-15', 2026),
  ('t2', '1', 'nspg-group', '456 Oak Ave', 620000, 'Pending', 'Buyer', '2026-04-01', 2026),
  ('t3', '1', 'nspg-group', '789 Pine Ln', 325000, 'Active', 'Seller', '2026-04-03', 2026);
