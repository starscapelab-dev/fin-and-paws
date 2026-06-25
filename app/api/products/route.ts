import { NextRequest, NextResponse } from 'next/server';
import { getProducts, addProduct } from '@/lib/sheets';
import { requireAuth } from '@/lib/requireAuth';

export async function GET() {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  try {
    const products = await getProducts();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  try {
    const body = await req.json();
    const product = await addProduct(body);
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}