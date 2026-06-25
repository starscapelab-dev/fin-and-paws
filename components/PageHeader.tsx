'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

/**
 * Gradient page header. On mobile it spans full width with safe-area top
 * padding; on desktop it sits inside the content column as a rounded banner.
 */
export default function PageHeader({
  title,
  subtitle,
  back = false,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <div className="bg-brand-gradient text-white px-4 sm:px-6 pt-12 md:pt-8 pb-6 md:mx-4 md:mt-4 md:rounded-3xl md:pb-7">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {back && (
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 transition-colors shrink-0"
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight truncate">{title}</h1>
            {subtitle && <p className="text-white/70 text-xs sm:text-sm mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {right}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
