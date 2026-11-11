import PublicLayout from '@/components/PublicLayout';
import { getProfile, getSiteSettings, DEFAULT_PROFILE, DEFAULT_SETTINGS } from '@/lib/services/settings';
import { GithubIcon, TwitterIcon, InstagramIcon, LinkedinIcon, MailIcon } from '@/components/SocialIcons';
import { User } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tentang Penulis',
  description: 'Profil dan cerita singkat tentang pemilik blog dan jurnal digital ini.',
};

export default async function AboutPage() {
  let profile = DEFAULT_PROFILE;
  let settings = DEFAULT_SETTINGS;

  try {
    const [profileRes, settingsRes] = await Promise.all([getProfile(), getSiteSettings()]);
    profile = profileRes;
    settings = settingsRes;
  } catch (err: any) {
    if (err?.digest?.startsWith?.('DYNAMIC_SERVER_USAGE')) throw err;
    console.error('Error fetching about page data:', err);
  }

  const social = settings.social_links || {};

  return (
    <PublicLayout>
      <div className="py-6 sm:py-8 max-w-2xl">
        {/* Profile Card / Intro */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10 pb-8 border-b border-stone-200 dark:border-stone-800">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-stone-200 dark:border-stone-800 shadow-sm"
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-stone-400">
              <User className="w-12 h-12" />
            </div>
          )}

          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 mb-1.5">
              {profile.display_name}
            </h1>
            <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm font-mono mb-4">
              Penulis & Pemilik {settings.site_name}
            </p>

            {/* Social Links */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              {social.github && (
                <a
                  href={social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                </a>
              )}
              {social.twitter && (
                <a
                  href={social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                >
                  <TwitterIcon className="w-3.5 h-3.5" />
                  <span>Twitter / X</span>
                </a>
              )}
              {social.instagram && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                >
                  <InstagramIcon className="w-3.5 h-3.5" />
                  <span>Instagram</span>
                </a>
              )}
              {social.linkedin && (
                <a
                  href={social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                >
                  <LinkedinIcon className="w-3.5 h-3.5" />
                  <span>LinkedIn</span>
                </a>
              )}
              {social.email && (
                <a
                  href={`mailto:${social.email}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                >
                  <MailIcon className="w-3.5 h-3.5" />
                  <span>Email</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bio Content */}
        <section className="space-y-6 text-stone-700 dark:text-stone-300 text-sm sm:text-base leading-relaxed">
          <div className="prose prose-stone dark:prose-invert max-w-none whitespace-pre-line">
            {profile.bio || (
              <p>
                Selamat datang di blog pribadi saya. Tempat ini didedikasikan untuk mendokumentasikan
                pembelajaran, refleksi, gagasan, dan momen-momen penting dalam hidup.
              </p>
            )}
          </div>

          <div className="pt-6 border-t border-stone-200 dark:border-stone-800 text-xs text-stone-500">
            <p>
              Seluruh konten tulisan, foto, dan video di situs ini dibuat dan dikurasi secara mandiri.
              Terima kasih telah berkunjung dan membaca.
            </p>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
