'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { NAV_ITEMS } from './nav';

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-white/90 backdrop-blur border-t border-black/5 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-stretch h-16 max-w-lg mx-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className="relative flex-1 flex flex-col items-center justify-center gap-1"
            >
              {active && (
                <span className="absolute top-0 h-1 w-8 rounded-full bg-brand-500" />
              )}
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 1.8}
                className={clsx('transition-colors', active ? 'text-brand-600' : 'text-muted')}
              />
              <span className={clsx('text-[10px] font-medium', active ? 'text-brand-600' : 'text-muted')}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
