'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  MessageSquare,
  Settings,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { useState } from 'react';

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  const navItems = [
    { href: '/admin', label: 'Ringkasan', icon: LayoutDashboard, exact: true },
    { href: '/admin/posts', label: 'Postingan', icon: FileText, exact: true },
    { href: '/admin/posts/new', label: 'Tulis Baru', icon: PlusCircle, exact: true },
    { href: '/admin/comments', label: 'Komentar', icon: MessageSquare, exact: false },
    { href: '/admin/settings', label: 'Pengaturan', icon: Settings, exact: false },
  ];

  return (
    <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30 p-4 sm:p-6 flex flex-col justify-between shrink-0">
      <div>
        <div className="flex items-center justify-between md:justify-start gap-2 mb-6 px-2">
          <span className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
            Admin Panel
          </span>
          <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
            v1.0
          </span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-8 pt-4 border-t border-stone-200 dark:border-stone-800 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            <span>Lihat Blog</span>
          </span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" />
          <span>{loggingOut ? 'Keluar...' : 'Keluar'}</span>
        </button>
      </div>
    </aside>
  );
}

