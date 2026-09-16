-- Seed Data untuk BESMINDO Vehicle Inspection System

-- Insert default admin user (password: qwerty)
INSERT INTO users (name, username, password, role, status) 
VALUES (
  'Administrator',
  'admin',
  '$2a$10$XC4O0pJdDrW/Wo4WxCBI9eyL0xupyK1HGSktCTStYu0/Tlp3.brlC',
  'admin',
  'active'
) ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password;

-- Insert Form Types
INSERT INTO form_types (code, name, type_key) VALUES
('BMSD/04/FO/HSE/02/17', 'Formulir Inspeksi Unit Dozer', 'dozer'),
('BMSD/01/FO/TRN/11/22', 'Lembar Pemeriksaan Harian Kendaraan LV & Bus', 'lv_bus'),
('BMSD/12/FO/TRN/11/22', 'Lembar Pemeriksaan Harian Kendaraan Vacum Truck', 'vacum'),
('BMSD/10/FO/TRN/11/22', 'Lembar Pemeriksaan Harian Kendaraan Tandem & Lowbad', 'tandem')
ON CONFLICT (type_key) DO NOTHING;

-- Get form type IDs untuk referensi
DO $$
DECLARE
  dozer_id UUID;
  lv_bus_id UUID;
  vacum_id UUID;
  tandem_id UUID;
