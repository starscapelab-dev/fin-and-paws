import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

/**
 * Responsive app frame: persistent sidebar on desktop (md+), bottom tab bar on
 * mobile. Page content is centered with a comfortable max width and given room
 * for the mobile nav bar.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas md:flex">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-24 md:pb-10">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </main>
      <BottomNav />
    </div>
  );
}
