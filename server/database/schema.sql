-- BESMINDO Vehicle Inspection Database Schema
-- PT. BESMINDO - Drilling & Work Over Rig Services

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(10) CHECK (role IN ('admin', 'operator')) NOT NULL,
  phone VARCHAR(20),
  status VARCHAR(10) CHECK (status IN ('pending', 'active', 'inactive')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Vehicles (Master Data Kendaraan)
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_number VARCHAR(50) NOT NULL,
  vehicle_type VARCHAR(100),
  form_type VARCHAR(20) CHECK (form_type IN ('dozer', 'lv_bus', 'vacum', 'tandem')),
  department VARCHAR(100),
  asset_bms_no VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_form_type ON vehicles(form_type);
CREATE INDEX IF NOT EXISTS idx_vehicles_is_active ON vehicles(is_active);

-- Form Types
CREATE TABLE IF NOT EXISTS form_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(30) NOT NULL,
  name VARCHAR(100) NOT NULL,
  type_key VARCHAR(20) UNIQUE NOT NULL
);

-- Checklist Categories
CREATE TABLE IF NOT EXISTS checklist_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_type_id UUID REFERENCES form_types(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checklist_categories_form_type ON checklist_categories(form_type_id);

-- Checklist Items
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES checklist_categories(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checklist_items_category ON checklist_items(category_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_is_active ON checklist_items(is_active);

-- Inspections (Header Form)
CREATE TABLE IF NOT EXISTS inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_type_id UUID REFERENCES form_types(id),
  vehicle_id UUID REFERENCES vehicles(id),
  operator_id UUID REFERENCES users(id),
  shift VARCHAR(5) CHECK (shift IN ('1st', '2nd')) NOT NULL,
  inspection_date DATE NOT NULL,
  inspection_time TIME,
  
  -- Header fields umum
  department VARCHAR(100),
  location VARCHAR(200),
  asset_status VARCHAR(100),
  
  -- Untuk kendaraan bermotor
  km_reading_value DECIMAL(10,1),
  exp_pajak DATE,
  exp_kiur DATE,
  exp_coi DATE,
  tahun_k3 INT,
  
  -- Untuk dozer
  running_hours DECIMAL(10,1),
  sn_engine VARCHAR(100),
  model VARCHAR(100),
  
  -- Status & approval
  status VARCHAR(15) CHECK (status IN ('draft', 'submitted')) DEFAULT 'draft',
  acknowledged_by UUID REFERENCES users(id),
  acknowledged_at TIMESTAMP,
  
  -- Notes
  problem_notes TEXT,
  operator_name VARCHAR(100),
  
  submitted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inspections_date ON inspections(inspection_date DESC);
CREATE INDEX IF NOT EXISTS idx_inspections_operator ON inspections(operator_id);
CREATE INDEX IF NOT EXISTS idx_inspections_vehicle ON inspections(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_inspections_status ON inspections(status);
CREATE INDEX IF NOT EXISTS idx_inspections_form_type ON inspections(form_type_id);

-- Personal Documents (SIM, Permit, Kartu)
CREATE TABLE IF NOT EXISTS personal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE,
  doc_type VARCHAR(30) CHECK (doc_type IN ('SIM', 'Permit_BMS', 'Kartu_Pengemudi')),
  doc_number_1st VARCHAR(100),
  doc_number_2nd VARCHAR(100),
  expiry_date_1st DATE,
  expiry_date_2nd DATE
);

CREATE INDEX IF NOT EXISTS idx_personal_documents_inspection ON personal_documents(inspection_id);

-- Inspection Results (hasil checklist per item)
CREATE TABLE IF NOT EXISTS inspection_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE,
  checklist_item_id UUID REFERENCES checklist_items(id),
  condition VARCHAR(10) CHECK (condition IN ('good', 'broken', 'na')) NOT NULL,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_inspection_results_inspection ON inspection_results(inspection_id);
CREATE INDEX IF NOT EXISTS idx_inspection_results_condition ON inspection_results(condition);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(30) CHECK (type IN ('broken_item', 'new_registration')),
  title VARCHAR(200),
  message TEXT,
  related_inspection_id UUID REFERENCES inspections(id),
  related_user_id UUID REFERENCES users(id),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- Trigger untuk updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checklist_items_updated_at BEFORE UPDATE ON checklist_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inspections_updated_at BEFORE UPDATE ON inspections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
