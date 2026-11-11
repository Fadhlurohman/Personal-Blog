'use client';

import { usePathname } from 'next/navigation';
import AdminNav from '@/components/AdminNav';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center p-4">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col md:flex-row">
      <AdminNav />
      <main className="flex-1 p-6 sm:p-10 max-w-5xl overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

