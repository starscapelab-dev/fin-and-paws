import { LayoutDashboard, Package, ShoppingCart, ArrowLeftRight, BarChart2 } from 'lucide-react';

export const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/inventory', icon: Package, label: 'Stock' },
  { href: '/sell', icon: ShoppingCart, label: 'Sell' },
  { href: '/transactions', icon: ArrowLeftRight, label: 'Sales' },
  { href: '/reports', icon: BarChart2, label: 'Reports' },
] as const;
