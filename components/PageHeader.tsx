'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import clsx from 'clsx';

/**
 * Modern app header — a brand gradient surface with a soft glow, safe-area-aware
 * top padding, and an optional "floating card" slot whose content overlaps the
 * bottom edge of the gradient (the glass-card look). Used on every page so the
 * header treatment stays consistent.
 *
 *  - `eyebrow`  small label above the title (e.g. "Welcome back,")
 *  - `right`    element pinned top-right (sign-out, action button…)
 *  - `inHeader` content rendered inside the gradient, under the title
 *  - `floating` content rendered in a white card overlapping the bottom edge
 */
export default function PageHeader({
  title,
  eyebrow,
  subtitle,
  back = false,
  right,
  inHeader,
  floating,
}: {
  title: React.ReactNode;
  eyebrow?: string;
  subtitle?: React.ReactNode;
  back?: boolean;
  right?: React.ReactNode;
  inHeader?: React.ReactNode;
  floating?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <div className={clsx(floating && 'mb-2')}>
      <div
        className={clsx(
          'header-surface text-white pt-safe px-5 sm:px-6 rounded-b-[2rem]',
          'md:mx-4 md:mt-4 md:rounded-3xl md:pt-8',
          floating ? 'pb-12 md:pb-10' : 'pb-7'
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {back && (
              <button
                onClick={() => router.back()}
                className="-ml-1 p-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 transition shrink-0"
                aria-label="Go back"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div className="min-w-0">
              {eyebrow && <p className="text-white/70 text-[13px] font-medium">{eyebrow}</p>}
              <h1 className="text-[22px] sm:text-2xl font-extrabold tracking-tight leading-tight truncate">
                {title}
              </h1>
              {subtitle && <p className="text-white/65 text-xs mt-1">{subtitle}</p>}
            </div>
          </div>
          {right && <div className="shrink-0">{right}</div>}
        </div>

        {inHeader && <div className="mt-4">{inHeader}</div>}
      </div>

      {/* Floating card overlapping the gradient's bottom edge. */}
      {floating && (
        <div className="px-4 sm:px-6 -mt-8 relative z-10">
          <div className="bg-white rounded-2xl shadow-card p-3 sm:p-4">{floating}</div>
        </div>
      )}
    </div>
  );
}
