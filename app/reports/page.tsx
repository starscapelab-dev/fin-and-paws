'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import { ShoppingCart, TrendingUp, PackagePlus, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

type Report = {
  period: string;
  summary: { totalSalesQty: number; totalRestockQty: number; totalRevenue: number; totalProducts: number; lowStockCount: number };
  topProducts: { name: string; qty: number; revenue: number }[];
  categoryBreakdown: { name: string; qty: number }[];
  dailyChart: { date: string; sales: number; revenue: number }[];
  lowStock: { id: string; name: string; stock: number; category: string }[];
};

const PERIODS = [
  { key: 'daily', label: 'Today' },
  { key: 'weekly', label: 'This Week' },
  { key: 'monthly', label: 'This Month' },
] as const;

export default function ReportsPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reports?period=${period}`)
      .then((r) => r.json())
      .then((data) => { setReport(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [period]);

  const maxRevenue = Math.max(1, ...(report?.dailyChart.map((d) => d.revenue) || [1]));
  const maxCat = Math.max(1, ...(report?.categoryBreakdown.map((c) => c.qty) || [1]));

  return (
    <AppShell>
      <PageHeader
        title="Reports"
        subtitle="Sales & stock at a glance"
        inHeader={
          <div className="flex gap-2">
            {PERIODS.map((p) => (
              <button key={p.key} onClick={() => setPeriod(p.key)}
                className={clsx('px-4 py-1.5 rounded-full text-xs font-semibold transition',
                  period === p.key ? 'bg-white text-brand-600' : 'bg-white/15 text-white hover:bg-white/25')}>
                {p.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="px-4 sm:px-6 pt-5">
        {loading || !report ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-28 bg-white rounded-2xl shadow-card animate-pulse" />)}
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              <Stat icon={<TrendingUp size={18} />} tint="violet" label="Revenue" value={`₹${report.summary.totalRevenue.toFixed(2)}`} />
              <Stat icon={<ShoppingCart size={18} />} tint="brand" label="Units Sold" value={report.summary.totalSalesQty} />
              <Stat icon={<PackagePlus size={18} />} tint="sky" label="Restocked" value={report.summary.totalRestockQty} />
              <Stat icon={<AlertTriangle size={18} />} tint="coral" label="Low Stock" value={report.summary.lowStockCount} />
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              {/* Revenue trend */}
              <Card title="Revenue Trend">
                {report.dailyChart.length === 0 ? <Empty /> : (
                  <div className="flex items-end gap-2 h-36 pt-2">
                    {report.dailyChart.map((d) => (
                      <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                        <div className="w-full rounded-t-lg bg-brand-gradient transition-all"
                          style={{ height: `${Math.max(4, (d.revenue / maxRevenue) * 100)}%` }}
                          title={`₹${d.revenue.toFixed(2)}`} />
                        <span className="text-[9px] text-muted truncate w-full text-center">{d.date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Top products */}
              <Card title="Top Selling Products">
                {report.topProducts.length === 0 ? <Empty /> : (
                  <div className="space-y-3">
                    {report.topProducts.map((p, i) => (
                      <div key={p.name} className="flex items-center gap-3">
                        <span className={clsx('w-7 h-7 rounded-lg text-xs font-extrabold flex items-center justify-center shrink-0',
                          i === 0 ? 'bg-coral-gradient text-white' : 'bg-brand-50 text-brand-600')}>{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-ink truncate">{p.name}</p>
                          <p className="text-xs text-muted">{p.qty} sold · ₹{p.revenue.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Category breakdown */}
              <Card title="Sales by Category">
                {report.categoryBreakdown.length === 0 ? <Empty /> : (
                  <div className="space-y-3">
                    {report.categoryBreakdown.map((c) => (
                      <div key={c.name}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-ink font-medium">{c.name}</span>
                          <span className="text-muted font-semibold">{c.qty}</span>
                        </div>
                        <div className="h-2.5 bg-canvas rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${(c.qty / maxCat) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Low stock */}
              {report.lowStock.length > 0 && (
                <Card title="Needs Restocking">
                  <div className="divide-y divide-black/5">
                    {report.lowStock.map((p) => (
                      <div key={p.id} className="flex justify-between items-center py-2.5">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-ink truncate">{p.name}</p>
                          <p className="text-xs text-muted">{p.category}</p>
                        </div>
                        <span className="bg-coral-50 text-coral-600 text-xs font-bold px-2.5 py-1 rounded-lg shrink-0">{p.stock} left</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </>
        )}
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

function Stat({ icon, tint, label, value }: { icon: React.ReactNode; tint: string; label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-4 animate-rise">
      <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center mb-3', TINTS[tint])}>{icon}</div>
      <p className="text-2xl font-extrabold text-ink tracking-tight">{value}</p>
      <p className="text-xs text-muted mt-1">{label}</p>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl shadow-card p-5 mb-4 lg:mb-0">
      <h2 className="font-bold text-ink text-sm mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Empty() {
  return <p className="text-center text-muted/60 text-sm py-6">No data for this period</p>;
}
