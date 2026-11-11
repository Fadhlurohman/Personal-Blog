# Personal Blog & Digital Journal

Ruang digital pribadi yang sederhana, minimalis, ringan, responsif, aman, dan siap dipublikasikan secara online. Dibuat untuk berbagi pemikiran, tulisan, cerita, foto, dan video tanpa kompleksitas platform media sosial.

Website ini menggunakan arsitektur modern Next.js App Router dengan integrasi penuh Supabase (PostgreSQL, Authentication, dan Storage), serta siap dideploy ke Vercel dengan biaya operasional Rp0 (100% Free Tier).

---

## 🌟 Fitur Utama

### 1. Website Publik (Tanpa Login untuk Pengunjung)
- **Beranda (`/`)**: Layout satu kolom minimalis dengan tipografi nyaman dibaca, menampilkan daftar tulisan kronologis dari terbaru ke terlama, cuplikan media, caption, dan jumlah komentar.
- **Galeri Media (`/media`)**: Grid visual interaktif untuk seluruh foto dan video yang diunggah, filter kategori (Semua, Foto, Video), pemutar video inline, dan *lightbox modal* untuk melihat foto resolusi penuh.
- **Tentang Penulis (`/about`)**: Halaman profil pemilik blog berisi foto avatar, nama, biografi naratif, dan tautan jejaring sosial.
- **Detail Tulisan (`/post/[slug]`)**: Membaca artikel lengkap dengan dukungan multi-media, caption, dan sistem diskusi komentar.

### 2. Sistem Komentar Aman Berbasis Token Kepemilikan (Cookie HttpOnly)
- Pengunjung **tidak perlu mendaftar atau membuat akun**.
- Nama bersifat opsional (otomatis berlabel *"Anonymous"* jika dikosongkan).
- Komentar langsung terbit seketika tanpa antrean moderasi yang menghambat.
- **Mekanisme Penghapusan Mandiri Aman**:
  1. Saat pengunjung mengirim komentar, server membuat token kriptografi acak (32 bytes).
  2. Hash SHA-256 disimpan di database pada kolom `owner_token_hash`.
  3. Token asli disimpan aman di browser melalui cookie `HttpOnly`, `SameSite=Lax`, dan `Secure`.
  4. Pengunjung dapat menghapus komentar miliknya sendiri selama cookie valid.
  5. Pengunjung **tidak dapat** menghapus komentar orang lain secara arbitrer.
- **Proteksi Anti-Spam & Keamanan**:
  - Validasi panjang input di sisi server (1 s.d. 1000 karakter).
  - Sanitasi pencegahan serangan XSS.
  - *Rate-limiting* (cooldown jeda antar komentar).
  - *Honeypot protection* tersembunyi untuk menangkal bot otomatis.

### 3. Dashboard Administrator (`/admin`)
- **Login Terpusat (`/admin/login`)**: Tombol login diakses melalui ikon gembok kecil di kanan atas header. Terproteksi penuh di server melalui Next.js Middleware dan Supabase Auth.
- **Ringkasan (`/admin`)**: Statistik ringkas (Total Postingan, Diterbitkan, Draft, Total Komentar) dan daftar postingan terbaru.
- **Kelola Postingan (`/admin/posts`)**: Daftar seluruh artikel, fitur pencarian, filter status (Published vs Draft), dan tombol hapus permanen.
- **Editor Postingan (`/admin/posts/new` & `/admin/posts/edit/[id]`)**:
  - Editor teks minimalis dan nyaman.
  - Generate slug URL otomatis dari judul artikel.
  - Unggah foto dan video langsung ke Supabase Storage dengan **pratinjau (preview) seketika sebelum diterbitkan**.
  - Keterangan (caption) per item media.
  - Pengaturan tanggal publikasi dan toggle izin komentar per artikel.
