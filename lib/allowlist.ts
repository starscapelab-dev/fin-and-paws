// ─── Who is allowed to sign in ───────────────────────────
// Add the email addresses (and/or whole domains) that may access the app.
// Anyone whose Google account is NOT listed here is blocked at sign-in.
//
//   • Exact emails:  'owner@gmail.com'
//   • Whole domains: '@finandpaws.com'   (every address at that domain)
//
// You can also set the ALLOWED_EMAILS env var in Vercel (comma-separated)
// to add more without editing code. Both sources are merged.

export const ALLOWED_EMAILS: string[] = [
  'akshayvt0487@gmail.com',
  'finandpaws@gmail.com',
  // '@yourshopdomain.com',
];

/** True if the given email is permitted to sign in. */
export function isAllowed(email?: string | null): boolean {
  if (!email) return false;
  const addr = email.trim().toLowerCase();

  const fromEnv = (process.env.ALLOWED_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const list = [...ALLOWED_EMAILS.map((e) => e.toLowerCase()), ...fromEnv];

  return list.some((entry) =>
    entry.startsWith('@') ? addr.endsWith(entry) : addr === entry
  );
}
