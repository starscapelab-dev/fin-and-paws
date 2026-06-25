import { LayoutDashboard, Package, ScanLine, ArrowLeftRight, BarChart2 } from 'lucide-react';

export const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/inventory', icon: Package, label: 'Stock' },
  { href: '/scan', icon: ScanLine, label: 'Scan' },
  { href: '/transactions', icon: ArrowLeftRight, label: 'Sales' },
  { href: '/reports', icon: BarChart2, label: 'Reports' },
] as const;
