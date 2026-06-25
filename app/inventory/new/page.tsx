'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import BarcodeScanner from '@/components/BarcodeScanner';
import { Save, Camera } from 'lucide-react';

const CATEGORIES = ['Fish', 'Aquarium', 'Pet Food', 'Pets', 'Accessories'];
const UNITS = ['pcs', 'kg', 'g', 'L', 'ml', 'pack', 'pair', 'set'];

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [scan, setScan] = useState(false);
  const [form, setForm] = useState({
    barcode: '', name: '', category: 'Fish',
    stock: '', threshold: '', price: '', unit: 'pcs', notes: '',
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit() {
    if (!form.name || !form.price) return alert('Name and price are required');
    setSaving(true);
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        stock: Number(form.stock),
        threshold: Number(form.threshold),
        price: Number(form.price),
      }),
    });
    if (res.ok) {
      router.push('/inventory');
    } else {
      alert('Failed to save product');
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas pb-28 md:pb-12">
      <PageHeader title="Add Product" subtitle="Create a new inventory item" back />

      <div className="px-4 sm:px-6 pt-5 max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-card p-5 sm:p-6 space-y-4">
          <Field label="Barcode (optional)">
            <div className="flex gap-2">
              <input className={input} placeholder="Scan or type barcode"
                value={form.barcode} onChange={(e) => set('barcode', e.target.value)} />
              <button type="button" onClick={() => setScan(true)}
                className="shrink-0 px-4 rounded-xl bg-brand-gradient text-white shadow-pop flex items-center gap-1.5 text-sm font-bold active:scale-95 transition-transform">
                <Camera size={16} /> Scan
              </button>
            </div>
          </Field>

          <Field label="Product Name" required>
            <input className={input} placeholder="e.g. Goldfish Food 200g"
              value={form.name} onChange={(e) => set('name', e.target.value)} />
          </Field>

          <Field label="Category">
            <select className={input} value={form.category} onChange={(e) => set('category', e.target.value)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Stock Qty">
              <input className={input} type="number" inputMode="numeric" placeholder="0"
                value={form.stock} onChange={(e) => set('stock', e.target.value)} />
            </Field>
            <Field label="Low Stock Alert">
              <input className={input} type="number" inputMode="numeric" placeholder="5"
                value={form.threshold} onChange={(e) => set('threshold', e.target.value)} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (₹)" required>
              <input className={input} type="number" inputMode="decimal" placeholder="0.00"
                value={form.price} onChange={(e) => set('price', e.target.value)} />
            </Field>
            <Field label="Unit">
              <select className={input} value={form.unit} onChange={(e) => set('unit', e.target.value)}>
                {UNITS.map((u) => <option key={u}>{u}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Notes">
            <textarea className={input} rows={3} placeholder="Optional notes"
              value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </Field>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="mt-4 w-full bg-brand-gradient text-white font-bold py-4 rounded-2xl shadow-pop disabled:opacity-60 flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"
        >
          <Save size={18} />
          {saving ? 'Saving…' : 'Save Product'}
        </button>
      </div>

      {scan && (
        <BarcodeScanner
          onResult={(text) => { set('barcode', text); setScan(false); }}
          onClose={() => setScan(false)}
        />
      )}
    </div>
  );
}

export const input = 'w-full bg-canvas border border-black/5 rounded-xl px-4 py-3 text-sm text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition';

export function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted mb-1.5 block">
        {label}{required && <span className="text-coral-500"> *</span>}
      </label>
      {children}
    </div>
  );
}
