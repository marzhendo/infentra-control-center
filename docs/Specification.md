# Specification Document: infentra-workspace

## 1. Project Overview
**infentra-workspace** adalah platform internal berbasis web yang dirancang khusus untuk pengelolaan operasional, pelacakan jobdesk, dan pemantauan progress real-time acara **INFENTRA 2.0 (Informatics Event & Karya)** di bawah Himpunan Mahasiswa Teknik Informatika (HMIF).

* **Target User:** Ketua Pelaksana (Ketuplak), BPH (Sekretaris & Bendahara), Koordinator Divisi (10 Divisi), dan PIC.
* **Core Value:** Menggantikan spreadsheet manual dengan dashboard terintegrasi, transparan, dan real-time.

---

## 2. Tech Stack & Architecture
* **Framework:** Next.js (App Router) / React
* **Styling & UI:** Tailwind CSS + Shadcn UI
* **Database & Auth:** Supabase (PostgreSQL + Realtime Subscriptions + Row Level Security)
* **Icons:** Lucide React
* **Deployment:** Vercel

---

## 3. Data Structure & Schema
### A. `divisions`
* `id` (UUID, Primary Key)
* `name` (Text) — *e.g., "ACARA", "PDD", "IT TEAM"*
* `target_progress` (Float)

### B. `tasks`
* `id` (UUID, Primary Key)
* `division_id` (UUID, Foreign Key -> divisions.id)
* `title` (Text)
* `pic` (Text) — Nama staf panitia
* `deadline` (Date)
* `status` (Enum: 'Not Started', 'In Progress', 'Waiting Review', 'Done', 'Overdue')
* `progress` (Integer: 0 - 100)
* `link_attachment` (Text, Optional)
* `created_at` (Timestamp)

### C. `timeline_events`
* `id` (UUID, Primary Key)
* `event_name` (Text)
* `date` (Date)
* `category` (Enum: 'Milestone', 'Oprec', 'Event Day', 'Internal')
* `description` (Text)

---

## 4. Core Features & User Requirements
1. **Executive Dashboard (`/`):**
   * Overview persentase progress global INFENTRA 2.0.
   * Ringkasan statistik task (Total, Done, In Progress, Overdue).
   * Visualisasi progress per 10 divisi dalam bentuk progress bar.
   * Quick Action: Approval "Acc Done" oleh Ketuplak/Koor.
2. **Division Workspace (`/division/[slug]`):**
   * Interactive Task Table untuk 10 divisi.
   * Fitur Filter berdasarkan Status dan Pencarian Kata Kunci.
   * Modal Form: Add Task, Edit Progress, Update Status.
3. **Master Timeline (`/timeline`):**
   * Calendar Grid View (Agustus - Desember 2026).
   * Activity List View dengan penanda warna (*color-coded*).
4. **Realtime Sync:**
   * Setiap perubahan status/progress oleh Koordinator langsung ter-update di Dashboard Ketuplak tanpa refresh halaman.

---

## 5. Development Roadmap (SDD Phases)
* [ ] **Phase 1: Project Setup & Schema Migration** (Next.js, Tailwind, Supabase Config).
* [ ] **Phase 2: Authentication & Layout Component** (Sidebar, Header, Theme Provider).
* [ ] **Phase 3: Division Task Management Engine** (CRUD Tasks, Status Mutation, Realtime Listener).
* [ ] **Phase 4: Executive Dashboard & Analytics** (Global Calculation, Aggregated Progress Bar).
* [ ] **Phase 5: Master Timeline View** (Calendar Grid & Activity List).
* [ ] **Phase 6: QA, Polish & Vercel Deployment**.