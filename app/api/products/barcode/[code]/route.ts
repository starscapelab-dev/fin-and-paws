import { NextRequest, NextResponse } from 'next/server';
import { getProductByBarcode } from '@/lib/sheets';
import { requireAuth } from '@/lib/requireAuth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  try {
    const { code } = await params;
    const product = await getProductByBarcode(code);
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}