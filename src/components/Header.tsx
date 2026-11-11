'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lock, Feather } from 'lucide-react';

interface HeaderProps {
  siteName?: string;
  isAdmin?: boolean;
}

export default function Header({ siteName = 'Journal', isAdmin = false }: HeaderProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Tulisan' },
    { href: '/media', label: 'Galeri' },
    { href: '/about', label: 'Tentang' },
  ];

  return (
    <header className="border-b border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-950/70 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Site Identity */}
        <Link
          href="/"
          className="group flex items-center gap-2 font-serif text-lg sm:text-xl font-medium tracking-tight text-stone-900 dark:text-stone-100 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
        >
          <Feather className="w-5 h-5 text-stone-700 dark:text-stone-300 group-hover:rotate-12 transition-transform" />
          <span>{siteName}</span>
        </Link>

        {/* Navigation and Admin Access */}
        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-5 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors py-1 ${
                    isActive
                      ? 'text-stone-900 dark:text-stone-100 border-b-2 border-stone-900 dark:border-stone-100 font-semibold'
                      : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Discreet Admin Button */}
          <Link
            href={isAdmin ? '/admin' : '/admin/login'}
            title={isAdmin ? 'Buka Dashboard Admin' : 'Login Administrator'}
            className="text-stone-400 hover:text-stone-700 dark:text-stone-600 dark:hover:text-stone-300 p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-all text-xs flex items-center gap-1"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="sr-only sm:not-sr-only text-[11px] opacity-70">
              {isAdmin ? 'Admin' : 'Masuk'}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}