- **Kelola Komentar (`/admin/comments`)**: Memantau seluruh komentar, menyembunyikan (*hide*) komentar dari publik tanpa menghapusnya, atau menghapus komentar siapa pun secara permanen.
- **Pengaturan Website (`/admin/settings`)**: Mengubah judul blog, slogan, foto profil pemilik, bio, dan tautan sosial (GitHub, Twitter/X, Instagram, LinkedIn, Email).

---

## 🛠️ Teknologi yang Digunakan

| Komponen | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | Server-Side Rendering (SSR) & Server Actions |
| **Bahasa** | TypeScript | Type-safety penuh pada seluruh lapisan |
| **Styling** | Tailwind CSS v4 | Desain minimalis elegan, responsif & dark mode support |
| **Database** | Supabase PostgreSQL | Relational DB dengan Row Level Security (RLS) |
| **Authentication** | Supabase Auth | Autentikasi sesi aman untuk Administrator tunggal |
| **Storage** | Supabase Storage | Bucket `media` publik untuk foto & video |
| **Ikon** | Lucide Icons | Desain ikon bersih dan modern |
| **Hosting** | Vercel | Deployment gratis, CDN global & fast edge caching |

---

## 📁 Struktur Folder Proyek

```text
personal-blog/
├── public/                      # Aset statis favicon dan gambar
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout (HTML, font, metadata)
│   │   ├── globals.css          # Tema warna, Tailwind v4, tipografi
│   │   ├── page.tsx             # Halaman Beranda Publik (/)
│   │   ├── media/
│   │   │   └── page.tsx         # Galeri Foto & Video (/media)
│   │   ├── about/
│   │   │   └── page.tsx         # Profil Pemilik Blog (/about)
│   │   ├── post/
│   │   │   └── [slug]/
│   │   │       └── page.tsx     # Detail Artikel & Komentar (/post/[slug])
│   │   ├── admin/
│   │   │   ├── layout.tsx       # Shell layout dashboard admin
│   │   │   ├── page.tsx         # Ringkasan statistik (/admin)
│   │   │   ├── login/
│   │   │   │   └── page.tsx     # Form login administrator (/admin/login)
│   │   │   ├── posts/
│   │   │   │   ├── page.tsx     # Daftar postingan (/admin/posts)
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx # Buat postingan baru (/admin/posts/new)
│   │   │   │   └── edit/[id]/
│   │   │   │       └── page.tsx # Edit postingan (/admin/posts/edit/[id])
│   │   │   ├── comments/
│   │   │   │   └── page.tsx     # Moderasi komentar (/admin/comments)
│   │   │   └── settings/
│   │   │       └── page.tsx     # Pengaturan website (/admin/settings)
│   │   └── api/
│   │       ├── auth/logout/     # Handler logout administrator
│   │       ├── comments/        # API create & secure delete comment
│   │       ├── media/upload/    # API upload media ke Supabase Storage
│   │       ├── posts/           # API CRUD postingan
│   │       └── settings/        # API pembaruan identitas & profil
│   ├── components/              # Komponen modular UI (Header, PostCard, Editor, dll)
│   ├── lib/
│   │   ├── services/            # Layer query DB (posts, comments, media, settings)
│   │   ├── supabase/            # Client Supabase (client, server, admin, middleware)
│   │   └── utils/               # Format tanggal, slugify, token crypto cookies
│   ├── middleware.ts            # Proteksi rute admin di tingkat edge
│   └── types/
│       └── database.ts          # Definisi interface TypeScript data model
├── supabase/
│   ├── migrations/
│   │   └── 01_initial_schema.sql # Schema lengkap, indexes, trigger & RLS
│   └── seed.sql                 # Data awal default (site settings & post perdana)
├── .env.example                 # Template environment variables
├── package.json
└── README.md
```

---

## 🚀 Panduan Setup & Instalasi Lokal

### 1. Kloning / Buka Direktori
Pastikan Anda berada di direktori project:
```bash
cd c:\Fadhlurohman\personal-blog
```

