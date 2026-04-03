-- Team performance data
CREATE TABLE IF NOT EXISTS team_data (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  goal REAL NOT NULL DEFAULT 0,
  ytd_production REAL NOT NULL DEFAULT 0,
  last_updated TEXT NOT NULL
);

-- Individual agent statistics
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  goal REAL NOT NULL DEFAULT 0,
  closings INTEGER NOT NULL DEFAULT 0,
  volume_pending REAL NOT NULL DEFAULT 0,
  buyers INTEGER NOT NULL DEFAULT 0,
  sellers INTEGER NOT NULL DEFAULT 0,
  listings INTEGER NOT NULL DEFAULT 0,
  mls_link TEXT
);

-- Seed initial data
INSERT OR IGNORE INTO team_data (id, goal, ytd_production, last_updated) 
VALUES (1, 50000000, 18500000, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO agents (id, name, goal, closings, volume_pending, buyers, sellers, listings, mls_link)
VALUES 
  ('1', 'Nik Shehu', 10000000, 12, 2500000, 5, 7, 4, 'https://nspgrealty.com/listings'),
  ('2', 'Agent Two', 8000000, 8, 1200000, 3, 5, 2, 'https://nspgrealty.com/listings'),
  ('3', 'Agent Three', 6000000, 5, 800000, 4, 1, 3, 'https://nspgrealty.com/listings');
