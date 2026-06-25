'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import BarcodeScanner from '@/components/BarcodeScanner';
import {
  Search, ScanLine, Camera, Plus, Minus, PackagePlus, ShoppingCart, CheckCircle2, X, AlertTriangle,
} from 'lucide-react';
import clsx from 'clsx';

type Product = {
  id: string; barcode: string; name: string; category: string;
  stock: number; threshold: number; price: number; unit: string;
};

export default function SellPage() {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [query, setQuery] = useState('');

  const [barcode, setBarcode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [showBarcode, setShowBarcode] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [mode, setMode] = useState<'Sale' | 'Restock'>('Sale');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load the catalogue once so name search is instant.
  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => { setProducts(Array.isArray(data) ? data : []); setLoadingList(false); })
      .catch(() => setLoadingList(false));
  }, []);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 8);
  }, [query, products]);

  function pick(p: Product) {
    setProduct(p);
    setQty(1);
    setMode('Sale');
    setQuery('');
    setError(null);
  }

  async function lookupBarcode(raw?: string) {
    const value = (raw ?? barcode).trim();
    if (!value) return;
    setScanning(true);
    setError(null);
    try {
      const res = await fetch(`/api/products/barcode/${encodeURIComponent(value)}`);
      if (res.ok) {
        pick(await res.json());
        setBarcode('');
      } else {
        setError('No product with that barcode. Try searching by name.');
      }
    } catch {
      setError('Lookup failed. Try searching by name.');
    } finally {
      setScanning(false);
    }
  }

  async function submit() {
    if (!product) return;
    if (mode === 'Sale' && qty > product.stock) { setError('Not enough stock for this sale'); return; }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, productName: product.name, type: mode, quantity: qty, notes: '' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to record transaction');
        return;
      }
      const data = await res.json();
      setDone(`${mode === 'Sale' ? 'Sold' : 'Restocked'} ${qty} × ${product.name}`);
      // Reflect the new stock locally so the catalogue stays accurate.
      setProducts((list) => list.map((p) => (p.id === product.id ? { ...p, stock: data.newStock } : p)));
      setProduct(null);
      setTimeout(() => { setDone(null); searchRef.current?.focus(); }, 1800);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Sell"
        subtitle="Search a product to record a sale or restock"
        right={<div className="bg-white/15 rounded-2xl p-2.5"><ShoppingCart size={22} /></div>}
      />

      <div className="px-4 sm:px-6 pt-5 max-w-xl mx-auto space-y-4">
        {done && (
          <div className="bg-brand-50 border border-brand-200 rounded-2xl p-3.5 flex items-center gap-2.5 animate-rise">
            <CheckCircle2 className="text-brand-600 shrink-0" size={20} />
            <p className="text-brand-700 text-sm font-semibold">{done}</p>
          </div>
        )}
        {error && (
          <div className="bg-coral-50 border border-coral-200 rounded-2xl p-3.5 flex items-center gap-2.5">
            <AlertTriangle className="text-coral-600 shrink-0" size={18} />
            <p className="text-coral-700 text-sm font-medium flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-coral-400"><X size={16} /></button>
          </div>
        )}

        {!product && (
          <>
            {/* Name search */}
            <div className="bg-white rounded-3xl shadow-card p-5">
              <label className="text-xs font-semibold text-muted mb-1.5 block">Find product</label>
              <div className="relative">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  ref={searchRef}
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type a product name…"
                  className="w-full pl-11 pr-9 py-3 bg-canvas border border-black/5 rounded-xl text-sm text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"><X size={16} /></button>
                )}
              </div>

              {/* Results */}
              {query.trim() && (
                <div className="mt-3 space-y-1.5">
                  {loadingList ? (
                    <p className="text-sm text-muted py-2">Loading products…</p>
                  ) : matches.length === 0 ? (
                    <p className="text-sm text-muted py-2">No products match “{query.trim()}”.</p>
                  ) : (
                    matches.map((p) => {
                      const low = p.stock <= p.threshold;
                      return (
                        <button
                          key={p.id}
                          onClick={() => pick(p)}
                          className="w-full flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-brand-50 text-left transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-ink truncate">{p.name}</p>
                            <p className="text-xs text-muted">{p.category} · ₹{p.price}</p>
                          </div>
                          <span className={clsx('text-sm font-bold shrink-0', low ? 'text-coral-500' : 'text-brand-600')}>
                            {p.stock} {p.unit}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Optional barcode lookup */}
            <div className="bg-white rounded-3xl shadow-card p-5">
              <button
                onClick={() => setShowBarcode((v) => !v)}
                className="flex items-center gap-2 text-sm font-semibold text-muted"
              >
                <ScanLine size={16} /> {showBarcode ? 'Hide' : 'Use'} barcode lookup
              </button>
              {showBarcode && (
                <>
                  <button
                    onClick={() => setCameraOpen(true)}
                    className="mt-3 w-full bg-brand-gradient text-white py-3 rounded-xl text-sm font-bold shadow-pop flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"
                  >
                    <Camera size={18} /> Scan with camera
                  </button>
                  <div className="flex gap-2 mt-2">
                    <div className="relative flex-1">
                      <ScanLine size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                      <input
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && lookupBarcode()}
                        inputMode="numeric"
                        placeholder="…or type barcode, then Enter"
                        className="w-full pl-11 pr-4 py-3 bg-canvas border border-black/5 rounded-xl text-sm text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition"
                      />
                    </div>
                    <button onClick={() => lookupBarcode()} disabled={scanning || !barcode.trim()}
                      className="bg-ink text-white px-5 rounded-xl disabled:opacity-50 text-sm font-bold active:scale-95 transition-transform">
                      Find
                    </button>
                  </div>
                </>
              )}
            </div>

            {!query.trim() && (
              <div className="text-center text-muted py-8">
                <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-400 flex items-center justify-center mx-auto mb-3">
                  <ShoppingCart size={30} />
                </div>
                <p className="text-sm font-medium">Search a product to begin</p>
              </div>
            )}
          </>
        )}

        {/* Selected product → sell / restock */}
        {product && (
          <div className="bg-white rounded-3xl shadow-card p-5 animate-rise">
            <div className="flex justify-between items-start mb-4">
              <div className="min-w-0">
                <p className="font-bold text-ink truncate">{product.name}</p>
                <p className="text-xs text-muted">{product.category} · ₹{product.price}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p className={clsx('font-extrabold text-xl', product.stock <= product.threshold ? 'text-coral-500' : 'text-brand-600')}>{product.stock}</p>
                  <p className="text-[10px] text-muted uppercase tracking-wide">in stock</p>
                </div>
                <button onClick={() => setProduct(null)} className="p-1.5 rounded-lg bg-canvas text-muted" aria-label="Change product"><X size={16} /></button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4 bg-canvas p-1 rounded-2xl">
              <button onClick={() => setMode('Sale')}
                className={clsx('flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition', mode === 'Sale' ? 'bg-brand-gradient text-white shadow-pop' : 'text-muted')}>
                <ShoppingCart size={16} /> Sell
              </button>
              <button onClick={() => setMode('Restock')}
                className={clsx('flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition', mode === 'Restock' ? 'bg-coral-gradient text-white shadow-pop' : 'text-muted')}>
                <PackagePlus size={16} /> Restock
              </button>
            </div>

            <div className="flex items-center justify-between bg-canvas rounded-2xl p-2 mb-4">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-12 h-12 rounded-xl bg-white shadow-card flex items-center justify-center text-ink active:scale-95 transition-transform">
                <Minus size={18} />
              </button>
              <div className="text-center">
                <input type="number" min={1} value={qty}
                  onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                  className="w-24 text-center text-3xl font-extrabold text-ink bg-transparent outline-none" />
                <p className="text-xs text-muted">{product.unit}</p>
              </div>
              <button onClick={() => setQty((q) => q + 1)}
                className="w-12 h-12 rounded-xl bg-white shadow-card flex items-center justify-center text-ink active:scale-95 transition-transform">
                <Plus size={18} />
              </button>
            </div>

            {mode === 'Sale' && (
              <div className="flex justify-between text-sm mb-4 px-1">
                <span className="text-muted">Total</span>
                <span className="font-extrabold text-ink">₹{(product.price * qty).toFixed(2)}</span>
              </div>
            )}

            <button onClick={submit} disabled={submitting}
              className={clsx('w-full text-white font-bold py-4 rounded-2xl shadow-pop disabled:opacity-60 active:scale-[0.99] transition-transform', mode === 'Sale' ? 'bg-brand-gradient' : 'bg-coral-gradient')}>
              {submitting ? 'Saving…' : mode === 'Sale' ? `Confirm Sale · ₹${(product.price * qty).toFixed(2)}` : `Confirm Restock · +${qty}`}
            </button>

            <button onClick={() => router.push('/inventory/new')} className="w-full mt-2 text-muted text-xs font-medium py-2">
              + Add a new product instead
            </button>
          </div>
        )}
      </div>

      {cameraOpen && (
        <BarcodeScanner
          onResult={(text) => {
            setCameraOpen(false);
            setBarcode(text);
            setShowBarcode(true);
            lookupBarcode(text);
          }}
          onClose={() => setCameraOpen(false)}
        />
      )}
    </AppShell>
  );
}
