import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

let useMock = false;
let pool = null;

// Initial mock dataset based on PRD v2.0
const mockData = {
  users: [
    {
      id: 'u1-admin-uuid',
      name: 'Administrator HSE',
      username: 'admin',
      password: '', // will be set below
      role: 'admin',
      phone: '081234567890',
      status: 'active',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'u2-operator-uuid',
      name: 'Budi Santoso',
      username: 'budi',
      password: '', // will be set below
      role: 'operator',
      phone: '081298765432',
      status: 'active',
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'u3-operator-pending',
      name: 'Joko Prabowo',
      username: 'joko',
      password: '',
      role: 'operator',
      phone: '081377889900',
      status: 'pending',
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  form_types: [
    { id: 'ft-dozer', code: 'BMSD/04/FO/HSE/02/17', name: 'Formulir Inspeksi Unit Dozer', type_key: 'dozer' },
    { id: 'ft-lv-bus', code: 'BMSD/01/FO/TRN/11/22', name: 'Lembar Pemeriksaan Harian Kendaraan LV & Bus', type_key: 'lv_bus' },
    { id: 'ft-vacum', code: 'BMSD/12/FO/TRN/11/22', name: 'Lembar Pemeriksaan Harian Kendaraan Vacum Truck', type_key: 'vacum' },
    { id: 'ft-tandem', code: 'BMSD/10/FO/TRN/11/22', name: 'Lembar Pemeriksaan Harian Kendaraan Tandem & Lowbad', type_key: 'tandem' },
    { id: 'ft-forklift', code: 'BMSD/20/FO/HSE/01/24', name: 'Formulir Inspeksi Harian Forklift', type_key: 'forklift' }
  ],
  // NEW: Master Data Tables
  vehicle_models: [
    { id: 'mdl-1', name: 'Bulldozer Heavy Duty', category: 'dozer', is_active: true },
    { id: 'mdl-2', name: 'Komatsu D85', category: 'dozer', is_active: true },
    { id: 'mdl-3', name: 'Toyota Hilux 4x4', category: 'lv', is_active: true },
    { id: 'mdl-4', name: 'Isuzu Elf Bus Crew', category: 'bus', is_active: true },
    { id: 'mdl-5', name: 'Hino 500 Vacum Truck', category: 'vacum', is_active: true },
    { id: 'mdl-6', name: 'Mitsubishi Fuso Lowbad 40T', category: 'tandem', is_active: true },
    { id: 'mdl-7', name: 'Toyota 8FD25 Forklift 2.5T', category: 'forklift', is_active: true },
    { id: 'mdl-8', name: 'Komatsu FD30T Forklift 3T', category: 'forklift', is_active: true }
  ],
  departments: [
    { id: 'dept-1', name: 'Rig Operation & Earthmoving', code: 'RIG-OPS', is_active: true },
    { id: 'dept-2', name: 'Transport Logistics', code: 'TRN-LOG', is_active: true },
    { id: 'dept-3', name: 'Waste & Mud Services', code: 'WMS', is_active: true },
    { id: 'dept-4', name: 'Heavy Rig Move', code: 'HRM', is_active: true },
    { id: 'dept-5', name: 'Workshop Maintenance', code: 'WKS-MNT', is_active: true }
  ],
  work_locations: [
    { id: 'loc-1', name: 'Yard / Basecamp Operasional', location_type: 'yard', is_active: true },
    { id: 'loc-2', name: 'Field Area Duri', location_type: 'field', is_active: true },
    { id: 'loc-3', name: 'Workshop Maintenance', location_type: 'workshop', is_active: true },
    { id: 'loc-4', name: 'Rig Site A', location_type: 'field', is_active: true },
    { id: 'loc-5', name: 'Rig Site B', location_type: 'field', is_active: true }
  ],
  asset_statuses: [
    { id: 'status-1', name: 'Operasional', color: 'green', is_active: true },
    { id: 'status-2', name: 'Standby', color: 'yellow', is_active: true },
    { id: 'status-3', name: 'Maintenance/Repair', color: 'orange', is_active: true },
    { id: 'status-4', name: 'Out of Service', color: 'red', is_active: true }
  ],
  vehicles: [
    {
      id: 'v1',
      vehicle_number: 'DZ-01 (Komatsu D85)',
      vehicle_type: 'Bulldozer Heavy Duty',
      form_type: 'dozer',
      department: 'Rig Operation & Earthmoving',
      asset_bms_no: 'BMS-DZ-2021-01',
      // NEW: Master data references
      vehicle_model_id: 'mdl-2',
      department_id: 'dept-1',
      default_location_id: 'loc-1',
      default_asset_status_id: 'status-1',
      sn_engine: 'KMT-D85-2021-001',
      year_manufacture: 2021,
      exp_pajak: '2027-12-31',
      exp_kiur: '2026-10-15',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'v2',
      vehicle_number: 'BK 1234 AB',
      vehicle_type: 'Toyota Hilux 4x4',
      form_type: 'lv_bus',
      department: 'Transport Logistics',
      asset_bms_no: 'BMS-LV-2022-04',
      // NEW: Master data references
      vehicle_model_id: 'mdl-3',
      department_id: 'dept-2',
      default_location_id: 'loc-1',
      default_asset_status_id: 'status-1',
      sn_engine: null,
      year_manufacture: 2022,
      exp_pajak: '2027-06-15',
      exp_kiur: '2026-08-20',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'v3',
      vehicle_number: 'BK 8899 CD',
      vehicle_type: 'Isuzu Elf Bus Crew',
      form_type: 'lv_bus',
      department: 'Transport Logistics',
      asset_bms_no: 'BMS-BUS-2020-02',
      // NEW: Master data references
      vehicle_model_id: 'mdl-4',
      department_id: 'dept-2',
      default_location_id: 'loc-1',
      default_asset_status_id: 'status-1',
      sn_engine: null,
      year_manufacture: 2020,
      exp_pajak: '2026-12-01',
      exp_kiur: '2026-06-30',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'v4',
      vehicle_number: 'BK 9021 EF',
      vehicle_type: 'Hino 500 Vacum Truck',
      form_type: 'vacum',
      department: 'Waste & Mud Services',
      asset_bms_no: 'BMS-VC-2023-01',
      // NEW: Master data references
      vehicle_model_id: 'mdl-5',
      department_id: 'dept-3',
      default_location_id: 'loc-2',
      default_asset_status_id: 'status-1',
      sn_engine: null,
      year_manufacture: 2023,
      exp_pajak: '2028-03-10',
      exp_kiur: '2027-01-15',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'v5',
      vehicle_number: 'BK 7711 GH',
      vehicle_type: 'Mitsubishi Fuso Lowbad 40T',
      form_type: 'tandem',
      department: 'Heavy Rig Move',
      asset_bms_no: 'BMS-TD-2021-09',
      // NEW: Master data references
      vehicle_model_id: 'mdl-6',
      department_id: 'dept-4',
      default_location_id: 'loc-1',
      default_asset_status_id: 'status-1',
      sn_engine: null,
      year_manufacture: 2021,
      exp_pajak: '2027-09-25',
      exp_kiur: '2026-11-10',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'v6',
      vehicle_number: 'FKL-001 (Toyota 8FD25)',
      vehicle_type: 'Toyota 8FD25 Forklift 2.5T',
      form_type: 'forklift',
      department: 'Workshop Maintenance',
      asset_bms_no: 'BMS-FKL-2023-01',
      vehicle_model_id: 'mdl-7',
      department_id: 'dept-5',
      default_location_id: 'loc-3',
      default_asset_status_id: 'status-1',
      sn_engine: 'TYT-8FD25-2023-001',
      year_manufacture: 2023,
      exp_pajak: '2028-08-15',
      exp_kiur: '2027-06-20',
      is_active: true,
      created_at: new Date().toISOString()
    }
  ],
  checklist_categories: [],
  checklist_items: [],
  inspections: [],
  personal_documents: [],
  inspection_results: [],
  notifications: []
};

// Seed PRD Checklist Categories & Items
function initSeedData() {
  const adminHash = bcrypt.hashSync('qwerty', 10);
  const operatorHash = bcrypt.hashSync('operator123', 10);
  mockData.users[0].password = adminHash;
  mockData.users[1].password = operatorHash;
  mockData.users[2].password = operatorHash;

  // 1. DOZER
  const cDozerA = { id: 'c-dz-a', form_type_id: 'ft-dozer', name: 'A. Standard Safety Devices', sort_order: 1 };
  const cDozerB = { id: 'c-dz-b', form_type_id: 'ft-dozer', name: 'B. Pengaman Pendukung / Penggunaan Terbatas', sort_order: 2 };
  const cDozerC = { id: 'c-dz-c', form_type_id: 'ft-dozer', name: 'C. Mechanik / Perlu Bantuan Pemeriksaan', sort_order: 3 };
  const cDozerD = { id: 'c-dz-d', form_type_id: 'ft-dozer', name: 'D. Pencucian Unit / Kendaraan', sort_order: 4 };
  const cDozerE = { id: 'c-dz-e', form_type_id: 'ft-dozer', name: 'E. Service Unit / Kendaraan', sort_order: 5 };

  mockData.checklist_categories.push(cDozerA, cDozerB, cDozerC, cDozerD, cDozerE);

  const dozerItemsA = [
    'Sabuk Pengaman Operator', 'Kaca Spion Kiri & Kanan', 'Lampu Pengarah', 'Lampu Mundur + Alarm',
    'Lampu Rotary', 'Klakson', 'Pompa hidrolik naik-turun pisau / Hydraulic Pump', 'Kemudi / Steering',
    'Belok Kanan', 'Belok Kiri', 'Lifting', 'Line', 'Maju - Mundur',
    'Silinder hydrolik pisau dozer / Lin Cylinder', 'Motor penggerak gulungan / Winch Drive',
    'Penggerak tempat gulungan / Winch drum', 'Kabel rope di gulungan / Winch Wire Rope',
    'Pisau dozer / Blade', 'Bantalan rantai dozer / Track shoe', 'Sambungan rantai dozer / Track Link',
    'Track Roller Single', 'Track Roller Double', 'Roller di bagian atas / Top Roller',
    'Bingkai rantai dozer / Track Frame', 'Sproket', 'Mesin penggerak dozer / Final drive'
  ];
  dozerItemsA.forEach((desc, idx) => {
    mockData.checklist_items.push({
      id: `it-dz-a-${idx + 1}`,
      category_id: cDozerA.id,
      description: desc,
      sort_order: idx + 1,
      is_active: true
    });
  });

  const dozerItemsB = [
    'Segitiga pengaman', 'Bendera Merah', 'Racun Api', 'Kotak Obat (P3K)',
    'Kerucut / Safe Corn', 'Masa berlaku Permit, SIO, SIM (dicek)', 'Kondisi Alat ukuran Jam Kerja Mesin'
  ];
  dozerItemsB.forEach((desc, idx) => {
    mockData.checklist_items.push({
      id: `it-dz-b-${idx + 1}`,
      category_id: cDozerB.id,
      description: desc,
      sort_order: idx + 1,
      is_active: true
    });
  });

  const dozerItemsC = [
    'Kondisi/kecukupan Oli Mesin (Oli-40)', 'Kondisi/kecukupan Oli hidrolik (Oli-10)',
    'Kondisi/kecukupan Oli winch (Oli-40)', 'Kondisi/kecukupan Oli final drive (Oli-90)',
    'Periksa Air Radiator', 'Periksa Bahan bakar Solar', 'Periksa Air Battery'
  ];
  dozerItemsC.forEach((desc, idx) => {
    mockData.checklist_items.push({
      id: `it-dz-c-${idx + 1}`,
      category_id: cDozerC.id,
      description: desc,
      sort_order: idx + 1,
      is_active: true
    });
  });

  mockData.checklist_items.push(
    { id: 'it-dz-d-1', category_id: cDozerD.id, description: 'Pencucian Unit / Kendaraan berkala', sort_order: 1, is_active: true },
    { id: 'it-dz-e-1', category_id: cDozerE.id, description: 'Jadwal Service Unit / Kendaraan berkala', sort_order: 1, is_active: true }
  );

  // 2. LV & BUS
  const cLvA = { id: 'c-lv-a', form_type_id: 'ft-lv-bus', name: 'A. Kondisi Umum', sort_order: 1 };
  const cLvB = { id: 'c-lv-b', form_type_id: 'ft-lv-bus', name: 'B. Perlengkapan Keselamatan', sort_order: 2 };
  const cLvC = { id: 'c-lv-c', form_type_id: 'ft-lv-bus', name: 'C. Bagian Mesin', sort_order: 3 };
  mockData.checklist_categories.push(cLvA, cLvB, cLvC);

  const lvItemsA = [
    'Lampu besar, Lampu kecil luar, lampu sign, lampu stop, Lampu BM, Lampu Rem, Lampu cabin, Lampu Mundur',
    'Kaca (Depan, Belakang, Pintu, Jendela)', 'Kaca spion luar (L&R), kaca spion dalam',
    'Instrument cabin: Spedo meter', 'Kondisi tempat duduk', 'Safety belt (LR)',
    'Wiper & Air', 'Kondisi Ban, tekanan angin ban, baut roda', 'Ban cadangan (kondisi kelayakan)',
    'Klakson utama', 'Alarm mundur & Kamera Mundur', 'Alat Monitor Kecepatan (GPS)',
    'CVVR (Cabin Video Voice Recorder)', 'Ganjal Ban', 'Kondisi lantai'
  ];
  lvItemsA.forEach((desc, idx) => {
    mockData.checklist_items.push({
      id: `it-lv-a-${idx + 1}`,
      category_id: cLvA.id,
      description: desc,
      sort_order: idx + 1,
      is_active: true
    });
  });

  const lvItemsB = [
    'Segitiga pengaman', 'Racun Api', 'P3K', 'Dongkrak, Handle, Kunci Roda', 'Senter'
  ];
  lvItemsB.forEach((desc, idx) => {
    mockData.checklist_items.push({
      id: `it-lv-b-${idx + 1}`,
      category_id: cLvB.id,
      description: desc,
      sort_order: idx + 1,
      is_active: true
    });
  });

  const lvItemsC = [
    'Oli Mesin', 'Battery', 'Stering system, Power stering oil', 'V-belt',
    'Minyak rem & Rem tangan', 'Air radiator', 'Pedal Gas & Pedal Coupling'
  ];
  lvItemsC.forEach((desc, idx) => {
    mockData.checklist_items.push({
      id: `it-lv-c-${idx + 1}`,
      category_id: cLvC.id,
      description: desc,
      sort_order: idx + 1,
      is_active: true
    });
  });

  // 3. VACUM TRUCK
  const cVacumA = { id: 'c-vc-a', form_type_id: 'ft-vacum', name: 'A. Kondisi Umum', sort_order: 1 };
  const cVacumB = { id: 'c-vc-b', form_type_id: 'ft-vacum', name: 'B. Perlengkapan Keselamatan', sort_order: 2 };
  const cVacumC = { id: 'c-vc-c', form_type_id: 'ft-vacum', name: 'C. Bagian Mesin', sort_order: 3 };
  const cVacumD = { id: 'c-vc-d', form_type_id: 'ft-vacum', name: 'D. Bagian Khusus', sort_order: 4 };
  mockData.checklist_categories.push(cVacumA, cVacumB, cVacumC, cVacumD);

  const vacumItemsA = [...lvItemsA];
  vacumItemsA[14] = 'Lampu Rotary';
  vacumItemsA.forEach((desc, idx) => {
    mockData.checklist_items.push({
      id: `it-vc-a-${idx + 1}`,
      category_id: cVacumA.id,
      description: desc,
      sort_order: idx + 1,
      is_active: true
    });
  });
  lvItemsB.forEach((desc, idx) => {
    mockData.checklist_items.push({
      id: `it-vc-b-${idx + 1}`,
      category_id: cVacumB.id,
      description: desc,
      sort_order: idx + 1,
      is_active: true
    });
  });
  lvItemsC.forEach((desc, idx) => {
    mockData.checklist_items.push({
      id: `it-vc-c-${idx + 1}`,
      category_id: cVacumC.id,
      description: desc,
      sort_order: idx + 1,
      is_active: true
    });
  });
  const vacumItemsD = [
    'PTO: pelumas, propeller shaft, dll', 'Engine Thomson', 'Pengukur Cairan Tanki',
    'Amper Tekanan Udara', 'Hose Hisap / membuang'
  ];
  vacumItemsD.forEach((desc, idx) => {
    mockData.checklist_items.push({
      id: `it-vc-d-${idx + 1}`,
      category_id: cVacumD.id,
      description: desc,
      sort_order: idx + 1,
      is_active: true
    });
  });

  // 4. TANDEM & LOWBAD
  const cTandemA = { id: 'c-td-a', form_type_id: 'ft-tandem', name: 'A. Kondisi Umum', sort_order: 1 };
  const cTandemB = { id: 'c-td-b', form_type_id: 'ft-tandem', name: 'B. Perlengkapan Keselamatan', sort_order: 2 };
  const cTandemC = { id: 'c-td-c', form_type_id: 'ft-tandem', name: 'C. Bagian Mesin', sort_order: 3 };
  const cTandemD = { id: 'c-td-d', form_type_id: 'ft-tandem', name: 'D. Bagian Khusus', sort_order: 4 };
  mockData.checklist_categories.push(cTandemA, cTandemB, cTandemC, cTandemD);

  vacumItemsA.forEach((desc, idx) => {
    mockData.checklist_items.push({
      id: `it-td-a-${idx + 1}`,
      category_id: cTandemA.id,
      description: desc,
      sort_order: idx + 1,
      is_active: true
    });
  });
  lvItemsB.forEach((desc, idx) => {
    mockData.checklist_items.push({
      id: `it-td-b-${idx + 1}`,
      category_id: cTandemB.id,
      description: desc,
      sort_order: idx + 1,
      is_active: true
    });
  });
  lvItemsC.forEach((desc, idx) => {
    mockData.checklist_items.push({
      id: `it-td-c-${idx + 1}`,
      category_id: cTandemC.id,
      description: desc,
      sort_order: idx + 1,
      is_active: true
    });
  });
  const tandemItemsD = [
    'PTO: pelumas, propeller shaft, dll', 'Suspension system', 'Chamber, Saluran angin',
    'Valve/Hose', 'Winch', 'Pin Roller', 'Roller', 'Sling Load', 'Sling Drum',
    'Rantai Pengikat / kunci rantai', 'Ram'
  ];
  tandemItemsD.forEach((desc, idx) => {
    mockData.checklist_items.push({
      id: `it-td-d-${idx + 1}`,
      category_id: cTandemD.id,
      description: desc,
      sort_order: idx + 1,
      is_active: true
    });
  });

  // 5. FORKLIFT (FORMULIR BARU - ISI BERBEDA!)
  const cForkliftA = { id: 'c-fkl-a', form_type_id: 'ft-forklift', name: 'A. Sistem Keselamatan Forklift', sort_order: 1 };
  const cForkliftB = { id: 'c-fkl-b', form_type_id: 'ft-forklift', name: 'B. Sistem Hidrolik & Lifting', sort_order: 2 };
  const cForkliftC = { id: 'c-fkl-c', form_type_id: 'ft-forklift', name: 'C. Sistem Mesin & Bahan Bakar', sort_order: 3 };
  const cForkliftD = { id: 'c-fkl-d', form_type_id: 'ft-forklift', name: 'D. Sistem Kelistrikan', sort_order: 4 };
  const cForkliftE = { id: 'c-fkl-e', form_type_id: 'ft-forklift', name: 'E. Perlengkapan Pendukung', sort_order: 5 };
  mockData.checklist_categories.push(cForkliftA, cForkliftB, cForkliftC, cForkliftD, cForkliftE);

  const forkliftItemsA = [
    'Overhead Guard (Kanopi pelindung operator)',
    'Seat Belt operator',
    'Load Backrest (Pelindung beban jatuh ke operator)',
    'Horn / Klakson',
    'Lampu kerja / Work Light',
    'Lampu rotary / Warning Light',
    'Alarm mundur / Reverse Alarm',
    'Spion kiri dan kanan',
    'Fire Extinguisher / APAR',
    'Rem parkir / Parking Brake',
    'Rem kaki / Foot Brake'
  ];
  forkliftItemsA.forEach((desc, idx) => {
    mockData.checklist_items.push({
      id: `it-fkl-a-${idx + 1}`,
      category_id: cForkliftA.id,
      description: desc,
      sort_order: idx + 1,
      is_active: true
    });
  });

  const forkliftItemsB = [
    'Mast (Tiang angkat) - tidak bengkok/retak',
    'Fork / Garpu - tidak bengkok/retak',
    'Fork locking pin / Pengunci garpu',
    'Lift Chain / Rantai pengangkat',
    'Lift Cylinder / Silinder hidrolik',
    'Tilt Cylinder / Silinder kemiringan',
    'Hydraulic Hose / Selang hidrolik - tidak bocor',
    'Hydraulic Oil Level / Level oli hidrolik',
    'Carriage (Dudukan fork) - berfungsi baik',
    'Lift & Tilt Control / Kontrol naik-turun & miring'
  ];
  forkliftItemsB.forEach((desc, idx) => {
    mockData.checklist_items.push({
      id: `it-fkl-b-${idx + 1}`,
      category_id: cForkliftB.id,
      description: desc,
      sort_order: idx + 1,
      is_active: true
    });
  });

  const forkliftItemsC = [
    'Engine Oil Level / Level oli mesin',
    'Radiator Water Level / Air radiator',
    'Fuel Level / Bahan bakar (LPG/Solar/Bensin)',
    'Air Filter / Filter udara - bersih',
    'Engine Temperature Gauge / Indikator suhu mesin',
    'Transmission / Sistem transmisi',
    'Exhaust System / Sistem pembuangan - tidak bocor',
    'Drive Shaft / Poros penggerak'
  ];
  forkliftItemsC.forEach((desc, idx) => {
    mockData.checklist_items.push({
      id: `it-fkl-c-${idx + 1}`,
      category_id: cForkliftC.id,
      description: desc,
      sort_order: idx + 1,
      is_active: true
    });
  });

  const forkliftItemsD = [
    'Battery / Aki - terminal bersih, tidak korosi',
    'Lampu depan / Headlight',
    'Lampu belakang / Tail Light',
    'Lampu sein / Turn Signal',
    'Instrument Panel / Panel instrumen',
    'Hour Meter / Meter jam kerja',
    'Starter System / Sistem starter'
  ];
  forkliftItemsD.forEach((desc, idx) => {
    mockData.checklist_items.push({
      id: `it-fkl-d-${idx + 1}`,
      category_id: cForkliftD.id,
      description: desc,
      sort_order: idx + 1,
      is_active: true
    });
  });

  const forkliftItemsE = [
    'Ban depan - kondisi & tekanan angin',
    'Ban belakang - kondisi & tekanan angin',
    'Steering / Kemudi - tidak ada kelonggaran',
    'Operator Seat / Tempat duduk operator',
    'Safety Cone / Kerucut pengaman',
    'Kotak P3K',
    'Segitiga pengaman',
    'Kebersihan unit secara keseluruhan'
  ];
  forkliftItemsE.forEach((desc, idx) => {
    mockData.checklist_items.push({
      id: `it-fkl-e-${idx + 1}`,
      category_id: cForkliftE.id,
      description: desc,
      sort_order: idx + 1,
      is_active: true
    });
  });

  // Seed sample inspection
  const today = new Date().toISOString().split('T')[0];
  const sampleInsp = {
    id: 'insp-sample-1',
    form_type_id: 'ft-lv-bus',
    vehicle_id: 'v2',
    operator_id: 'u2-operator-uuid',
    operator_name: 'Budi Santoso',
    shift: '1st',
    inspection_date: today,
    inspection_time: '07:30',
    department: 'Transport Logistics',
    location: 'Yard Duri Basecamp',
    asset_status: 'Operasional',
    km_reading_value: 45210.5,
    exp_pajak: '2026-12-31',
    exp_kiur: '2026-10-15',
    exp_coi: null,
    tahun_k3: null,
    running_hours: null,
    sn_engine: null,
    model: 'Hilux 2.4G 4x4',
    status: 'submitted',
    acknowledged_by: null,
    acknowledged_at: null,
    problem_notes: 'Lampu sein kanan belakang pecah perlu penggantian segera.',
    submitted_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    created_at: new Date(Date.now() - 3 * 3600000).toISOString()
  };
  mockData.inspections.push(sampleInsp);

  mockData.personal_documents.push(
    { id: 'pd-1', inspection_id: sampleInsp.id, doc_type: 'SIM', doc_number_1st: 'SIM-A-92817263', doc_number_2nd: '', expiry_date_1st: '2027-05-12', expiry_date_2nd: null },
    { id: 'pd-2', inspection_id: sampleInsp.id, doc_type: 'Permit_BMS', doc_number_1st: 'BMS-PRM-2024-88', doc_number_2nd: '', expiry_date_1st: '2026-12-01', expiry_date_2nd: null },
    { id: 'pd-3', inspection_id: sampleInsp.id, doc_type: 'Kartu_Pengemudi', doc_number_1st: 'KP-BMS-0912', doc_number_2nd: '', expiry_date_1st: '2027-01-10', expiry_date_2nd: null }
  );

  // Results for sample inspection
  mockData.checklist_items.filter(i => i.category_id.startsWith('c-lv-')).forEach((item, idx) => {
    const isBroken = item.id === 'it-lv-a-1';
    mockData.inspection_results.push({
      id: `ir-sample-${idx}`,
      inspection_id: sampleInsp.id,
      checklist_item_id: item.id,
      condition: isBroken ? 'broken' : (idx === 14 ? 'na' : 'good'),
      notes: isBroken ? 'Kaca lampu sign retak dan tidak menyala saat belok kanan' : null
    });
  });

  // Seed sample notification
  mockData.notifications.push({
    id: 'notif-1',
    type: 'broken_item',
    title: 'Item Rusak Dilaporkan',
    message: 'Operator Budi Santoso melaporkan item rusak pada kendaraan BK 1234 AB.',
    related_inspection_id: sampleInsp.id,
    related_user_id: null,
    is_read: false,
    created_at: new Date(Date.now() - 3 * 3600000).toISOString()
  });
}

initSeedData();

// Check if PostgreSQL connection is configured
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('postgresql://')) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    pool.connect((err, client, release) => {
      if (err) {
        console.warn('⚠️ Supabase/PostgreSQL connection failed. Operating in Resilient Mock DB mode.');
        useMock = true;
      } else {
        console.log('✅ Connected to Supabase PostgreSQL successfully.');
        useMock = false;
        release();
      }
    });
  } catch (err) {
    console.warn('⚠️ Could not initialize pg Pool. Using Resilient Mock DB mode.');
    useMock = true;
  }
} else {
  console.log('ℹ️ No DATABASE_URL provided. Operating in Resilient Mock DB mode with complete PRD seeds.');
  useMock = true;
}

