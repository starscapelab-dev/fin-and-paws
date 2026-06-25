import { NextRequest, NextResponse } from 'next/server';
import { getProducts, findProductRow, sheets, SHEET_ID } from '@/lib/sheets';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const products = await getProducts();
    const product = products.find((p) => p.id === id);
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const sheetRow = await findProductRow(id);
    if (sheetRow === null) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Products!A${sheetRow}:J${sheetRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          id,
          body.barcode,
          body.name,
          body.category,
          body.stock,
          body.threshold,
          body.price,
          body.unit,
          body.notes,
          new Date().toISOString(),
        ]],
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sheetRow = await findProductRow(id);
    if (sheetRow === null) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await sheets.spreadsheets.values.clear({
      spreadsheetId: SHEET_ID,
      range: `Products!A${sheetRow}:J${sheetRow}`,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}