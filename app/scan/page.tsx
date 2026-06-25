'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import {
  ScanLine, Search, Plus, Minus, PackagePlus, ShoppingCart, CheckCircle2,
} from 'lucide-react';
import clsx from 'clsx';

type Product = {
  id: string; barcode: string; name: string; category: string;
  stock: number; threshold: number; price: number; unit: string;
};

export default function ScanPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState('');
  const [looking, setLooking] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [qty, setQty] = useState(1);
  const [mode, setMode] = useState<'Sale' | 'Restock'>('Sale');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  // Keep the barcode field focused so hardware scanners "type" straight in.
  useEffect(() => { inputRef.current?.focus(); }, [product]);

  async function lookup(raw?: string) {
    const value = (raw ?? code).trim();
    if (!value) return;
    setLooking(true); setNotFound(false); setProduct(null);
    try {
      const res = await fetch(`/api/products/barcode/${encodeURIComponent(value)}`);
      if (res.ok) {
        const p = await res.json();
        setProduct(p); setQty(1); setMode('Sale');
      } else setNotFound(true);
    } catch { setNotFound(true); }
    finally { setLooking(false); }
  }

  async function submit() {
    if (!product) return;
    if (mode === 'Sale' && qty > product.stock) { alert('Not enough stock for this sale'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, productName: product.name, type: mode, quantity: qty, notes: '' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to record transaction');
        return;
      }
      setDone(`${mode === 'Sale' ? 'Sold' : 'Restocked'} ${qty} × ${product.name}`);
      setProduct(null); setCode(''); setNotFound(false);
      setTimeout(() => setDone(null), 2500);
    } finally { setSubmitting(false); }
  }

  return (
    <AppShell>
      <div className="bg-brand-gradient text-white px-4 sm:px-6 pt-12 md:pt-8 pb-6 md:mx-4 md:mt-4 md:rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="bg-white/15 rounded-xl p-2.5"><ScanLine size={22} /></div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Scan &amp; Sell</h1>
            <p className="text-white/70 text-xs mt-0.5">Scan a barcode to record a sale or restock</p>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 pt-5 max-w-xl mx-auto space-y-4">
        {/* Toast */}
        {done && (
          <div className="bg-brand-50 border border-brand-200 rounded-2xl p-3.5 flex items-center gap-2.5 animate-rise">
            <CheckCircle2 className="text-brand-600 shrink-0" size={20} />
            <p className="text-brand-700 text-sm font-semibold">{done}</p>
          </div>
        )}

        {/* Barcode input */}
        <div className="bg-white rounded-3xl shadow-card p-5">
          <label className="text-xs font-semibold text-muted mb-1.5 block">Barcode</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <ScanLine size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                ref={inputRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && lookup()}
                inputMode="numeric"
                placeholder="Scan or type, then Enter"
                className="w-full pl-11 pr-4 py-3 bg-canvas border border-black/5 rounded-xl text-sm text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition"
              />
            </div>
            <button onClick={() => lookup()} disabled={looking || !code.trim()}
              className="bg-brand-gradient text-white px-5 rounded-xl disabled:opacity-50 flex items-center gap-1.5 text-sm font-bold shadow-pop active:scale-95 transition-transform">
              <Search size={16} /> Find
            </button>
          </div>
          {looking && <p className="text-xs text-muted mt-2">Looking up…</p>}
        </div>

        {/* Not found */}
        {notFound && !looking && (
          <div className="bg-white rounded-3xl shadow-card p-6 text-center animate-rise">
            <p className="text-ink font-semibold mb-1">No product with that barcode</p>
            <p className="text-muted text-sm mb-4">Add it to your inventory first.</p>
            <button onClick={() => router.push('/inventory/new')}
              className="inline-flex items-center gap-2 bg-coral-gradient text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-pop">
              <Plus size={16} /> Add Product
            </button>
          </div>
        )}

        {/* Product found */}
        {product && (
          <div className="bg-white rounded-3xl shadow-card p-5 animate-rise">
            <div className="flex justify-between items-start mb-4">
              <div className="min-w-0">
                <p className="font-bold text-ink truncate">{product.name}</p>
                <p className="text-xs text-muted">{product.category} · ₹{product.price}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={clsx('font-extrabold text-xl', product.stock <= product.threshold ? 'text-coral-500' : 'text-brand-600')}>{product.stock}</p>
                <p className="text-[10px] text-muted uppercase tracking-wide">in stock</p>
              </div>
            </div>

            {/* Mode toggle */}
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

            {/* Quantity stepper */}
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
          </div>
        )}

        {/* Idle hint */}
        {!product && !notFound && !looking && (
          <div className="text-center text-muted py-12">
            <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-400 flex items-center justify-center mx-auto mb-3">
              <ScanLine size={30} />
            </div>
            <p className="text-sm font-medium">Ready to scan</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
