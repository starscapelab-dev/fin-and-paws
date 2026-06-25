# 🐾 Fin & Paws — Inventory Management

A mobile-first inventory app for a pet & aquarium shop. Built with Next.js 16
(App Router), NextAuth (Google sign-in), and Google Sheets as the data store.

- **Live:** https://fin-and-paws.vercel.app/
- **Stack:** Next.js 16 · React 19 · Tailwind v4 · NextAuth · Google Sheets API

## Features

- Google sign-in (gated app routes via `proxy.ts`; API routes guarded server-side)
- Inventory CRUD with low-stock alerts
- Scan & sell / restock by barcode (hardware-scanner friendly)
- Transaction history and period reports (daily / weekly / monthly)
- Responsive: bottom tab bar on mobile, sidebar on desktop

## Local development

1. Copy `.env.example` to `.env.local` and fill in the values (see below).
2. Install and run:

   ```bash
   npm install
   npm run dev
   ```

3. Open http://localhost:3000.

## Environment variables

All are required. See `.env.example` for the canonical list and the expected
Google Sheet tab/column layout.

| Variable | Purpose |
|---|---|
| `NEXTAUTH_SECRET` | Session encryption (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Canonical app URL (no trailing slash) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth client |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account with access to the sheet |
| `GOOGLE_PRIVATE_KEY` | Service-account key (keep the literal `\n` escapes) |
| `GOOGLE_SHEETS_ID` | Spreadsheet ID from its URL |

The Google Sheet must have two tabs with these header rows:

- **Products** — `id | barcode | name | category | stock | threshold | price | unit | notes | lastUpdated`
- **Transactions** — `id | date | productId | productName | type | quantity | notes`

Share the sheet with `GOOGLE_SERVICE_ACCOUNT_EMAIL` as an **Editor**.

## Deploying to Vercel

1. **Import the repo** into Vercel (framework auto-detected as Next.js; no build
   overrides needed). The API routes run on the Node.js serverless runtime,
   which `googleapis` requires — don't force the Edge runtime.

2. **Add environment variables** (Project → Settings → Environment Variables) for
   the Production environment. Use the same values as `.env.local`, **except**:

   - `NEXTAUTH_URL=https://fin-and-paws.vercel.app`
   - `GOOGLE_PRIVATE_KEY` — paste the key with its literal `\n` escapes intact
     (the app converts them to newlines at runtime).

3. **Update Google OAuth** (Google Cloud Console → APIs & Services → Credentials
   → your OAuth client):

   - **Authorized JavaScript origins:** `https://fin-and-paws.vercel.app`
   - **Authorized redirect URIs:** `https://fin-and-paws.vercel.app/api/auth/callback/google`

   Without the redirect URI, sign-in fails with `redirect_uri_mismatch`.

4. **Deploy.** After the first deploy, visit the URL and sign in to verify.

### Access control

Sign-in is restricted to an **email allowlist** in `lib/allowlist.ts`. Add the
emails (or whole domains like `@yourshop.com`) that may use the app — everyone
else is blocked at sign-in and sees an "account isn't authorised" message.

You can also set `ALLOWED_EMAILS` in Vercel (comma-separated) to add addresses
without editing code; both sources are merged.