### 2. Salin Konfigurasi Environment
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```

---

## 🗄️ Panduan Konfigurasi Supabase (Free Tier)

Ikuti langkah mudah berikut untuk menyiapkan backend Supabase Anda:

1. **Buat Akun & Proyek Baru**:
   - Buka [supabase.com](https://supabase.com) dan masuk atau daftar (Gratis).
   - Klik **New Project**, tentukan nama proyek (misal: `personal-blog`) dan kata sandi database Anda.
   - Pilih region server terdekat (misal: *Singapore* untuk pengguna di Indonesia).

2. **Jalankan SQL Migration**:
   - Di dashboard Supabase, buka menu **SQL Editor** di bilah kiri.
   - Buka file `supabase/migrations/01_initial_schema.sql` dari project ini, salin seluruh kodenya, dan tempel ke SQL Editor Supabase.
   - Klik tombol **Run**. Seluruh tabel (`profiles`, `posts`, `media`, `comments`, `site_settings`), indeks, kebijakan RLS, bucket storage `media`, dan trigger otomatis akan terbentuk seketika.
   - Buka file `supabase/seed.sql`, tempel ke SQL Editor, dan klik **Run** untuk memasukkan pengaturan awal dan artikel selamat datang.

3. **Buat Akun Administrator**:
   - Di dashboard Supabase, buka menu **Authentication** > **Users**.
   - Klik **Add User** > **Create User**.
   - Masukkan email administrator Anda (misal: `admin@domainanda.com`) dan kata sandi yang kuat.
   - Akun ini akan langsung otomatis memiliki profil di tabel `profiles` berkat trigger database yang telah kita pasang.

4. **Ambil Kredensial API**:
   - Buka menu **Project Settings** (ikon gerigi) > **API**.
   - Salin nilai berikut ke file `.env.local` Anda:
     - **Project URL** ➡️ Masukkan ke `NEXT_PUBLIC_SUPABASE_URL`
     - **anon / public key** ➡️ Masukkan ke `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - **service_role key** (klik *Reveal*) ➡️ Masukkan ke `SUPABASE_SERVICE_ROLE_KEY`

5. **Jalankan Aplikasi di Komputer Anda**:
   ```bash
   npm run dev
   ```
   Buka `http://localhost:3000` di browser Anda!

---

## 🌐 Panduan Deployment ke Vercel (Gratis)

1. **Push Proyek ke GitHub**:
   Inisialisasi git dan unggah repository ke akun GitHub Anda:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit personal blog & digital journal"
   git branch -M main
   git remote add origin https://github.com/username/personal-blog.git
   git push -u origin main
   ```

2. **Deploy di Vercel**:
   - Buka [vercel.com](https://vercel.com) dan masuk menggunakan akun GitHub Anda.
   - Klik **Add New...** > **Project**.
   - Pilih repository `personal-blog` Anda dan klik **Import**.
   - Pada bagian **Environment Variables**, tambahkan 3 variabel dari Supabase Anda:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
   - Klik tombol **Deploy**. Vercel akan otomatis meng-compile dan mempublikasikan website Anda dalam waktu kurang dari 2 menit.

3. **Menghubungkan Custom Domain (Opsional)**:
   - Jika Anda memiliki domain sendiri (misal: `namapribadi.com`), buka dashboard proyek di Vercel > **Settings** > **Domains**.
   - Masukkan nama domain Anda dan ikuti panduan penambahan DNS Record (A Record / CNAME).

---

## 🔒 Keamanan dan Privasi

- **Row Level Security (RLS)**: Publik hanya dapat membaca postingan bertatus `published`. Seluruh operasi manipulasi data postingan dan media wajib melalui otorisasi JWT administrator.
- **Server-Side Secret Hash Verification**: Token kepemilikan komentar tidak pernah disimpan dalam teks biasa di database maupun terekspos ke kode JavaScript publik. Hashing SHA-256 dan verifikasi *constant-time safe equal* mencegah manipulasi penghapusan dan *timing attacks*.
- **Admin Session Guard**: Seluruh rute `/admin/*` diperiksa langsung di level server dan middleware. Akses tanpa otentikasi otomatis diarahkan ke halaman login.