// Resilient Query Interface
const db = {
  async query(text, params = []) {
    if (!useMock && pool) {
      try {
        return await pool.query(text, params);
      } catch (err) {
        console.error('PostgreSQL query error, falling back to mock memory query:', err.message);
      }
    }

    // Mock query engine for local in-memory fallback
    const sql = text.trim();
    const upper = sql.toUpperCase();

    // 1. SELECT Users
    if (upper.startsWith('SELECT') && upper.includes('FROM USERS')) {
      let filtered = [...mockData.users];
      if (sql.includes('WHERE username = $1')) {
        filtered = filtered.filter(u => u.username.toLowerCase() === (params[0] || '').toLowerCase());
      } else if (sql.includes('WHERE id = $1')) {
        filtered = filtered.filter(u => u.id === params[0]);
      } else if (sql.includes("WHERE status = 'pending'")) {
        filtered = filtered.filter(u => u.status === 'pending');
      } else {
        if (params.length > 0) {
          params.forEach(p => {
            if (p === 'admin' || p === 'operator') filtered = filtered.filter(u => u.role === p);
            if (p === 'active' || p === 'pending' || p === 'inactive') filtered = filtered.filter(u => u.status === p);
          });
        }
      }
      return { rows: filtered };
    }

    // 2. INSERT into Users
    if (upper.startsWith('INSERT INTO USERS')) {
      const newUser = {
        id: `u-${Date.now()}`,
        name: params[0],
        username: params[1],
        password: params[2],
        phone: params[3] || null,
        role: params[4] || 'operator',
        status: params[5] || 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockData.users.push(newUser);
      return { rows: [newUser] };
    }

    // 3. UPDATE Users
    if (upper.startsWith('UPDATE USERS')) {
      if (sql.includes("status = 'active'")) {
        const id = params[0];
        const user = mockData.users.find(u => u.id === id);
        if (user) {
          user.status = 'active';
          user.updated_at = new Date().toISOString();
          return { rows: [user] };
        }
      }
      if (sql.includes('password = $1')) {
        const user = mockData.users.find(u => u.id === params[1]);
        if (user) {
          user.password = params[0];
          user.updated_at = new Date().toISOString();
          return { rows: [user] };
        }
      }
      if (sql.includes('name = $1')) {
        const user = mockData.users.find(u => u.id === params[params.length - 1]);
        if (user) {
          user.name = params[0];
          if (params[1]) user.phone = params[1];
          if (params[2]) user.role = params[2];
          if (params[3]) user.status = params[3];
          user.updated_at = new Date().toISOString();
          return { rows: [user] };
        }
      }
      return { rows: [] };
    }

    // 4. DELETE from Users
    if (upper.startsWith('DELETE FROM USERS')) {
      const id = params[0];
      const idx = mockData.users.findIndex(u => u.id === id);
      if (idx !== -1) {
        const removed = mockData.users.splice(idx, 1);
        return { rows: removed };
      }
      return { rows: [] };
    }

    // 5. Form types
    if (upper.startsWith('SELECT') && upper.includes('FROM FORM_TYPES')) {
      if (sql.includes('WHERE type_key = $1')) {
        return { rows: mockData.form_types.filter(ft => ft.type_key === params[0]) };
      }
      if (sql.includes('WHERE id = $1')) {
        return { rows: mockData.form_types.filter(ft => ft.id === params[0]) };
      }
      return { rows: mockData.form_types };
    }

    if (upper.startsWith('INSERT INTO FORM_TYPES')) {
      const newFt = {
        id: `ft-${Date.now()}`,
        name: params[0],
        code: params[1],
        type_key: params[2]
      };
      mockData.form_types.push(newFt);
      return { rows: [newFt] };
    }

    if (upper.startsWith('UPDATE FORM_TYPES')) {
      const id = params[params.length - 1];
      const ft = mockData.form_types.find(f => f.id === id);
      if (ft) {
        ft.name = params[0];
        ft.code = params[1];
        return { rows: [ft] };
      }
      return { rows: [] };
    }

    if (upper.startsWith('DELETE FROM FORM_TYPES')) {
      const id = params[0];
      const idx = mockData.form_types.findIndex(f => f.id === id);
      if (idx !== -1) {
        const removed = mockData.form_types.splice(idx, 1);
        return { rows: removed };
      }
      return { rows: [] };
    }

    // 6. Master Data Tables (vehicle_models, departments, work_locations, asset_statuses)
    const masterDataTables = ['vehicle_models', 'departments', 'work_locations', 'asset_statuses'];
    for (const tableName of masterDataTables) {
      if (upper.includes(`FROM ${tableName.toUpperCase()}`)) {
        if (upper.startsWith('SELECT')) {
          let filtered = [...mockData[tableName]];
          if (sql.includes('WHERE id = $1')) {
            filtered = filtered.filter(item => item.id === params[0]);
          }
          if (sql.includes('is_active = true')) {
            filtered = filtered.filter(item => item.is_active !== false);
          }
          return { rows: filtered };
        }

        if (upper.startsWith('INSERT')) {
          const newItem = {
            id: `${tableName.substring(0, 3)}-${Date.now()}`,
            name: params[0],
            ...(tableName === 'vehicle_models' && { category: params[1] }),
            ...(tableName === 'departments' && { code: params[1] }),
            ...(tableName === 'work_locations' && { location_type: params[1] }),
            ...(tableName === 'asset_statuses' && { color: params[1] }),
            is_active: true
          };
          mockData[tableName].push(newItem);
          return { rows: [newItem] };
        }

        if (upper.startsWith('UPDATE')) {
          const id = params[params.length - 1];
          const item = mockData[tableName].find(i => i.id === id);
          if (item) {
            item.name = params[0];
            if (tableName === 'vehicle_models') item.category = params[1];
            if (tableName === 'departments') item.code = params[1];
            if (tableName === 'work_locations') item.location_type = params[1];
            if (tableName === 'asset_statuses') item.color = params[1];
            return { rows: [item] };
          }
          return { rows: [] };
        }

        if (upper.startsWith('DELETE')) {
          const id = params[0];
          const idx = mockData[tableName].findIndex(i => i.id === id);
          if (idx !== -1) {
            const deleted = mockData[tableName].splice(idx, 1);
            return { rows: deleted };
          }
          return { rows: [] };
        }
      }
    }

    // 7. Vehicles
    if (upper.startsWith('SELECT') && upper.includes('FROM VEHICLES')) {
      let filtered = [...mockData.vehicles];
      
      // Handle JOIN query - check if it's requesting master data
      const hasJoin = upper.includes('LEFT JOIN') || upper.includes('JOIN');
      
      if (sql.includes('is_active = true') && !params.includes(false)) {
        filtered = filtered.filter(v => v.is_active);
      }
      if (sql.includes('WHERE id = $1')) {
        filtered = filtered.filter(v => v.id === params[0]);
      }
      if (params.length > 0) {
        const ftParam = params.find(p => ['dozer', 'lv_bus', 'vacum', 'tandem'].includes(p));
        if (ftParam) filtered = filtered.filter(v => v.form_type === ftParam);
      }
      
      // If JOIN query, enrich with master data
      if (hasJoin) {
        filtered = filtered.map(v => {
          const model = mockData.vehicle_models.find(m => m.id === v.vehicle_model_id);
          const dept = mockData.departments.find(d => d.id === v.department_id);
          const location = mockData.work_locations.find(l => l.id === v.default_location_id);
          const status = mockData.asset_statuses.find(s => s.id === v.default_asset_status_id);
          
          return {
            ...v,
            // Master data fields for JOIN
            model_id: model?.id || null,
            model_name: model?.name || null,
            model_category: model?.category || null,
            dept_id: dept?.id || null,
            dept_name: dept?.name || null,
            dept_code: dept?.code || null,
            location_id: location?.id || null,
            location_name: location?.name || null,
            location_type: location?.location_type || null,
            status_id: status?.id || null,
            status_name: status?.name || null,
            status_color: status?.color || null
          };
        });
      }
      
      return { rows: filtered };
    }

    if (upper.startsWith('INSERT INTO VEHICLES')) {
      const newV = {
        id: `v-${Date.now()}`,
        vehicle_number: params[0],
        vehicle_type: params[1],
        form_type: params[2],
        department: params[3],
        asset_bms_no: params[4],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockData.vehicles.push(newV);
      return { rows: [newV] };
    }

    if (upper.startsWith('UPDATE VEHICLES')) {
      const id = params[params.length - 1];
      const v = mockData.vehicles.find(item => item.id === id);
      if (v) {
        v.vehicle_number = params[0];
        v.vehicle_type = params[1];
        v.form_type = params[2];
        v.department = params[3];
        v.asset_bms_no = params[4];
        if (params[5] !== undefined) v.is_active = params[5];
        v.updated_at = new Date().toISOString();
        return { rows: [v] };
      }
      return { rows: [] };
    }

    if (upper.startsWith('DELETE FROM VEHICLES')) {
      const id = params[0];
      const idx = mockData.vehicles.findIndex(v => v.id === id);
      if (idx !== -1) {
        const del = mockData.vehicles.splice(idx, 1);
        return { rows: del };
      }
      return { rows: [] };
    }

    // 7. Checklist Categories & Items
    if (upper.startsWith('SELECT') && upper.includes('FROM CHECKLIST_CATEGORIES')) {
      if (upper.includes('COUNT(*)')) {
        const formTypeId = params[0];
        const count = mockData.checklist_categories.filter(c => c.form_type_id === formTypeId).length;
        return { rows: [{ count: count.toString() }] };
      }
      const formTypeId = params[0];
      const categories = mockData.checklist_categories
        .filter(c => c.form_type_id === formTypeId)
        .sort((a, b) => a.sort_order - b.sort_order);

      const enriched = categories.map(cat => {
        const items = mockData.checklist_items
          .filter(it => it.category_id === cat.id && it.is_active !== false)
          .sort((a, b) => a.sort_order - b.sort_order)
          .map(it => ({
            id: it.id,
            description: it.description,
            sort_order: it.sort_order,
            is_active: it.is_active
          }));
        return {
          ...cat,
          items
        };
      });
      return { rows: enriched };
    }

    if (upper.startsWith('INSERT INTO CHECKLIST_CATEGORIES')) {
      const newCat = {
        id: `cat-${Date.now()}`,
        form_type_id: params[0],
        name: params[1],
        sort_order: params[2] || (mockData.checklist_categories.length + 1)
      };
      mockData.checklist_categories.push(newCat);
      return { rows: [newCat] };
    }

    if (upper.startsWith('UPDATE CHECKLIST_CATEGORIES')) {
      const id = params[1];
      const cat = mockData.checklist_categories.find(c => c.id === id);
      if (cat) {
        cat.name = params[0];
        return { rows: [cat] };
      }
      return { rows: [] };
    }

    if (upper.startsWith('SELECT') && upper.includes('FROM CHECKLIST_ITEMS')) {
      let filtered = [...mockData.checklist_items];
      if (sql.includes('WHERE id = $1')) {
        filtered = filtered.filter(it => it.id === params[0]);
      } else if (sql.includes('WHERE category_id = $1')) {
        filtered = filtered.filter(it => it.category_id === params[0]);
        if (sql.includes('is_active = true')) {
          filtered = filtered.filter(it => it.is_active !== false);
        }
      }
      filtered.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      return { rows: filtered };
    }

    if (upper.startsWith('INSERT INTO CHECKLIST_ITEMS')) {
      const newItem = {
        id: `it-${Date.now()}`,
        category_id: params[0],
        description: params[1],
        sort_order: params[2] || (mockData.checklist_items.length + 1),
        is_active: true,
        created_at: new Date().toISOString()
      };
      mockData.checklist_items.push(newItem);
      return { rows: [newItem] };
    }

    if (upper.startsWith('UPDATE CHECKLIST_ITEMS')) {
      const id = params[params.length - 1];
      const it = mockData.checklist_items.find(i => i.id === id);
      if (it) {
        if (sql.includes('description = $1')) it.description = params[0];
        if (sql.includes('is_active = NOT is_active')) it.is_active = !it.is_active;
        if (sql.includes('sort_order = $1')) it.sort_order = params[0];
        return { rows: [it] };
      }
      return { rows: [] };
    }

    if (upper.startsWith('DELETE FROM CHECKLIST_ITEMS')) {
      const id = params[0];
      const idx = mockData.checklist_items.findIndex(i => i.id === id);
      if (idx !== -1) {
        const del = mockData.checklist_items.splice(idx, 1);
        return { rows: del };
      }
      return { rows: [] };
    }

    // 8. Inspections Queries
    if (upper.startsWith('SELECT') && upper.includes('FROM INSPECTIONS')) {
      // Single inspection detail
      if (sql.includes('WHERE i.id = $1') || sql.includes('WHERE id = $1')) {
        const id = params[0];
        const insp = mockData.inspections.find(i => i.id === id);
        if (!insp) return { rows: [] };

        const vehicle = mockData.vehicles.find(v => v.id === insp.vehicle_id) || {};
        const formType = mockData.form_types.find(ft => ft.id === insp.form_type_id) || {};
        const operator = mockData.users.find(u => u.id === insp.operator_id) || {};
        const ackUser = insp.acknowledged_by ? mockData.users.find(u => u.id === insp.acknowledged_by) : null;

        return {
          rows: [{
            ...insp,
            vehicle_number: vehicle.vehicle_number || insp.sn_engine,
            vehicle_type: vehicle.vehicle_type,
            form_name: formType.name,
            type_key: formType.type_key,
            form_code: formType.code,
            operator_name: operator.name || insp.operator_name,
            acknowledged_by_name: ackUser ? ackUser.name : null
          }]
        };
      }

      // Multiple inspections with join
      let list = mockData.inspections.map(insp => {
        const vehicle = mockData.vehicles.find(v => v.id === insp.vehicle_id) || {};
        const formType = mockData.form_types.find(ft => ft.id === insp.form_type_id) || {};
        const operator = mockData.users.find(u => u.id === insp.operator_id) || {};
        const brokenCount = mockData.inspection_results.filter(r => r.inspection_id === insp.id && r.condition === 'broken').length;
        return {
          ...insp,
          vehicle_number: vehicle.vehicle_number || insp.sn_engine,
          vehicle_type: vehicle.vehicle_type,
          form_name: formType.name,
          form_type_key: formType.type_key,
          operator_name: operator.name || insp.operator_name,
          broken_count: brokenCount
        };
      });

      // Filter for operator today-status
      if (sql.includes('WHERE operator_id = $1') && sql.includes('inspection_date = $2')) {
        const opId = params[0];
        const date = params[1];
        return { rows: list.filter(i => i.operator_id === opId && i.inspection_date === date && i.status === 'submitted') };
      }

      // Filter for operator inspections history
      if (sql.includes('WHERE i.operator_id = $1')) {
        return { rows: list.filter(i => i.operator_id === params[0]) };
      }

      return { rows: list };
    }

    // 9. Personal Documents & Results
    if (upper.startsWith('SELECT') && upper.includes('FROM PERSONAL_DOCUMENTS')) {
      const inspId = params[0];
      return { rows: mockData.personal_documents.filter(pd => pd.inspection_id === inspId) };
    }

    if (upper.startsWith('SELECT') && upper.includes('FROM INSPECTION_RESULTS')) {
      const inspId = params[0];
      const results = mockData.inspection_results.filter(ir => ir.inspection_id === inspId).map(ir => {
        const item = mockData.checklist_items.find(ci => ci.id === ir.checklist_item_id) || {};
        const cat = mockData.checklist_categories.find(cc => cc.id === item.category_id) || {};
        return {
          ...ir,
          description: item.description || 'Checklist Item',
          category_name: cat.name || 'General'
        };
      });
      return { rows: results };
    }

    // 10. INSERT Inspections
    if (upper.startsWith('INSERT INTO INSPECTIONS')) {
      const newInsp = {
        id: `insp-${Date.now()}`,
        form_type_id: params[0],
        vehicle_id: params[1],
        operator_id: params[2],
        shift: params[3],
        inspection_date: params[4],
        inspection_time: params[5],
        department: params[6],
        location: params[7],
        asset_status: params[8],
        km_reading_value: params[9],
        exp_pajak: params[10],
        exp_kiur: params[11],
        exp_coi: params[12],
        tahun_k3: params[13],
        running_hours: params[14],
        sn_engine: params[15],
        model: params[16],
        operator_name: params[17],
        status: 'submitted',
        acknowledged_by: null,
        acknowledged_at: null,
        problem_notes: null,
        submitted_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      mockData.inspections.unshift(newInsp);
      return { rows: [{ id: newInsp.id }] };
    }

    if (upper.startsWith('INSERT INTO PERSONAL_DOCUMENTS')) {
      const newDoc = {
        id: `pd-${Date.now()}-${Math.random()}`,
        inspection_id: params[0],
        doc_type: params[1],
        doc_number_1st: params[2],
        doc_number_2nd: params[3],
        expiry_date_1st: params[4],
        expiry_date_2nd: params[5]
      };
      mockData.personal_documents.push(newDoc);
      return { rows: [newDoc] };
    }

    if (upper.startsWith('INSERT INTO INSPECTION_RESULTS')) {
      const newRes = {
        id: `ir-${Date.now()}-${Math.random()}`,
        inspection_id: params[0],
        checklist_item_id: params[1],
        condition: params[2],
        notes: params[3]
      };
      mockData.inspection_results.push(newRes);
      return { rows: [newRes] };
    }

    // 11. UPDATE Inspections (Acknowledge)
    if (upper.startsWith('UPDATE INSPECTIONS') && sql.includes('acknowledged_by')) {
      const adminId = params[0];
      const inspId = params[1];
      const insp = mockData.inspections.find(i => i.id === inspId);
      if (insp) {
        insp.acknowledged_by = adminId;
        insp.acknowledged_at = new Date().toISOString();
        return { rows: [insp] };
      }
      return { rows: [] };
    }

    // 12. Notifications
    if (upper.startsWith('SELECT') && upper.includes('FROM NOTIFICATIONS')) {
      return { rows: [...mockData.notifications].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) };
    }

    if (upper.startsWith('INSERT INTO NOTIFICATIONS')) {
      let newNotif;
      if (sql.includes("VALUES ('broken_item'")) {
        newNotif = {
          id: `notif-${Date.now()}`,
          type: 'broken_item',
          title: 'Item Rusak Dilaporkan',
          message: params[0],
          related_inspection_id: params[1] || null,
          related_user_id: null,
          is_read: false,
          created_at: new Date().toISOString()
        };
      } else {
        newNotif = {
          id: `notif-${Date.now()}`,
          type: params[0],
          title: params[1],
          message: params[2],
          related_inspection_id: params[3] || null,
          related_user_id: params[4] || null,
          is_read: false,
          created_at: new Date().toISOString()
        };
      }
      mockData.notifications.unshift(newNotif);
      return { rows: [newNotif] };
    }

    if (upper.startsWith('UPDATE NOTIFICATIONS')) {
      if (sql.includes('is_read = true WHERE id = $1')) {
        const notif = mockData.notifications.find(n => n.id === params[0]);
        if (notif) notif.is_read = true;
        return { rows: [notif || {}] };
      }
      if (sql.includes('is_read = true WHERE is_read = false') || sql.includes('SET is_read = true')) {
        mockData.notifications.forEach(n => n.is_read = true);
        return { rows: mockData.notifications };
      }
    }

    if (upper.startsWith('DELETE FROM NOTIFICATIONS')) {
      const userId = params[0];
      mockData.notifications = mockData.notifications.filter(n => n.related_user_id !== userId);
      return { rows: [] };
    }

    // =====================================================================
    // Master Data Queries
    // =====================================================================
    
    // Vehicle Models
    if (upper.startsWith('SELECT') && upper.includes('FROM VEHICLE_MODELS')) {
      let filtered = [...mockData.vehicle_models];
      if (sql.includes('is_active = true')) {
        filtered = filtered.filter(m => m.is_active);
      }
      if (sql.includes('WHERE id = $1')) {
        filtered = filtered.filter(m => m.id === params[0]);
      }
      return { rows: filtered };
    }

    if (upper.startsWith('INSERT INTO VEHICLE_MODELS')) {
      const newModel = {
        id: `mdl-${Date.now()}`,
        name: params[0],
        category: params[1] || null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockData.vehicle_models.push(newModel);
      return { rows: [newModel] };
    }

    if (upper.startsWith('UPDATE VEHICLE_MODELS')) {
      const id = params[params.length - 1];
      const model = mockData.vehicle_models.find(m => m.id === id);
      if (model) {
        model.name = params[0];
        if (params[1] !== undefined) model.category = params[1];
        model.updated_at = new Date().toISOString();
        return { rows: [model] };
      }
      return { rows: [] };
    }

    if (upper.startsWith('DELETE FROM VEHICLE_MODELS')) {
      const id = params[0];
      const idx = mockData.vehicle_models.findIndex(m => m.id === id);
      if (idx !== -1) {
        const deleted = mockData.vehicle_models.splice(idx, 1);
        return { rows: deleted };
      }
      return { rows: [] };
    }

    // Departments
    if (upper.startsWith('SELECT') && upper.includes('FROM DEPARTMENTS')) {
      let filtered = [...mockData.departments];
      if (sql.includes('is_active = true')) {
        filtered = filtered.filter(d => d.is_active);
      }
      if (sql.includes('WHERE id = $1')) {
        filtered = filtered.filter(d => d.id === params[0]);
      }
      return { rows: filtered };
    }

    if (upper.startsWith('INSERT INTO DEPARTMENTS')) {
      const newDept = {
        id: `dept-${Date.now()}`,
        name: params[0],
        code: params[1] || null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockData.departments.push(newDept);
      return { rows: [newDept] };
    }

    if (upper.startsWith('UPDATE DEPARTMENTS')) {
      const id = params[params.length - 1];
      const dept = mockData.departments.find(d => d.id === id);
      if (dept) {
        dept.name = params[0];
        if (params[1] !== undefined) dept.code = params[1];
        dept.updated_at = new Date().toISOString();
        return { rows: [dept] };
      }
      return { rows: [] };
    }

    if (upper.startsWith('DELETE FROM DEPARTMENTS')) {
      const id = params[0];
      const idx = mockData.departments.findIndex(d => d.id === id);
      if (idx !== -1) {
        const deleted = mockData.departments.splice(idx, 1);
        return { rows: deleted };
      }
      return { rows: [] };
    }

    // Work Locations
    if (upper.startsWith('SELECT') && upper.includes('FROM WORK_LOCATIONS')) {
      let filtered = [...mockData.work_locations];
      if (sql.includes('is_active = true')) {
        filtered = filtered.filter(l => l.is_active);
      }
      if (sql.includes('WHERE id = $1')) {
        filtered = filtered.filter(l => l.id === params[0]);
      }
      return { rows: filtered };
    }

    if (upper.startsWith('INSERT INTO WORK_LOCATIONS')) {
      const newLoc = {
        id: `loc-${Date.now()}`,
        name: params[0],
        location_type: params[1] || null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockData.work_locations.push(newLoc);
      return { rows: [newLoc] };
    }

    if (upper.startsWith('UPDATE WORK_LOCATIONS')) {
      const id = params[params.length - 1];
      const loc = mockData.work_locations.find(l => l.id === id);
      if (loc) {
        loc.name = params[0];
        if (params[1] !== undefined) loc.location_type = params[1];
        loc.updated_at = new Date().toISOString();
        return { rows: [loc] };
      }
      return { rows: [] };
    }

    if (upper.startsWith('DELETE FROM WORK_LOCATIONS')) {
      const id = params[0];
      const idx = mockData.work_locations.findIndex(l => l.id === id);
      if (idx !== -1) {
        const deleted = mockData.work_locations.splice(idx, 1);
        return { rows: deleted };
      }
      return { rows: [] };
    }

    // Asset Statuses
    if (upper.startsWith('SELECT') && upper.includes('FROM ASSET_STATUSES')) {
      let filtered = [...mockData.asset_statuses];
      if (sql.includes('is_active = true')) {
        filtered = filtered.filter(s => s.is_active);
      }
      if (sql.includes('WHERE id = $1')) {
        filtered = filtered.filter(s => s.id === params[0]);
      }
      return { rows: filtered };
    }

    if (upper.startsWith('INSERT INTO ASSET_STATUSES')) {
      const newStatus = {
        id: `status-${Date.now()}`,
        name: params[0],
        color: params[1] || 'gray',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockData.asset_statuses.push(newStatus);
      return { rows: [newStatus] };
    }

    if (upper.startsWith('UPDATE ASSET_STATUSES')) {
      const id = params[params.length - 1];
      const status = mockData.asset_statuses.find(s => s.id === id);
      if (status) {
        status.name = params[0];
        if (params[1] !== undefined) status.color = params[1];
        status.updated_at = new Date().toISOString();
        return { rows: [status] };
      }
      return { rows: [] };
    }

    if (upper.startsWith('DELETE FROM ASSET_STATUSES')) {
      const id = params[0];
      const idx = mockData.asset_statuses.findIndex(s => s.id === id);
      if (idx !== -1) {
        const deleted = mockData.asset_statuses.splice(idx, 1);
        return { rows: deleted };
      }
      return { rows: [] };
    }

    // Fallback default
    return { rows: [] };
  },

  async connect() {
    return {
      query: this.query.bind(this),
      release: () => {}
    };
  }
};

export default db;
// Named export alias so routes using `import pool from '../config/database.js'` work correctly
export { db as pool };
