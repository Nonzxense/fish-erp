PRAGMA foreign_keys = ON;

-- =========================
-- transactions
-- =========================
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  bill_id TEXT,
  type TEXT NOT NULL CHECK (type IN ('income','expense')),
  category TEXT,
  amount REAL NOT NULL,
  occurred_at DATETIME NOT NULL,
  note TEXT,
  FOREIGN KEY (bill_id) REFERENCES bills(id)
);

-- =========================
-- parties
-- =========================
CREATE TABLE parties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT
);

-- =========================
-- containers
-- =========================
CREATE TABLE containers (
  id INTEGER PRIMARY KEY,
  color TEXT,
  type TEXT CHECK (type IN ('plastic_l','plastic_s','foam_l','foam_m','foam_s')),
  status TEXT CHECK (status IN ('at_store','with_customer','lost'))
);

-- =========================
-- bills
-- =========================
CREATE TABLE bills (
  id TEXT PRIMARY KEY,
  created_at DATETIME,
  counterparty_id TEXT,
  bill_type TEXT CHECK (bill_type IN ('fish_trade','truck')),
  status TEXT CHECK (status IN ('pending','paid')),
  detail TEXT,
  FOREIGN KEY (counterparty_id) REFERENCES parties(id)
);

-- =========================
-- bill_items
-- =========================
CREATE TABLE bill_items (
  id TEXT PRIMARY KEY,
  bill_id TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('fish','truck_shipping','misc')),
  amount REAL,
  note TEXT,
  FOREIGN KEY (bill_id) REFERENCES bills(id)
);

-- =========================
-- container_fish
-- =========================
CREATE TABLE container_fish (
  id INTEGER PRIMARY KEY,
  bill_item_id TEXT NOT NULL,
  container_id INTEGER NOT NULL,
  fish_name TEXT NOT NULL,
  weight_kg REAL NOT NULL,
  price_per_kg REAL NOT NULL,
  FOREIGN KEY (bill_item_id) REFERENCES bill_items(id),
  FOREIGN KEY (container_id) REFERENCES containers(id)
);

-- =========================
-- container_movements
-- =========================
CREATE TABLE container_movements (
  id INTEGER PRIMARY KEY,
  container_id INTEGER NOT NULL,
  bill_id TEXT,
  from_status TEXT CHECK (from_status IN ('at_store','with_customer','lost')),
  to_status TEXT CHECK (to_status IN ('at_store','with_customer','lost')),
  moved_at DATETIME NOT NULL,
  FOREIGN KEY (container_id) REFERENCES containers(id),
  FOREIGN KEY (bill_id) REFERENCES bills(id)
);

-- =========================
-- truck_deposits
-- =========================
CREATE TABLE truck_deposits (
  id TEXT PRIMARY KEY,
  bill_id TEXT NOT NULL,
  container_type TEXT CHECK (container_type IN ('plastic_l','plastic_s','foam_l','foam_m','foam_s')),
  quantity INTEGER NOT NULL,
  net_price REAL NOT NULL,
  note TEXT,
  FOREIGN KEY (bill_id) REFERENCES bills(id)
);

-- =========================
-- truck_deposit_items
-- =========================
CREATE TABLE truck_deposit_items (
  id TEXT PRIMARY KEY,
  truck_deposit_id TEXT NOT NULL,
  container_type TEXT NOT NULL CHECK (container_type IN ('plastic_l','plastic_s','foam_l','foam_m','foam_s')),
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  FOREIGN KEY (truck_deposit_id) REFERENCES truck_deposits(id)
);

-- =========================
-- truck_expenses
-- =========================
CREATE TABLE truck_expenses (
  id TEXT PRIMARY KEY,
  bill_id TEXT NOT NULL,
  party_id TEXT NOT NULL,
  expense_type TEXT NOT NULL CHECK (
    expense_type IN ('driver_wage','helper_wage','maintenance','misc')
  ),
  amount REAL NOT NULL,
  note TEXT,
  FOREIGN KEY (bill_id) REFERENCES bills(id),
  FOREIGN KEY (party_id) REFERENCES parties(id)
);