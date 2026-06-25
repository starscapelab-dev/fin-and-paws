import { NextRequest, NextResponse } from 'next/server';
import { getTransactions, addTransaction, updateProductStock, getProducts } from '@/lib/sheets';
import { requireAuth } from '@/lib/requireAuth';

export async function GET() {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  try {
    const transactions = await getTransactions();
    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  try {
    const body = await req.json();
    const { productId, type, quantity, notes, productName } = body;

    // Update stock
    const products = await getProducts();
    const product = products.find((p) => p.id === productId);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const newStock =
      type === 'Sale'
        ? product.stock - quantity
        : product.stock + quantity;

    if (newStock < 0) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
    }

    await updateProductStock(productId, newStock);

    // Record transaction
    const tx = await addTransaction({ productId, productName, type, quantity, notes });

    return NextResponse.json({ transaction: tx, newStock });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record transaction' }, { status: 500 });
  }
}