BEGIN
  SELECT id INTO dozer_id FROM form_types WHERE type_key = 'dozer';
  SELECT id INTO lv_bus_id FROM form_types WHERE type_key = 'lv_bus';
  SELECT id INTO vacum_id FROM form_types WHERE type_key = 'vacum';
  SELECT id INTO tandem_id FROM form_types WHERE type_key = 'tandem';

  -- ===== DOZER FORM =====
  -- Category A: Standard Safety Devices
  INSERT INTO checklist_categories (form_type_id, name, sort_order) VALUES
  (dozer_id, 'A. Standard Safety Devices', 1);
  
  WITH cat_a AS (SELECT id FROM checklist_categories WHERE form_type_id = dozer_id AND name = 'A. Standard Safety Devices')
  INSERT INTO checklist_items (category_id, description, sort_order) 
  SELECT id, unnest(ARRAY[
    'Sabuk Pengaman Operator',
    'Kaca Spion Kiri & Kanan',
    'Lampu Pengarah',
    'Lampu Mundur + Alarm',
    'Lampu Rotary',
    'Klakson',
    'Pompa hidrolik naik-turun pisau / Hydraulic Pump',
    'Kemudi / Steering',
    'Belok Kanan',
    'Belok Kiri',
    'Lifting',
    'Line',
    'Maju - Mundur',
    'Silinder hydrolik pisau dozer / Lin Cylinder',
    'Motor penggerak gulungan / Winch Drive',
    'Penggerak tempat gulungan / Winch drum',
    'Kabel rope di gulungan / Winch Wire Rope',
    'Pisau dozer / Blade',
    'Bantalan rantai dozer / Track shoe',
    'Sambungan rantai dozer / Track Link',
    'Track Roller Single',
    'Track Roller Double',
    'Roller di bagian atas / Top Roller',
    'Bingkai rantai dozer / Track Frame',
    'Sproket',
    'Mesin penggerak dozer / Final drive'
  ]), generate_series(1, 26) FROM cat_a;

  -- Category B: Pengaman Pendukung
  INSERT INTO checklist_categories (form_type_id, name, sort_order) VALUES
  (dozer_id, 'B. Pengaman Pendukung / Penggunaan Terbatas', 2);
  
  WITH cat_b AS (SELECT id FROM checklist_categories WHERE form_type_id = dozer_id AND name = 'B. Pengaman Pendukung / Penggunaan Terbatas')
  INSERT INTO checklist_items (category_id, description, sort_order) 
  SELECT id, unnest(ARRAY[
    'Segitiga pengaman',
    'Bendera Merah',
    'Racun Api',
    'Kotak Obat (P3K)',
    'Kerucut / Safe Corn',
    'Masa berlaku Permit, SIO, SIM (dicek)',
    'Kondisi Alat ukuran Jam Kerja Mesin'
  ]), generate_series(1, 7) FROM cat_b;

  -- Category C: Mechanik
  INSERT INTO checklist_categories (form_type_id, name, sort_order) VALUES
  (dozer_id, 'C. Mechanik / Perlu Bantuan Pemeriksaan', 3);
  
  WITH cat_c AS (SELECT id FROM checklist_categories WHERE form_type_id = dozer_id AND name = 'C. Mechanik / Perlu Bantuan Pemeriksaan')
  INSERT INTO checklist_items (category_id, description, sort_order) 
  SELECT id, unnest(ARRAY[
    'Kondisi/kecukupan Oli Mesin (Oli-40)',
    'Kondisi/kecukupan Oli hidrolik (Oli-10)',
    'Kondisi/kecukupan Oli winch (Oli-40)',
    'Kondisi/kecukupan Oli final drive (Oli-90)',
    'Periksa Air Radiator',
    'Periksa Bahan bakar Solar',
    'Periksa Air Battery'
  ]), generate_series(1, 7) FROM cat_c;

  -- Category D & E
  INSERT INTO checklist_categories (form_type_id, name, sort_order) VALUES
  (dozer_id, 'D. Pencucian Unit / Kendaraan', 4),
  (dozer_id, 'E. Service Unit / Kendaraan', 5);
  
  WITH cat_d AS (SELECT id FROM checklist_categories WHERE form_type_id = dozer_id AND name = 'D. Pencucian Unit / Kendaraan')
  INSERT INTO checklist_items (category_id, description, sort_order) 
  SELECT id, 'Pencucian Unit / Kendaraan', 1 FROM cat_d;
  
  WITH cat_e AS (SELECT id FROM checklist_categories WHERE form_type_id = dozer_id AND name = 'E. Service Unit / Kendaraan')
  INSERT INTO checklist_items (category_id, description, sort_order) 
  SELECT id, 'Service Unit / Kendaraan', 1 FROM cat_e;

  -- ===== LV & BUS FORM =====
  -- Category A: Kondisi Umum
  INSERT INTO checklist_categories (form_type_id, name, sort_order) VALUES
  (lv_bus_id, 'A. Kondisi Umum', 1);
  
  WITH cat_a AS (SELECT id FROM checklist_categories WHERE form_type_id = lv_bus_id AND name = 'A. Kondisi Umum')
  INSERT INTO checklist_items (category_id, description, sort_order) 
  SELECT id, unnest(ARRAY[
    'Lampu besar, Lampu kecil luar, lampu sign, lampu stop, Lampu BM, Lampu Rem, Lampu cabin, Lampu Mundur',
    'Kaca (Depan, Belakang, Pintu, Jendela)',
    'Kaca spion luar (L&R), kaca spion dalam',
    'Instrument cabin: Spedo meter',
    'Kondisi tempat duduk',
    'Safety belt (LR)',
    'Wiper & Air',
    'Kondisi Ban, tekanan angin ban, baut roda',
    'Ban cadangan (kondisi kelayakan)',
    'Klakson utama',
    'Alarm mundur & Kamera Mundur',
    'Alat Monitor Kecepatan (GPS)',
    'CVVR (Cabin Video Voice Recorder)',
    'Ganjal Ban',
    'Kondisi lantai'
  ]), generate_series(1, 15) FROM cat_a;

  -- Category B: Perlengkapan Keselamatan
  INSERT INTO checklist_categories (form_type_id, name, sort_order) VALUES
  (lv_bus_id, 'B. Perlengkapan Keselamatan', 2);
  
  WITH cat_b AS (SELECT id FROM checklist_categories WHERE form_type_id = lv_bus_id AND name = 'B. Perlengkapan Keselamatan')
  INSERT INTO checklist_items (category_id, description, sort_order) 
  SELECT id, unnest(ARRAY[
    'Segitiga pengaman',
    'Racun Api',
    'P3K',
    'Dongkrak, Handle, Kunci Roda',
    'Senter'
  ]), generate_series(1, 5) FROM cat_b;

  -- Category C: Bagian Mesin
  INSERT INTO checklist_categories (form_type_id, name, sort_order) VALUES
  (lv_bus_id, 'C. Bagian Mesin', 3);
  
  WITH cat_c AS (SELECT id FROM checklist_categories WHERE form_type_id = lv_bus_id AND name = 'C. Bagian Mesin')
  INSERT INTO checklist_items (category_id, description, sort_order) 
  SELECT id, unnest(ARRAY[
    'Oli Mesin',
    'Battery',
    'Stering system, Power stering oil',
    'V-belt',
    'Minyak rem & Rem tangan',
    'Air radiator',
    'Pedal Gas & Pedal Coupling'
  ]), generate_series(1, 7) FROM cat_c;

  -- ===== VACUM TRUCK FORM =====
  -- Copy dari LV_BUS dengan modifikasi item 15
  INSERT INTO checklist_categories (form_type_id, name, sort_order) VALUES
  (vacum_id, 'A. Kondisi Umum', 1);
  
  WITH cat_a AS (SELECT id FROM checklist_categories WHERE form_type_id = vacum_id AND name = 'A. Kondisi Umum')
  INSERT INTO checklist_items (category_id, description, sort_order) 
  SELECT id, unnest(ARRAY[
    'Lampu besar, Lampu kecil luar, lampu sign, lampu stop, Lampu BM, Lampu Rem, Lampu cabin, Lampu Mundur',
    'Kaca (Depan, Belakang, Pintu, Jendela)',
    'Kaca spion luar (L&R), kaca spion dalam',
    'Instrument cabin: Spedo meter',
    'Kondisi tempat duduk',
    'Safety belt (LR)',
    'Wiper & Air',
    'Kondisi Ban, tekanan angin ban, baut roda',
    'Ban cadangan (kondisi kelayakan)',
    'Klakson utama',
    'Alarm mundur & Kamera Mundur',
    'Alat Monitor Kecepatan (GPS)',
    'CVVR (Cabin Video Voice Recorder)',
    'Ganjal Ban',
    'Lampu Rotary'
  ]), generate_series(1, 15) FROM cat_a;

  INSERT INTO checklist_categories (form_type_id, name, sort_order) VALUES
  (vacum_id, 'B. Perlengkapan Keselamatan', 2);
  
  WITH cat_b AS (SELECT id FROM checklist_categories WHERE form_type_id = vacum_id AND name = 'B. Perlengkapan Keselamatan')
  INSERT INTO checklist_items (category_id, description, sort_order) 
  SELECT id, unnest(ARRAY[
    'Segitiga pengaman',
    'Racun Api',
    'P3K',
    'Dongkrak, Handle, Kunci Roda',
    'Senter'
  ]), generate_series(1, 5) FROM cat_b;

  INSERT INTO checklist_categories (form_type_id, name, sort_order) VALUES
  (vacum_id, 'C. Bagian Mesin', 3);
  
  WITH cat_c AS (SELECT id FROM checklist_categories WHERE form_type_id = vacum_id AND name = 'C. Bagian Mesin')
  INSERT INTO checklist_items (category_id, description, sort_order) 
  SELECT id, unnest(ARRAY[
    'Oli Mesin',
    'Battery',
    'Stering system, Power stering oil',
    'V-belt',
    'Minyak rem & Rem tangan',
    'Air radiator',
    'Pedal Gas & Pedal Coupling'
  ]), generate_series(1, 7) FROM cat_c;

  -- Category D: Bagian Khusus Vacum
  INSERT INTO checklist_categories (form_type_id, name, sort_order) VALUES
  (vacum_id, 'D. Bagian Khusus', 4);
  
  WITH cat_d AS (SELECT id FROM checklist_categories WHERE form_type_id = vacum_id AND name = 'D. Bagian Khusus')
  INSERT INTO checklist_items (category_id, description, sort_order) 
  SELECT id, unnest(ARRAY[
    'PTO: pelumas, propeller shaft, dll',
    'Engine Thomson',
    'Pengukur Cairan Tanki',
    'Amper Tekanan Udara',
    'Hose Hisap / membuang'
  ]), generate_series(1, 5) FROM cat_d;

  -- ===== TANDEM & LOWBAD FORM =====
  INSERT INTO checklist_categories (form_type_id, name, sort_order) VALUES
  (tandem_id, 'A. Kondisi Umum', 1);
  
  WITH cat_a AS (SELECT id FROM checklist_categories WHERE form_type_id = tandem_id AND name = 'A. Kondisi Umum')
  INSERT INTO checklist_items (category_id, description, sort_order) 
  SELECT id, unnest(ARRAY[
    'Lampu besar, Lampu kecil luar, lampu sign, lampu stop, Lampu BM, Lampu Rem, Lampu cabin, Lampu Mundur',
    'Kaca (Depan, Belakang, Pintu, Jendela)',
    'Kaca spion luar (L&R), kaca spion dalam',
    'Instrument cabin: Spedo meter',
    'Kondisi tempat duduk',
    'Safety belt (LR)',
    'Wiper & Air',
    'Kondisi Ban, tekanan angin ban, baut roda',
    'Ban cadangan (kondisi kelayakan)',
    'Klakson utama',
    'Alarm mundur & Kamera Mundur',
    'Alat Monitor Kecepatan (GPS)',
    'CVVR (Cabin Video Voice Recorder)',
    'Ganjal Ban',
    'Lampu Rotary'
  ]), generate_series(1, 15) FROM cat_a;

  INSERT INTO checklist_categories (form_type_id, name, sort_order) VALUES
  (tandem_id, 'B. Perlengkapan Keselamatan', 2);
  
  WITH cat_b AS (SELECT id FROM checklist_categories WHERE form_type_id = tandem_id AND name = 'B. Perlengkapan Keselamatan')
  INSERT INTO checklist_items (category_id, description, sort_order) 
  SELECT id, unnest(ARRAY[
    'Segitiga pengaman',
    'Racun Api',
    'P3K',
    'Dongkrak, Handle, Kunci Roda',
    'Senter'
  ]), generate_series(1, 5) FROM cat_b;

  INSERT INTO checklist_categories (form_type_id, name, sort_order) VALUES
  (tandem_id, 'C. Bagian Mesin', 3);
  
  WITH cat_c AS (SELECT id FROM checklist_categories WHERE form_type_id = tandem_id AND name = 'C. Bagian Mesin')
  INSERT INTO checklist_items (category_id, description, sort_order) 
  SELECT id, unnest(ARRAY[
    'Oli Mesin',
    'Battery',
    'Stering system, Power stering oil',
    'V-belt',
    'Minyak rem & Rem tangan',
    'Air radiator',
    'Pedal Gas & Pedal Coupling'
  ]), generate_series(1, 7) FROM cat_c;

  -- Category D: Bagian Khusus Tandem
  INSERT INTO checklist_categories (form_type_id, name, sort_order) VALUES
  (tandem_id, 'D. Bagian Khusus', 4);
  
  WITH cat_d AS (SELECT id FROM checklist_categories WHERE form_type_id = tandem_id AND name = 'D. Bagian Khusus')
  INSERT INTO checklist_items (category_id, description, sort_order) 
  SELECT id, unnest(ARRAY[
    'PTO: pelumas, propeller shaft, dll',
    'Suspension system',
    'Chamber, Saluran angin',
    'Valve/Hose',
    'Winch',
    'Pin Roller',
    'Roller',
    'Sling Load',
    'Sling Drum',
    'Rantai Pengikat / kunci rantai',
    'Ram'
  ]), generate_series(1, 11) FROM cat_d;

END $$;

-- Insert sample vehicles
INSERT INTO vehicles (vehicle_number, vehicle_type, form_type, department, asset_bms_no, is_active) VALUES
('D-001', 'Dozer Komatsu D85', 'dozer', 'HSE', 'BMS-D001', true),
('B 1234 XYZ', 'Toyota Hiace', 'lv_bus', 'Transport', 'BMS-B001', true),
('B 5678 ABC', 'Mitsubishi Colt Diesel Vacuum', 'vacum', 'Transport', 'BMS-V001', true),
('B 9012 DEF', 'Hino Lowbed', 'tandem', 'Transport', 'BMS-T001', true)
ON CONFLICT DO NOTHING;
