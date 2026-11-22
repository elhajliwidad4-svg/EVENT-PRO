-- EVENT PRO — Cloudflare D1 (SQLite) Initial Schema & Seed Data
-- Timezone reference: Africa/Casablanca | Default Currency: MAD

PRAGMA foreign_keys = ON;

-- 1. Users (Authentication accounts for clients and administrators)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('client', 'admin')) DEFAULT 'client',
  full_name TEXT NOT NULL,
  phone TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  reset_token_hash TEXT,
  reset_token_expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. Admin Roles & Permissions
CREATE TABLE IF NOT EXISTS admin_roles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL DEFAULT 'super_admin',
  permissions_json TEXT NOT NULL DEFAULT '["*"]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 3. Customers (CRM profiles linked optionally to registered users)
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  city TEXT NOT NULL DEFAULT 'Casablanca',
  preferred_contact TEXT NOT NULL DEFAULT 'whatsapp' CHECK (preferred_contact IN ('whatsapp', 'phone', 'email')),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);

-- 4. Service Categories
CREATE TABLE IF NOT EXISTS service_categories (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name_fr TEXT NOT NULL,
  name_ar TEXT,
  description_fr TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 5. Services
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  name_fr TEXT NOT NULL,
  name_ar TEXT,
  short_description_fr TEXT NOT NULL,
  description_fr TEXT NOT NULL,
  benefits_json TEXT NOT NULL DEFAULT '[]',
  included_json TEXT NOT NULL DEFAULT '[]',
  options_json TEXT NOT NULL DEFAULT '[]',
  cover_image TEXT NOT NULL,
  starting_price_mad REAL,
  price_is_example INTEGER NOT NULL DEFAULT 0,
  is_available INTEGER NOT NULL DEFAULT 1,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_available ON services(is_available);

-- 6. Bookings (Event requests — never auto-confirmed)
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  reference_number TEXT NOT NULL UNIQUE,
  customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_title TEXT NOT NULL,
  event_date TEXT NOT NULL,
  preferred_time TEXT NOT NULL,
  event_location TEXT NOT NULL,
  venue_preference TEXT,
  guest_count INTEGER NOT NULL CHECK (guest_count > 0),
  duration_hours INTEGER NOT NULL DEFAULT 6,
  budget_range TEXT NOT NULL,
  custom_budget_mad REAL,
  preferred_style TEXT,
  color_theme TEXT,
  special_requirements TEXT,
  additional_notes TEXT,
  status TEXT NOT NULL DEFAULT 'Nouvelle demande' CHECK (
    status IN ('Nouvelle demande', 'En cours', 'Devis envoyé', 'En attente du client', 'Confirmé', 'Refusé', 'Annulé')
  ),
  assigned_to TEXT,
  internal_notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(reference_number);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(event_date);

-- 7. Booking Services (Selected services & options per booking)
CREATE TABLE IF NOT EXISTS booking_services (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  selected_options_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_booking_services_booking ON booking_services(booking_id);

-- 8. Quotes
CREATE TABLE IF NOT EXISTS quotes (
  id TEXT PRIMARY KEY,
  reference_number TEXT NOT NULL UNIQUE,
  booking_id TEXT REFERENCES bookings(id) ON DELETE SET NULL,
  customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_date TEXT,
  event_location TEXT NOT NULL,
  guest_count INTEGER NOT NULL DEFAULT 50,
  budget_range TEXT,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'Nouvelle demande' CHECK (
    status IN ('Nouvelle demande', 'En cours', 'Devis envoyé', 'En attente du client', 'Accepté', 'Refusé', 'Annulé')
  ),
  subtotal_mad REAL NOT NULL DEFAULT 0,
  discount_mad REAL NOT NULL DEFAULT 0,
  total_mad REAL NOT NULL DEFAULT 0,
  admin_notes TEXT,
  valid_until TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_quotes_reference ON quotes(reference_number);
CREATE INDEX IF NOT EXISTS idx_quotes_customer ON quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);

-- 9. Quote Items
CREATE TABLE IF NOT EXISTS quote_items (
  id TEXT PRIMARY KEY,
  quote_id TEXT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price_mad REAL NOT NULL DEFAULT 0 CHECK (unit_price_mad >= 0),
  line_total_mad REAL NOT NULL DEFAULT 0 CHECK (line_total_mad >= 0),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_quote_items_quote ON quote_items(quote_id);

-- 10. Contact Messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  admin_reply TEXT,
  replied_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_contact_messages_read ON contact_messages(is_read);

-- 11. Gallery Images
CREATE TABLE IF NOT EXISTS gallery_images (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  caption TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  r2_key TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_featured INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery_images(category);

-- 12. Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Casablanca',
  quote_text TEXT NOT NULL,
  is_demo INTEGER NOT NULL DEFAULT 1,
  is_approved INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 13. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  recipient_role TEXT NOT NULL CHECK (recipient_role IN ('admin', 'client')),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  link_path TEXT,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, recipient_role);

-- 14. Company Settings (Single-row configuration record id='default')
CREATE TABLE IF NOT EXISTS company_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  company_name TEXT NOT NULL DEFAULT 'EVENT PRO',
  slogan_fr TEXT NOT NULL DEFAULT 'Vos événements, notre expertise. Vos moments, notre passion.',
  phone TEXT NOT NULL DEFAULT '+212 5 22 00 00 00',
  whatsapp_number TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT 'contact@eventpro.ma',
  address TEXT NOT NULL DEFAULT 'Casablanca & Région (Anfa, Ain Diab, Bouskoura, Dar Bouazza)',
  service_area TEXT NOT NULL DEFAULT 'Grand Casablanca, Bouskoura, Dar Bouazza, Mohammedia, Rabat',
  instagram_url TEXT NOT NULL DEFAULT 'https://instagram.com',
  facebook_url TEXT NOT NULL DEFAULT 'https://facebook.com',
  currency TEXT NOT NULL DEFAULT 'MAD',
  booking_notice_fr TEXT NOT NULL DEFAULT 'Toute demande de réservation fait l''objet d''une étude personnalisée et d''un devis détaillé sous 24h ouvrées.',
  logo_url TEXT DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO company_settings (id) VALUES ('default');
