import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getSiteSettings } from '@/lib/services/settings';
import { createClient } from '@/lib/supabase/server';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default async function PublicLayout({ children }: PublicLayoutProps) {
  const settings = await getSiteSettings();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfbf9] dark:bg-[#0c0a09] text-stone-900 dark:text-stone-100 transition-colors selection:bg-stone-200 dark:selection:bg-stone-800">
      <Header siteName={settings.site_name} isAdmin={!!user} />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {children}
      </main>
      <Footer siteName={settings.site_name} socialLinks={settings.social_links} />
    </div>
  );
}

