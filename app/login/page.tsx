'use client';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-brand-gradient flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-coral-400/30 blur-3xl" />

      <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center animate-rise">
        <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center text-3xl mx-auto mb-5 shadow-pop">
          🐾
        </div>
        <h1 className="text-2xl font-extrabold text-ink tracking-tight">Fin &amp; Paws</h1>
        <p className="text-muted text-sm mb-8">Inventory Management</p>

        <button
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          className="w-full bg-ink hover:opacity-90 text-white font-semibold py-3.5 px-4 rounded-2xl transition flex items-center justify-center gap-3 active:scale-[0.99]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.2 35.3 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.6 5.1C9.6 39.6 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.6l6.3 5.2C41.4 36.4 44 30.7 44 24c0-1.3-.1-2.3-.4-3.5z"/>
          </svg>
          Sign in with Google
        </button>

        <p className="text-xs text-muted/70 mt-6">Secure sign-in · authorised staff only</p>
      </div>

      <p className="relative text-white/60 text-xs mt-6">© {new Date().getFullYear()} Fin &amp; Paws</p>
    </div>
  );
}
