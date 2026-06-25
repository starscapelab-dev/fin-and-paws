'use client';
import { useEffect, useMemo, useState } from 'react';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import Link from 'next/link';
import { ShoppingCart, PackagePlus, ArrowLeftRight } from 'lucide-react';
import clsx from 'clsx';

type Tx = {
  id: string; date: string; productId: string; productName: string;
  type: 'Sale' | 'Restock'; quantity: number; notes: string;
};

const FILTERS = ['All', 'Sale', 'Restock'] as const;
type Filter = (typeof FILTERS)[number];

export default function TransactionsPage() {
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('All');

  useEffect(() => {
    fetch('/api/transactions')
      .then((r) => r.json())
      .then((data) => { setTxs(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const sorted = useMemo(
    () => [...txs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [txs]
  );
  const filtered = sorted.filter((t) => filter === 'All' || t.type === filter);

  const groups = useMemo(() => {
    const map: Record<string, Tx[]> = {};
    filtered.forEach((t) => {
      const key = new Date(t.date).toLocaleDateString('en-IN', {
        weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
      });
      (map[key] ||= []).push(t);
    });
    return Object.entries(map);
  }, [filtered]);

  return (
    <AppShell>
      <PageHeader
        title="Transactions"
        subtitle={`${filtered.length} record${filtered.length !== 1 ? 's' : ''}`}
        right={
          <Link href="/sell" className="bg-white text-brand-600 font-semibold text-sm px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform">
            <ShoppingCart size={18} /> <span className="hidden sm:inline">Sell</span>
          </Link>
        }
        inHeader={
          <div className="flex gap-2">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={clsx('px-4 py-1.5 rounded-full text-xs font-semibold transition',
                  filter === f ? 'bg-white text-brand-600' : 'bg-white/15 text-white hover:bg-white/25')}>
                {f === 'All' ? 'All' : f === 'Sale' ? 'Sales' : 'Restocks'}
              </button>
            ))}
          </div>
        }
      />

      <div className="px-4 sm:px-6 pt-5">
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => <div key={i} className="h-16 bg-white rounded-2xl shadow-card animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted">
            <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-400 flex items-center justify-center mx-auto mb-3">
              <ArrowLeftRight size={28} />
            </div>
            <p className="font-medium">No transactions yet</p>
            <Link href="/sell" className="text-brand-600 text-sm font-semibold mt-2 inline-block">Record your first sale →</Link>
          </div>
        ) : (
          groups.map(([day, items]) => (
            <div key={day} className="mb-6">
              <p className="text-xs font-bold text-muted uppercase tracking-wide mb-2 px-1">{day}</p>
              <div className="bg-white rounded-2xl shadow-card divide-y divide-black/5 overflow-hidden">
                {items.map((t) => {
                  const isSale = t.type === 'Sale';
                  return (
                    <div key={t.id} className="flex items-center gap-3 p-4">
                      <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
                        isSale ? 'bg-brand-50 text-brand-600' : 'bg-coral-50 text-coral-600')}>
                        {isSale ? <ShoppingCart size={18} /> : <PackagePlus size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink truncate">{t.productName}</p>
                        <p className="text-xs text-muted">
                          {new Date(t.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          {t.notes ? ` · ${t.notes}` : ''}
                        </p>
                      </div>
                      <div className={clsx('text-base font-extrabold shrink-0', isSale ? 'text-brand-600' : 'text-coral-600')}>
                        {isSale ? '−' : '+'}{t.quantity}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </AppShell>
  );
}
