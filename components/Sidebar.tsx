'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import clsx from 'clsx';
import { NAV_ITEMS } from './nav';

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 lg:w-72 shrink-0 h-screen sticky top-0 bg-white border-r border-black/5">
      {/* Brand */}
      <div className="px-6 pt-7 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-gradient flex items-center justify-center text-xl shadow-pop">
            🐾
          </div>
          <div className="leading-tight">
            <p className="font-extrabold text-ink tracking-tight">Fin &amp; Paws</p>
            <p className="text-xs text-muted">Inventory</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-gradient text-white shadow-pop'
                  : 'text-muted hover:bg-brand-50 hover:text-brand-700'
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.4 : 1.9} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-black/5">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 rounded-full bg-coral-gradient text-white flex items-center justify-center text-sm font-bold shrink-0">
            {session?.user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink truncate">{session?.user?.name ?? 'User'}</p>
            <p className="text-xs text-muted truncate">{session?.user?.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-2 rounded-xl text-muted hover:bg-coral-50 hover:text-coral-600 transition-colors"
            title="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
