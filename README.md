<div align="center">

# ⛽ NUSAFUEL GRID
### Automated Fuel Infrastructure & Intelligent Cross-Station Logistics Orchestrator
**Karya Inovasi Web Development Competition — UINIC 8.0**  
*Subtema: Lingkungan & Kecerdasan Buatan (AI) / Smart Public Digital Ecosystems*  
*Wilayah Implementasi Pilot: Kabupaten Buleleng, Provinsi Bali*

[![Vite](https://img.shields.io/badge/Vite-8.3.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Neon PostgreSQL](https://img.shields.io/badge/Neon_PostgreSQL-Serverless-00E599?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)

</div>

---

## 📌 1. Latar Belakang & Urgensi Masalah

Krisis antrean BBM bersubsidi (Pertalite dan BioSolar) di wilayah Singaraja dan Kabupaten Buleleng, Bali, kerap menimbulkan dampak sistemik:
1. **Emisi Karbon Sia-sia (*Idling Emission*):** Ratusan kendaraan bermotor mengantre 45–90 menit dengan mesin menyala, menyumbang rata-rata 3,4 ton CO₂ terbuang setiap minggunya di simpul kota Singaraja.
2. **Kepanikan Warga (*Panic Buying*):** Ketidaktahuan masyarakat mengenai ketersediaan stok riil di tangki SPBU memicu serbuan serentak ke satu titik stasiun.
3. **Praktik Penimbunan (*Ngangsu* Lintas-SPBU):** Oknum memodifikasi tangki kendaraan dan berpindah dari satu SPBU ke SPBU lain dalam hitungan jam tanpa adanya sistem verifikasi terpusat lintas-stasiun.
4. **Keterlambatan Restock Depot:** Pemesanan tangki BBM ke Depot Pertamina Manggis (Karangasem) dilakukan secara manual setelah stok benar-benar habis, mengakibatkan *deadlock* operasional hingga 6 jam perjalanan melintasi jalur pegunungan Kintamani.

**NusaFuel Grid** hadir sebagai solusi komprehensif berparadigma *"Engineering Interconnected Web Solutions to Empower Digital Ecosystems"*, mengintegrasikan tiga pilar ekosistem: **Portal Warga (Driver PWA)**, **Terminal Operator SPBU**, dan **Orkestrator Logistik Depot Pertamina**.

---

## 🏛️ 2. Arsitektur Solusi & Interkoneksi Ekosistem

```mermaid
flowchart TD
    subgraph UserA ["User A: Portal Warga (Driver PWA)"]
        UA1[Input Plat Nomor & Paritas Ganjil-Genap] --> UA2{Lolos Anti-Ngangsu?}
        UA2 -- Ya --> UA3[Pilih SPBU & Batching Slot 30 Menit]
        UA3 --> UA4[Tiket QR Kriptografis SHA-256 Terbit]
        UA2 -- Tidak --> UA5[Blokir Otomatis: Batas 1x/Hari]
    end

    subgraph UserB ["User B: SPBU Operator & POS Cashier"]
        UB1[Scan QR Code Tiket Warga] --> UB2{Validasi Kriptografi}
        UB2 -- Sah --> UB3[Nozel Buka & Potong Kuota Liter]
        UB3 --> UB4[Sensor ATG Tangki Mendeteksi Level Stok]
        UB5[Dynamic Throttling: Kuota Mobil 20L ke 10L saat <30%]
        UB6[Emergency Reserve Lock: Kunci Sisa 10% untuk Ambulans/Damkar]
    end

    subgraph UserC ["User C: Dispatcher Depot Pertamina Manggis"]
        UC1[Sensor ATG SPBU < 20%] -->|Autonomous Webhook HTTP POST| UC2[Depot Orchestrator]
        UC2 --> UC3[Terbitkan DO Truk Tangki 8.000L]
        UC4[Dispatcher Ubah Status: IN_TRANSIT] --> UC5[Truk Tiba & Unloading K3 +8.000L]
        UC5 --> UB4
    end

    UA4 -.-> UB1
    UB4 -.->|Stok < 20%| UC1
    UserA --- AuditLog[(PostgreSQL Immutable Security Audit Trail)]
    UserB --- AuditLog
    UserC --- AuditLog
```

---

## ✨ 3. Fitur Utama & Logika Automasi

### A. User A — Portal Warga & Pengemudi (`/`)
- **Pengecekan Plat Nomor & Paritas Ganjil-Genap:** Mengurai plat nomor kendaraan (contoh: `DK 4821 FB` -> Angka terakhir `1` -> Paritas `GANJIL`). Jika tanggal hari ini genap, sistem secara pintar menawarkan *"Jadwal Plat Anda Besok — Booking Prioritas H+1"*.
- **Slot Time Batching (30 Menit):** Memecah kedatangan warga ke dalam jendela waktu (07:00–07:30, 07:30–08:00, dst.) untuk mereduksi antrean fisik dari 60 menit menjadi di bawah 8 menit.
- **Tiket QR Kriptografis SHA-256:** Tiket dilengkapi tanda tangan digital SHA-256 berbasis `plateNumber + slotId + timestamp + salt` yang anti-duplikasi dan dapat dicetak/disimpan secara instan.
- **Peta Geospasial Interaktif Leaflet:** Menampilkan 4 SPBU di Kabupaten Buleleng dengan koordinat akurat, status operasional real-time, dan estimasi waktu tempuh.
- **Kalkulator Dampak Hijau (Green Impact):** Metrik kalkulasi reduksi emisi CO₂ (kg) dan penghematan waktu tunggu warga secara riil.

### B. User B — Terminal Petugas SPBU (`/operator`)
- **Pemilihan 4 Stasiun Pilot Buleleng:**
  - `54.811.01` — SPBU Gajah Mada Singaraja
  - `54.811.02` — SPBU A. Yani Singaraja
  - `54.811.03` — SPBU Sukasada Singaraja
  - `54.811.04` — SPBU Banyuasri Singaraja
- **Saklar Kebijakan Cerdas (*Policy Switches*):**
  - *Automated Odd-Even Enforcement:* Mengaktifkan penegakan plat ganjil-genap.
  - *Dynamic Quota Throttling:* Memangkas kuota pengisian mobil dari 20L ke 10L secara dinamis saat stok tangki di bawah ambang batas (default: 30%) demi pemerataan suplai.
  - *10% Emergency Reserve Lock:* Mengunci 10% sisa dasar tangki untuk kendaraan darurat (Ambulans RSUD Buleleng, Mobil Damkar, BPBD).
- **Scanner Kasir 1-Tap & Verifikasi Plat:** Memvalidasi QR tiket dan seketika memotong stok tangki BBM.
- **Peringatan Anti-Penimbunan (*Anti-Hoarding Alert*):** Mendeteksi plat yang sudah mengisi di SPBU lain pada hari yang sama dan memblokir pengisian kedua.
- **Form Penerimaan DO & Timer K3 Unloading:** Memasukkan Delivery Order truk tangki dan mensimulasikan protokol K3 bongkar muat (penutupan nozel sementara selama 45 menit).

### C. User C — Interkoneksi Depot Pertamina & Panel Pengujian Juri (`/depot`)
- **Panel Pengujian Cepat 1-Klik Dewan Juri UINIC 8.0:**
  1. *[Simulasikan Rush Hour di SPBU Gajah Mada (-1.500L)]*: Kuras stok tangki di bawah 20% untuk memicu status `THROTTLED` dan menerbitkan webhook restock otomatis.
  2. *[Simulasikan Percobaan Penimbunan Lintas-SPBU]*: Mendaftarkan plat DK 9991 XX yang baru mengisi di SPBU A. Yani ke SPBU Gajah Mada untuk membuktikan blokir otomatis.
  3. *[Simulasikan Truk Tangki Tiba di SPBU Banyuasri]*: Menyelesaikan unloading Banyuasri (+8.000L) dan mengembalikan status ke `NORMAL`.
  4. *[Reset Seluruh Data ke Kondisi Awal (Seed)]*: Mengembalikan seluruh state ke titik mula.
- **Grafik Telemetri Recharts:** Membandingkan Stok Aktual, Kuota Terpesan (*Booked*), dan Cadangan Darurat (10%) di 4 SPBU Buleleng secara interaktif.
- **Live REST API & Webhook Payload Inspector:** Menampilkan format JSON request & response secara transparan saat terjadi pertukaran data antar-sistem.
- **Tabel Log Audit Keamanan Siber:** Mencatat setiap mutasi data lengkap dengan filter tingkat keparahan (`INFO`, `WARNING`, `CRITICAL`), aktor, dan ekspor JSON.

---

## 🗄️ 4. Skema Database Relasional PostgreSQL (Neon Serverless)

Koneksi database PostgreSQL Neon aktif dan terkonfigurasi di file `.env`:
```env
DATABASE_URL=postgresql://neor:npg_mcu3eeS@ep-rough-bonr.c-3.ap-southeast-1.aws.neon.tech/db?sslmode=require&channel_binding=require
```

### Tabel Relasional (DDL lengkap tersedia di `DATABASE_SCHEMA.sql`):
1. `spbu_stations`: Menyimpan profil stasiun, koordinat GPS, jumlah nozel, dan saklar kebijakan operasional.
2. `fuel_tanks`: Menyimpan inventori tangki bawah tanah (Pertalite, Pertamax, Solar), kapasitas maksimum, stok aktual, kuota terpesan, dan laju alir (burn rate).
3. `time_slots`: Mengatur kuota kapasitas per batch 30 menit per tanggal kalender.
4. `queue_tickets`: Menyimpan data tiket antrean, plat kendaraan, volume kuota, hash QR SHA-256, dan status penukaran.
5. `dispatch_orders`: Mengorkestrasi pesanan pengiriman truk tangki dari Depot Manggis lengkap dengan kode DO, status (`PENDING_DISPATCH`, `IN_TRANSIT`, `DELIVERED`), dan estimasi tiba (ETA).
6. `security_audit_logs`: Menyimpan catatan jejak audit keamanan siber (*immutable audit trail*) dengan tingkat keparahan `INFO`, `WARNING`, `CRITICAL`.

---

## 🌐 5. Spesifikasi REST API & Webhook Terintegrasi

| HTTP Method | Endpoint URL | Sumber Aktor | Fungsi Utama |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/queue/book-slot` | Driver PWA (Warga) | Mendaftarkan antrean slot waktu, memvalidasi ganjil-genap, mengunci kuota BBM. |
| `POST` | `/api/v1/cashier/verify-ticket` | POS Kasir SPBU | Memindai QR hash SHA-256, memotong stok tangki riil, mencatat audit event. |
| `POST` | `/api/v1/depot/dispatch` | Sensor Tangki ATG | Webhook otomatis restock 8.000L saat level tangki menyentuh &le;20%. |
| `PATCH` | `/api/v1/depot/dispatch/:id/status`| Dispatcher Depot | Memajukan status truk tangki (`PENDING` &rarr; `IN_TRANSIT` &rarr; `DELIVERED`). |
| `GET` | `/api/v1/stations/:code/telemetry` | Platform Regional | Mengambil data telemetri ATG, nozel aktif, dan cadangan darurat. |
| `GET` | `/api/v1/audit/logs` | Security & Compliance | Mengambil rekaman log audit keamanan siber dengan filter multi-kriteria. |

### Contoh Autonomous Restock Webhook Payload:
```json
{
  "event": "AUTO_RESTOCK_REQUEST",
  "timestamp": "2026-10-20T08:15:00.000Z",
  "spbuCode": "54.811.01",
  "spbuName": "SPBU 54.811.01 Gajah Mada Singaraja",
  "fuelType": "Pertalite",
  "triggerFillPercent": 18.2,
  "emergencyReserveLocked": true,
  "requestedVolumeLiters": 8000,
  "recommendedDepot": "Depot Pertamina Manggis, Karangasem"
}
```

---

## 📂 6. Struktur Direktori Proyek

Proyek dibangun dengan arsitektur modular yang memisahkan ranah logika otonom, modul per peran pengguna, dan komponen terdistribusi:

```
├── .env                          # Konfigurasi Environment & URL Neon DB
├── DATABASE_SCHEMA.sql           # DDL PostgreSQL lengkap (6 tabel relasional)
├── README.md                     # Dokumentasi resmi proyek UINIC 8.0
├── design.md                     # Panduan desain visual & aturan anti-slop
├── prd.md                        # Dokumen persyaratan produk (PRD)
├── package.json                  # Dependensi Vite, React 19, Recharts, Leaflet
└── src/
    ├── app/
    │   ├── App.tsx               # Root container & role-based view switcher
    │   ├── router.tsx            # Navigasi & rute modul
    │   └── store.tsx             # State manager reaktif & dispatch handler
    ├── core/
    │   ├── automation/
    │   │   ├── antiHoardingGuard.ts  # Filter penimbunan & validasi lintas-SPBU
    │   │   ├── oddEvenEngine.ts      # Logika paritas tanggal vs plat nomor
    │   │   ├── quotaCalculator.ts    # Throttling dinamis & kalkulasi ambang
    │   │   └── restockWebhook.ts     # Pemicu webhook otonom ke Depot Manggis
    │   ├── data/
    │   │   └── bulelengSpbuSeed.ts   # Data seed relasional 4 SPBU Buleleng
    │   └── security/
    │       └── inputSanitizer.ts     # Validasi regex plat & SHA-256 hash
    ├── modules/
    │   ├── public-driver/        # Modul User A: Portal Warga
    │   │   ├── components/
    │   │   │   ├── DigitalTicketQR.tsx
    │   │   │   ├── GreenImpactBanner.tsx
    │   │   │   ├── PlateCheckerCard.tsx
    │   │   │   ├── SpbuMapView.tsx
    │   │   │   ├── SpbuTankCard.tsx
    │   │   │   └── TimeSlotModal.tsx
    │   │   └── pages/
    │   │       └── DriverPortalPage.tsx
    │   ├── spbu-operator/        # Modul User B: Terminal Petugas SPBU
    │   │   ├── components/
    │   │   │   ├── CashierQrScanner.tsx
    │   │   │   ├── DoTankerForm.tsx
    │   │   │   ├── HoardingBlockAlert.tsx
    │   │   │   └── PolicySwitchesCard.tsx
    │   │   └── pages/
    │   │       └── SpbuDashboardPage.tsx
    │   └── depot-interconnect/   # Modul User C: Depot Pertamina & Pengujian Juri
    │       ├── components/
    │       │   ├── CrisisSimulatorPanel.tsx
    │       │   ├── RestApiPlayground.tsx
    │       │   ├── SecurityAuditTable.tsx
    │       │   └── WebhookDispatchTable.tsx
    │       └── pages/
    │           └── DepotSimulatorPage.tsx
    └── shared/                   # Komponen Bersama & Navigasi
        ├── components/
        │   ├── AccessibilityWidget.tsx
        │   ├── TankLevelGauge.tsx
        │   └── TopCommandNavbar.tsx
        └── styles/
            └── index.css         # Token desain visual & class brand strip
```

---

## 🎨 7. Kepatuhan Desain Visual (*Zero AI-Slop*)

Aplikasi dirancang secara ketat mengikuti panduan `design.md`:
- **Top Brand Strip (4px):** Membentang di paling atas layar dengan 4 warna kurasi:
  - Coral Red (`#FF5A5F`)
  - Warm Amber (`#FF9F1C`)
  - Deep Twilight Navy (`#18152E`)
  - Cyan Sky (`#00A8E8`)
- **Tipografi Profesional:** Menggunakan *Plus Jakarta Sans* untuk keterbacaan teks antarmuka dan *Barlow Condensed* untuk judul arsitektural yang berwibawa.
- **Monochrome Charcoal & Coral Highlight:** Tidak ada gradien ungu generik atau efek neon klise. Bagian simulator juri dibalut dalam *Coral-Red Highlight Banner* yang tegas dan kontras tinggi.
- **Aksesibilitas Universal:** Widget aksesibilitas di pojok bawah mendukung pengaturan ukuran font (100%, 115%, 125%) dan mode kontras tinggi (*High Contrast Mode*).

---

## 🚀 8. Panduan Menjalankan Proyek Secara Lokal

### Prasyarat:
- Node.js versi 18.x atau lebih baru
- npm versi 9.x atau lebih baru

### Langkah Instalasi:

1. **Clone Repositori:**
   ```bash
   git clone https://github.com/WanXdOffc/NusaFuel.git
   cd NusaFuel
   ```

2. **Instal Seluruh Dependensi:**
   ```bash
   npm install
   ```

3. **Jalankan Development Server:**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan secara lokal di: `http://localhost:5173/`

4. **Kompilasi Bundle Produksi & Validasi Tipe:**
   ```bash
   npm run build
   ```
   *Memastikan nol error TypeScript (`tsc -b`) dan nol error Vite bundler.*

---

## 🧪 9. Panduan Khusus Pengujian Dewan Juri UINIC 8.0

Dewan Juri dapat mengevaluasi seluruh kemampuan sistem dalam kurun waktu kurang dari 3 menit menggunakan fitur navigasi cepat:

1. **Beralih Peran dengan Cepat (*Judge Quick Role Switcher*):**
   - Klik pill switcher di pojok kanan atas navbar untuk berganti secara instan antara:
     - 🚗 **Portal Warga**
     - ⛽ **Petugas SPBU**
     - 🏢 **Depot & Simulator**

2. **Uji Validasi Paritas Hari Ini:**
   - Klik tombol **"Ganti Hari Ganjil/Genap"** di tengah navbar.
   - Perhatikan bagaimana Portal Warga seketika memperbarui status pengecekan plat ganjil vs genap tanpa me-reload browser.

3. **Uji Otomasi Otonom 1-Klik di Modul Depot:**
   - Buka tab **"Depot & Simulator"**.
   - Klik **"Simulasikan Rush Hour di SPBU Gajah Mada (-1.500L)"** &rarr; Perhatikan indikator tangki turun ke &le;20%, status berubah menjadi `THROTTLED`, dan pesanan restock otomatis terbit di tabel dispatch.
   - Klik **"Simulasikan Percobaan Penimbunan"** &rarr; Perhatikan bagaimana Anti-Hoarding Guard menolak plat DK 9991 XX dan mencatat event kritis ke log audit.
   - Klik **"Konfirmasi Tiba (+8.000L)"** di tabel dispatch untuk menyuplai kembali stok BBM.
   - Klik **"Reset Seluruh Data ke Kondisi Awal"** untuk memulai kembali pengujian.

---

<div align="center">

**Dikembangkan dengan integritas rekayasa perangkat lunak terbaik untuk Lomba Web Development UINIC 8.0.**  
*Solusi Nyata, Berkelanjutan, dan Siap Diimplementasikan untuk Buleleng Maju dan Indonesia Berkelanjutan.*

</div>
