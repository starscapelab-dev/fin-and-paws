'use client';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import { Package, AlertTriangle, TrendingUp, ShoppingCart, LogOut, Plus, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

export default function Dashboard() {
  const { data: session } = useSession();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports?period=daily')
      .then((r) => r.json())
      .then((data) => { setReport(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const s = report?.summary;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Welcome back,"
        title={<>{session?.user?.name?.split(' ')[0] ?? 'there'} 👋</>}
        subtitle="🐾 Fin & Paws · Today"
        right={
          // Sign-out is in the sidebar on desktop; keep it here for mobile.
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="md:hidden bg-white/15 hover:bg-white/25 active:scale-95 transition p-2.5 rounded-xl"
            aria-label="Sign out"
          >
            <LogOut size={18} />
          </button>
        }
      />

      <div className="px-4 sm:px-6 pt-4 space-y-4">
        {/* Low Stock Alert */}
        {s?.lowStockCount > 0 && (
          <Link href="/inventory?filter=low" className="block animate-rise">
            <div className="bg-coral-gradient text-white rounded-2xl p-4 flex items-center gap-3 shadow-pop">
              <div className="bg-white/20 rounded-xl p-2 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">Low Stock Alert</p>
                <p className="text-white/85 text-xs">
                  {s.lowStockCount} product{s.lowStockCount > 1 ? 's' : ''} running low — tap to view
                </p>
              </div>
              <ChevronRight size={18} className="text-white/80" />
            </div>
          </Link>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={<Package size={18} />} tint="brand" label="Products" value={loading ? null : s?.totalProducts} />
          <StatCard icon={<ShoppingCart size={18} />} tint="sky" label="Sales Today" value={loading ? null : s?.totalSalesQty} />
          <StatCard icon={<TrendingUp size={18} />} tint="violet" label="Revenue" value={loading ? null : `₹${(s?.totalRevenue ?? 0).toFixed(2)}`} />
          <StatCard icon={<AlertTriangle size={18} />} tint="coral" label="Low Stock" value={loading ? null : s?.lowStockCount} />
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Needs restocking */}
          <div className="bg-white rounded-3xl shadow-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-ink text-sm">Needs Restocking</h2>
              <Link href="/inventory?filter=low" className="text-brand-600 text-xs font-semibold">View all</Link>
            </div>
            {loading ? (
              <SkeletonRows />
            ) : report?.lowStock?.length ? (
              <div className="divide-y divide-black/5">
                {report.lowStock.slice(0, 5).map((p: any) => (
                  <div key={p.id} className="flex justify-between items-center py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">{p.name}</p>
                      <p className="text-xs text-muted">{p.category}</p>
                    </div>
                    <span className="bg-coral-50 text-coral-600 text-xs font-bold px-2.5 py-1 rounded-lg shrink-0">
                      {p.stock} left
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted py-6 text-center">All stocked up 🎉</p>
            )}
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-3xl shadow-card p-5">
            <h2 className="font-bold text-ink text-sm mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/sell" className="bg-brand-gradient text-white rounded-2xl p-5 flex flex-col items-center gap-2 shadow-pop active:scale-[0.98] transition-transform">
                <ShoppingCart size={26} />
                <p className="text-sm font-bold">Sell</p>
              </Link>
              <Link href="/inventory/new" className="bg-coral-gradient text-white rounded-2xl p-5 flex flex-col items-center gap-2 shadow-pop active:scale-[0.98] transition-transform">
                <Plus size={26} />
                <p className="text-sm font-bold">Add Product</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

const TINTS: Record<string, string> = {
  brand: 'bg-brand-50 text-brand-600',
  sky: 'bg-sky-50 text-sky-600',
  violet: 'bg-violet-50 text-violet-600',
  coral: 'bg-coral-50 text-coral-600',
};

function StatCard({ icon, label, value, tint }: { icon: React.ReactNode; label: string; value: React.ReactNode; tint: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-4 animate-rise">
      <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center mb-3', TINTS[tint])}>{icon}</div>
      {value === null ? (
        <div className="h-7 w-16 bg-black/5 rounded-md animate-pulse" />
      ) : (
        <p className="text-2xl font-extrabold text-ink tracking-tight">{value ?? 0}</p>
      )}
      <p className="text-xs text-muted mt-1">{label}</p>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-3 py-1">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-4 bg-black/5 rounded animate-pulse" style={{ width: `${80 - i * 12}%` }} />
      ))}
    </div>
  );
}
