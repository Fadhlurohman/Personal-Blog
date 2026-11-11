'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  Check,
  AlertCircle,
  CheckCircle,
  User,
  Globe,
  Share2,
} from 'lucide-react';
import type { SiteSettings, Profile } from '@/types/database';

interface AdminSettingsFormProps {
  initialSettings: SiteSettings;
  initialProfile: Profile;
}

export default function AdminSettingsForm({
  initialSettings,
  initialProfile,
}: AdminSettingsFormProps) {
  const router = useRouter();

  // Site settings
  const [siteName, setSiteName] = useState(initialSettings.site_name || '');
  const [siteDescription, setSiteDescription] = useState(
    initialSettings.site_description || ''
  );

  // Social links
  const [github, setGithub] = useState(initialSettings.social_links?.github || '');
  const [twitter, setTwitter] = useState(initialSettings.social_links?.twitter || '');
  const [instagram, setInstagram] = useState(initialSettings.social_links?.instagram || '');
  const [linkedin, setLinkedin] = useState(initialSettings.social_links?.linkedin || '');
  const [email, setEmail] = useState(initialSettings.social_links?.email || '');

  // Profile
  const [displayName, setDisplayName] = useState(initialProfile.display_name || '');
  const [bio, setBio] = useState(initialProfile.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatar_url || '');

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Avatar upload handler
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengunggah foto profil.');

      setAvatarUrl(data.url);
      setFeedback({ type: 'success', text: 'Foto profil berhasil diunggah! Jangan lupa simpan perubahan.' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Gagal mengunggah avatar.' });
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const payload = {
        site_name: siteName.trim(),
        site_description: siteDescription.trim(),
        social_links: {
          github: github.trim(),
          twitter: twitter.trim(),
          instagram: instagram.trim(),
          linkedin: linkedin.trim(),
          email: email.trim(),
        },
        display_name: displayName.trim(),
        bio: bio.trim(),
        avatar_url: avatarUrl.trim(),
      };

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memperbarui pengaturan.');

      setFeedback({ type: 'success', text: 'Pengaturan website berhasil disimpan!' });
      router.refresh();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Terjadi kesalahan' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
          Pengaturan Website
        </h1>
        <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm mt-1">
          Sesuaikan identitas blog, profil pemilik, dan tautan jejaring sosial.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-lg text-xs flex items-center gap-2 ${
            feedback.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          {feedback.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Identitas Blog */}
      <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-stone-100 dark:border-stone-800">
          <Globe className="w-4 h-4 text-stone-600 dark:text-stone-400" />
          <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            Identitas Blog & Journal
          </h2>
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
            Nama Website / Judul Blog
          </label>
          <input
            type="text"
            required
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
            Deskripsi Singkat (Slogan / Subjudul)
          </label>
          <textarea
            rows={2}
            value={siteDescription}
            onChange={(e) => setSiteDescription(e.target.value)}
            className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none resize-none"
          />
        </div>
      </div>

      {/* Profil Penulis & Halaman About */}
      <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-stone-100 dark:border-stone-800">
          <User className="w-4 h-4 text-stone-600 dark:text-stone-400" />
          <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            Profil Pemilik (Halaman Tentang / About)
          </h2>
        </div>

        {/* Avatar Upload */}
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Foto Profil"
              className="w-16 h-16 rounded-full object-cover border border-stone-200 dark:border-stone-800"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400">
              <User className="w-8 h-8" />
            </div>
          )}

          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 transition">
            <UploadCloud className="w-3.5 h-3.5 text-stone-500" />
            <span>{uploadingAvatar ? 'Mengunggah...' : 'Unggah Foto Baru'}</span>
            <input
              type="file"
              accept="image/*"
              disabled={uploadingAvatar}
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </label>
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
            Nama Pemilik / Penulis
          </label>
          <input
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
            Biografi / Narasi Tentang Pemilik (Tampil di /about)
          </label>
          <textarea
            rows={5}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tuliskan cerita singkat tentang latar belakang, minat, atau filosofi Anda..."
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none resize-y"
          />
        </div>
      </div>

      {/* Tautan Sosial */}
      <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-stone-100 dark:border-stone-800">
          <Share2 className="w-4 h-4 text-stone-600 dark:text-stone-400" />
          <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            Tautan Media Sosial & Kontak
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
              GitHub URL
            </label>
            <input
              type="url"
              placeholder="https://github.com/username"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
              Twitter / X URL
            </label>
            <input
              type="url"
              placeholder="https://x.com/username"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
              Instagram URL
            </label>
            <input
              type="url"
              placeholder="https://instagram.com/username"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
              LinkedIn URL
            </label>
            <input
              type="url"
              placeholder="https://linkedin.com/in/username"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
              Email Kontak Publik
            </label>
            <input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold rounded-lg bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 transition disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          <span>{saving ? 'Menyimpan...' : 'Simpan Semua Pengaturan'}</span>
        </button>
      </div>
    </form>
  );
}

