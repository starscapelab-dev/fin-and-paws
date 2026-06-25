'use client';
import { Suspense, useEffect, useMemo, useState } from 'react';
import AppShell from '@/components/AppShell';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Plus, AlertTriangle, ChevronRight, Package } from 'lucide-react';
import clsx from 'clsx';

const CATEGORIES = ['All', 'Fish', 'Aquarium', 'Pet Food', 'Pets', 'Accessories'];

export default function InventoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas" />}>
      <InventoryContent />
    </Suspense>
  );
}

function InventoryContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('filter') === 'low' ? 'low' : 'All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => { setProducts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      category === 'All' ? true :
      category === 'low' ? p.stock <= p.threshold :
      p.category === category;
    return matchSearch && matchCat;
  }), [products, search, category]);

  return (
    <AppShell>
      <div className="bg-brand-gradient text-white px-4 sm:px-6 pt-12 md:pt-8 pb-6 md:mx-4 md:mt-4 md:rounded-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Inventory</h1>
            <p className="text-white/70 text-xs mt-0.5">{products.length} product{products.length !== 1 ? 's' : ''}</p>
          </div>
          <Link href="/inventory/new" className="bg-white text-brand-600 font-semibold text-sm px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform">
            <Plus size={18} /> <span className="hidden sm:inline">Add</span>
          </Link>
        </div>
        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-600/60" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white rounded-xl text-sm text-ink outline-none focus:ring-2 focus:ring-white/60"
          />
        </div>
      </div>

      {/* Category chips */}
      <div className="px-4 sm:px-6 pt-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <Chip key={cat} active={category === cat} onClick={() => setCategory(cat)}>{cat}</Chip>
          ))}
          <Chip active={category === 'low'} danger onClick={() => setCategory('low')}>
            <AlertTriangle size={12} /> Low Stock
          </Chip>
        </div>
      </div>

      {/* List */}
      <div className="px-4 sm:px-6 pt-4">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-24 bg-white rounded-2xl shadow-card animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted">
            <Package size={44} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No products found</p>
            <Link href="/inventory/new" className="text-brand-600 text-sm font-semibold mt-2 inline-block">Add your first product →</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((p) => {
              const low = p.stock <= p.threshold;
              return (
                <Link key={p.id} href={`/inventory/${p.id}`} className="group">
                  <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-card hover:shadow-pop transition-shadow h-full">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-ink text-sm truncate">{p.name}</p>
                        {low && <AlertTriangle size={13} className="text-coral-500 shrink-0" />}
                      </div>
                      <p className="text-xs text-muted mt-0.5">{p.category} · {p.unit}</p>
                      <p className="text-xs font-semibold text-brand-600 mt-1.5">₹{p.price}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <p className={clsx('font-extrabold text-xl tracking-tight', low ? 'text-coral-500' : 'text-brand-600')}>{p.stock}</p>
                        <p className="text-[10px] text-muted uppercase tracking-wide">{p.unit}</p>
                      </div>
                      <ChevronRight size={16} className="text-black/20 group-hover:text-brand-500 transition-colors" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Chip({ active, danger, onClick, children }: { active: boolean; danger?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1 whitespace-nowrap',
        active
          ? danger ? 'bg-coral-500 text-white' : 'bg-brand-500 text-white'
          : danger ? 'bg-coral-50 text-coral-600' : 'bg-white text-muted shadow-card'
      )}
    >
      {children}
    </button>
  );
}
