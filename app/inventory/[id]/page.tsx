'use client';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import BarcodeScanner from '@/components/BarcodeScanner';
import { Save, Trash2, Camera } from 'lucide-react';

const CATEGORIES = ['Fish', 'Aquarium', 'Pet Food', 'Pets', 'Accessories'];
const UNITS = ['pcs', 'kg', 'g', 'L', 'ml', 'pack', 'pair', 'set'];

const input = 'w-full bg-canvas border border-black/5 rounded-xl px-4 py-3 text-sm text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [scan, setScan] = useState(false);
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => setForm({ ...data, stock: String(data.stock), threshold: String(data.threshold), price: String(data.price) }));
  }, [id]);

  const set = (k: string, v: string) => setForm((f: any) => ({ ...f, [k]: v }));

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, stock: Number(form.stock), threshold: Number(form.threshold), price: Number(form.price) }),
    });
    router.push('/inventory');
  }

  async function handleDelete() {
    if (!confirm('Delete this product?')) return;
    setDeleting(true);
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    router.push('/inventory');
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-canvas">
        <PageHeader title="Edit Product" back />
        <div className="px-4 sm:px-6 pt-5 max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-card p-6 space-y-4">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-12 bg-black/5 rounded-xl animate-pulse" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas pb-28 md:pb-12">
      <PageHeader
        title="Edit Product"
        subtitle={form.name}
        back
        right={
          <button onClick={handleDelete} disabled={deleting}
            className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors"
            aria-label="Delete product">
            <Trash2 size={20} />
          </button>
        }
      />

      <div className="px-4 sm:px-6 pt-5 max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-card p-5 sm:p-6 space-y-4">
          <Field label="Barcode">
            <div className="flex gap-2">
              <input className={input} value={form.barcode} onChange={(e) => set('barcode', e.target.value)} />
              <button type="button" onClick={() => setScan(true)}
                className="shrink-0 px-4 rounded-xl bg-brand-gradient text-white shadow-pop flex items-center gap-1.5 text-sm font-bold active:scale-95 transition-transform">
                <Camera size={16} /> Scan
              </button>
            </div>
          </Field>
          <Field label="Product Name">
            <input className={input} value={form.name} onChange={(e) => set('name', e.target.value)} />
          </Field>
          <Field label="Category">
            <select className={input} value={form.category} onChange={(e) => set('category', e.target.value)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Stock Qty">
              <input className={input} type="number" inputMode="numeric" value={form.stock} onChange={(e) => set('stock', e.target.value)} />
            </Field>
            <Field label="Low Stock Alert">
              <input className={input} type="number" inputMode="numeric" value={form.threshold} onChange={(e) => set('threshold', e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (₹)">
              <input className={input} type="number" inputMode="decimal" value={form.price} onChange={(e) => set('price', e.target.value)} />
            </Field>
            <Field label="Unit">
              <select className={input} value={form.unit} onChange={(e) => set('unit', e.target.value)}>
                {UNITS.map((u) => <option key={u}>{u}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Notes">
            <textarea className={input} rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </Field>
        </div>

        <button onClick={handleSave} disabled={saving}
          className="mt-4 w-full bg-brand-gradient text-white font-bold py-4 rounded-2xl shadow-pop disabled:opacity-60 flex items-center justify-center gap-2 active:scale-[0.99] transition-transform">
          <Save size={18} />
          {saving ? 'Saving…' : 'Save Changes'}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
