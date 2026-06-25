// Next.js renamed the `middleware` convention to `proxy`. This file gates the
// app routes behind next-auth; unauthenticated users are sent to /login.
import nextAuthMiddleware from 'next-auth/middleware';

export { nextAuthMiddleware as proxy };
export default nextAuthMiddleware;

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/inventory/:path*',
    '/transactions/:path*',
    '/reports/:path*',
    '/scan/:path*',
  ],
};
