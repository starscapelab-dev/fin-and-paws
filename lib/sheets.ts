import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive',
  ],
});

export const sheets = google.sheets({ version: 'v4', auth });
export const SHEET_ID = process.env.GOOGLE_SHEETS_ID!;

// ─── Products ───────────────────────────────────────────

export async function getProducts() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Products!A2:J',
  });
  const rows = res.data.values || [];
  return rows
    // Deleting a product clears its cells but leaves a blank row behind;
    // skip any row missing an id so consumers never see ghost products.
    .filter((row) => row[0])
    .map((row) => ({
      id: row[0],
      barcode: row[1] || '',
      name: row[2] || '',
      category: row[3] || '',
      stock: Number(row[4]) || 0,
      threshold: Number(row[5]) || 0,
      price: Number(row[6]) || 0,
      unit: row[7] || '',
      notes: row[8] || '',
      lastUpdated: row[9] || '',
    }));
}

export async function addProduct(product: {
  barcode: string;
  name: string;
  category: string;
  stock: number;
  threshold: number;
  price: number;
  unit: string;
  notes: string;
}) {
  const id = `P${Date.now()}`;
  const lastUpdated = new Date().toISOString();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Products!A:J',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        id,
        product.barcode,
        product.name,
        product.category,
        product.stock,
        product.threshold,
        product.price,
        product.unit,
        product.notes,
        lastUpdated,
      ]],
    },
  });
  return { id, ...product, lastUpdated };
}

// Resolve the actual 1-based spreadsheet row for a product id by reading
// column A directly. This must not rely on getProducts()' filtered index,
// because blank rows left by deletes would shift it off the real row.
export async function findProductRow(id: string): Promise<number | null> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Products!A2:A',
  });
  const ids = res.data.values || [];
  const idx = ids.findIndex((row) => row[0] === id);
  return idx === -1 ? null : idx + 2; // +2: row 1 is the header, array is 0-based
}

export async function updateProductStock(id: string, newStock: number) {
  const products = await getProducts();
  const product = products.find((p) => p.id === id);
  const sheetRow = await findProductRow(id);
  if (!product || sheetRow === null) throw new Error('Product not found');
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `Products!E${sheetRow}:J${sheetRow}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[newStock, product.threshold, product.price, product.unit, product.notes, new Date().toISOString()]],
    },
  });
}

export async function getProductByBarcode(barcode: string) {
  const products = await getProducts();
  return products.find((p) => p.barcode === barcode) || null;
}

// ─── Transactions ────────────────────────────────────────

export async function addTransaction(tx: {
  productId: string;
  productName: string;
  type: 'Sale' | 'Restock';
  quantity: number;
  notes: string;
}) {
  const id = `T${Date.now()}`;
  const date = new Date().toISOString();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Transactions!A:G',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[id, date, tx.productId, tx.productName, tx.type, tx.quantity, tx.notes]],
    },
  });
  return { id, date, ...tx };
}

export async function getTransactions() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Transactions!A2:G',
  });
  const rows = res.data.values || [];
  return rows.map((row) => ({
    id: row[0],
    date: row[1],
    productId: row[2],
    productName: row[3],
    type: row[4] as 'Sale' | 'Restock',
    quantity: Number(row[5]),
    notes: row[6],
  }));
}