# SKILLS.md - Agent Capabilities & Technical Workflows

## Skillset Overview
Agent dipandu untuk menjalankan prosedur teknis standar berikut selama proses pembangunan project `infentra-workspace`:

---

### Skill 1: `database_migration`
* **Trigger:** Ketika ada perubahan schema atau pembuatan tabel Supabase.
* **Workflow:**
  1. Buat file migration SQL di folder `/supabase/migrations`.
  2. Sertakan RLS (Row Level Security) kebijakan publik/authenticated read/write.
  3. Buat file TypeScript definition (`/types/database.ts`) yang selaras dengan schema SQL.

### Skill 2: `build_component`
* **Trigger:** Ketika diperintahkan membuat komponen UI baru.
* **Workflow:**
  1. Pastikan komponen menggunakan atomic structure (`/components/ui`, `/components/dashboard`, `/components/division`).
  2. Terapkan Tailwind classes yang responsif (mobile-first).
  3. Gunakan `Lucide React` untuk semua icon.
  4. Ekspor komponen secara named export.

### Skill 3: `setup_realtime`
* **Trigger:** Ketika mengimplementasikan fitur sinkronisasi data live.
* **Workflow:**
  1. Buat custom React Hook (misal: `useRealtimeTasks(divisionId)`).
  2. Inisialisasi channel Supabase `postgres_changes` pada tabel `tasks`.
  3. Pastikan ada cleanup function `supabase.removeChannel()` saat unmount untuk mencegah memory leak.

### Skill 4: `progress_calculator`
* **Trigger:** Saat mengkalkulasi progress divisi atau statistik global.
* **Workflow:**
  1. `Division Progress` = Rata-rata dari `task.progress` seluruh task di divisi tersebut.
  2. `Global Progress` = Rata-rata dari seluruh `Division Progress`.
  3. Status `Overdue` secara otomatis terpicu jika `current_date > deadline` DAN `status != 'Done'`.