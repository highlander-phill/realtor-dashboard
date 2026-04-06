-- TeamGoals SaaS Schema

-- Main tenant (property group) table
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#000000',
  theme TEXT DEFAULT 'realtor',
  dark_mode INTEGER DEFAULT 0,
  onboarding_completed INTEGER DEFAULT 0,
  admin_password_hash TEXT,
  viewer_password_hash TEXT,
  show_time_to_close INTEGER DEFAULT 1,
  track_days_to_close INTEGER DEFAULT 0,
  show_price_delta INTEGER DEFAULT 1,
  stripe_customer_id TEXT,
  billing_status TEXT DEFAULT 'free',
  stripe_subscription_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Optional Sub-Teams
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

-- Team data
CREATE TABLE IF NOT EXISTS team_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  sub_team_id TEXT,
  year INTEGER NOT NULL,
  goal REAL NOT NULL DEFAULT 0,
  ytd_production REAL NOT NULL DEFAULT 0,
  last_updated TEXT NOT NULL,
  UNIQUE(tenant_id, sub_team_id, year),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (sub_team_id) REFERENCES sub_teams(id)
);

-- Agents
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  sub_team_id TEXT,
  name TEXT NOT NULL,
  email TEXT,
  goal REAL NOT NULL DEFAULT 0,
  closings INTEGER NOT NULL DEFAULT 0,
  volume_closed REAL NOT NULL DEFAULT 0,
  volume_pending REAL NOT NULL DEFAULT 0,
  listings_volume REAL NOT NULL DEFAULT 0,
  buyers INTEGER NOT NULL DEFAULT 0,
  sellers INTEGER NOT NULL DEFAULT 0,
  listings INTEGER NOT NULL DEFAULT 0,
  mls_link TEXT,
  status TEXT DEFAULT 'active',
  count_in_total INTEGER DEFAULT 1,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (sub_team_id) REFERENCES sub_teams(id)
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  address TEXT NOT NULL,
  price REAL NOT NULL, -- Final Sale Price
  list_price REAL, -- Initial List Price
  date_listed TEXT, -- Start of tracking
  status TEXT CHECK (status IN ('Active', 'Pending', 'Sold')) NOT NULL,
  side TEXT CHECK (side IN ('Buyer', 'Seller')) NOT NULL,
  date TEXT NOT NULL, -- Closing date or Last activity
  year INTEGER NOT NULL,
  FOREIGN KEY (agent_id) REFERENCES agents(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Seed Initial Tenant (NSPG)
INSERT OR IGNORE INTO tenants (id, name, subdomain, logo_url, primary_color, onboarding_completed, admin_password_hash, viewer_password_hash, show_time_to_close, show_price_delta)
VALUES ('nspg-group', 'Nik Shehu Property Group', 'nspg', NULL, '#000000', 1, 'nspg2026', 'viewtg', 1, 1);

-- Seed Team Data for NSPG 2026
INSERT OR IGNORE INTO team_data (tenant_id, sub_team_id, year, goal, ytd_production, last_updated)
VALUES ('nspg-group', NULL, 2026, 50000000, 22450000, CURRENT_TIMESTAMP);

-- Seed Agents for NSPG (Including 3 more as requested)
INSERT OR IGNORE INTO agents (id, tenant_id, name, email, goal, closings, volume_closed, volume_pending, listings_volume, buyers, sellers, listings, mls_link, status, count_in_total)
VALUES 
  ('1', 'nspg-group', 'Nik Shehu', 'nik@realestatebastrop.com', 10000000, 15, 8500000, 2500000, 1500000, 8, 7, 4, 'https://nspgrealty.com/listings', 'active', 1),
  ('2', 'nspg-group', 'Sarah Jenkins', 'sarah@example.com', 8000000, 10, 4200000, 1200000, 600000, 4, 6, 2, 'https://nspgrealty.com/listings', 'active', 1),
  ('3', 'nspg-group', 'Mike Ross', 'mike@example.com', 6000000, 8, 2100000, 800000, 400000, 3, 5, 3, 'https://nspgrealty.com/listings', 'active', 1),
  ('4', 'nspg-group', 'Jessica Pearson', 'jessica@example.com', 12000000, 12, 5400000, 1500000, 2200000, 7, 5, 5, 'https://nspgrealty.com/listings', 'active', 1),
  ('5', 'nspg-group', 'Harvey Specter', 'harvey@example.com', 15000000, 18, 9200000, 3500000, 4500000, 10, 8, 8, 'https://nspgrealty.com/listings', 'active', 1),
  ('6', 'nspg-group', 'Louis Litt', 'louis@example.com', 7000000, 6, 1850000, 450000, 850000, 2, 4, 4, 'https://nspgrealty.com/listings', 'active', 1);

-- Seed Sample Transactions
INSERT OR IGNORE INTO transactions (id, agent_id, tenant_id, address, price, list_price, date_listed, status, side, date, year)
VALUES
  ('t1', '1', 'nspg-group', '123 Maple St', 450000, 440000, '2026-02-01', 'Sold', 'Seller', '2026-03-15', 2026),
  ('t2', '1', 'nspg-group', '456 Oak Ave', 620000, 625000, '2026-03-10', 'Pending', 'Buyer', '2026-04-01', 2026),
  ('t3', '1', 'nspg-group', '789 Pine Ln', 325000, 325000, '2026-03-25', 'Active', 'Seller', '2026-04-03', 2026),
  ('t4', '5', 'nspg-group', '999 High Street', 1250000, 1200000, '2026-01-15', 'Sold', 'Seller', '2026-02-28', 2026),
  ('t5', '5', 'nspg-group', '555 Gold Coast', 850000, 875000, '2026-02-20', 'Pending', 'Buyer', '2026-03-30', 2026),
  ('t6', '4', 'nspg-group', '111 Wall St', 2200000, 2150000, '2026-01-01', 'Sold', 'Seller', '2026-03-10', 2026);
