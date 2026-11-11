# Personal Blog & Digital Journal

Website personal blog dan jurnal digital minimalis, ringan, responsif, dan aman untuk membagikan tulisan, pemikiran, cerita, foto, dan video pribadi.

## 🚀 Fitur Utama

- **Area Publik**: Beranda tulisan kronologis (`/`), galeri foto & video (`/media`), profil tentang penulis (`/about`), dan detail tulisan lengkap (`/post/[slug]`).
- **Sistem Komentar Aman**: Pengunjung dapat berkomentar tanpa login, dengan token kepemilikan terenkripsi (HttpOnly cookie) sehingga pengunjung hanya dapat menghapus komentarnya sendiri.
- **Admin Dashboard (`/admin`)**: Manajemen artikel (draft/published), unggah media foto & video ke cloud storage, moderasi komentar, dan pengaturan profil/sosial media.

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router, TypeScript)
- **Styling**: Tailwind CSS v4
- **Database & Auth**: Supabase PostgreSQL & Supabase Auth
- **File Storage**: Supabase Storage
- **Deployment**: Vercel

## ⚙️ Environment Variables

Buat file `.env.local` dengan konfigurasi berikut:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 💻 Menjalankan di Lokal

```bash
# Install dependensi
npm install

# Jalankan server pengembangan
npm run dev

# Build untuk production
npm run build
```
