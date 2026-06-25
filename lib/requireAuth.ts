import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from './auth';

/**
 * Guard for API route handlers. Returns a 401 response if there's no valid
 * session, or null if the request is authenticated (so the handler proceeds).
 *
 *   const unauth = await requireAuth();
 *   if (unauth) return unauth;
 *
 * Note: NextAuth's own /api/auth/* routes must NOT use this — gating them
 * would break the sign-in flow.
 */
export async function requireAuth(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
