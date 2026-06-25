import { NextRequest, NextResponse } from 'next/server';
import { getTransactions, getProducts } from '@/lib/sheets';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'daily'; // daily | weekly | monthly

    const [transactions, products] = await Promise.all([
      getTransactions(),
      getProducts(),
    ]);

    const now = new Date();
    const filtered = transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      if (period === 'daily') {
        return txDate.toDateString() === now.toDateString();
      } else if (period === 'weekly') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return txDate >= weekAgo;
      } else {
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        return txDate >= monthAgo;
      }
    });

    // Total sales & restocks
    const sales = filtered.filter((tx) => tx.type === 'Sale');
    const restocks = filtered.filter((tx) => tx.type === 'Restock');

    const totalSalesQty = sales.reduce((sum, tx) => sum + tx.quantity, 0);
    const totalRestockQty = restocks.reduce((sum, tx) => sum + tx.quantity, 0);

    // Revenue calculation
    const totalRevenue = sales.reduce((sum, tx) => {
      const product = products.find((p) => p.id === tx.productId);
      return sum + (product ? product.price * tx.quantity : 0);
    }, 0);

    // Top selling products
    const productSalesMap: Record<string, { name: string; qty: number; revenue: number }> = {};
    sales.forEach((tx) => {
      const product = products.find((p) => p.id === tx.productId);
      if (!productSalesMap[tx.productId]) {
        productSalesMap[tx.productId] = { name: tx.productName, qty: 0, revenue: 0 };
      }
      productSalesMap[tx.productId].qty += tx.quantity;
      productSalesMap[tx.productId].revenue += (product?.price || 0) * tx.quantity;
    });

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    // Sales by category
    const categoryMap: Record<string, number> = {};
    sales.forEach((tx) => {
      const product = products.find((p) => p.id === tx.productId);
      const cat = product?.category || 'Unknown';
      categoryMap[cat] = (categoryMap[cat] || 0) + tx.quantity;
    });

    // Low stock products
    const lowStock = products.filter((p) => p.stock <= p.threshold);

    // Daily breakdown (for charts)
    const dailyMap: Record<string, { sales: number; revenue: number }> = {};
    filtered.forEach((tx) => {
      const day = new Date(tx.date).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short'
      });
      if (!dailyMap[day]) dailyMap[day] = { sales: 0, revenue: 0 };
      if (tx.type === 'Sale') {
        const product = products.find((p) => p.id === tx.productId);
        dailyMap[day].sales += tx.quantity;
        dailyMap[day].revenue += (product?.price || 0) * tx.quantity;
      }
    });

    const dailyChart = Object.entries(dailyMap).map(([date, data]) => ({
      date,
      ...data,
    }));

    return NextResponse.json({
      period,
      summary: {
        totalSalesQty,
        totalRestockQty,
        totalRevenue,
        totalProducts: products.length,
        lowStockCount: lowStock.length,
      },
      topProducts,
      categoryBreakdown: Object.entries(categoryMap).map(([name, qty]) => ({ name, qty })),
      dailyChart,
      lowStock,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}