import { getSiteSettings, getProfile } from '@/lib/services/settings';
import AdminSettingsForm from '@/components/AdminSettingsForm';

export default async function AdminSettingsPage() {
  const [settings, profile] = await Promise.all([getSiteSettings(), getProfile()]);

  return <AdminSettingsForm initialSettings={settings} initialProfile={profile} />;
}

