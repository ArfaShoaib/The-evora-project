'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  Tag,
  BarChart2,
  Image,
  Percent,
  ShoppingCart,
  Users,
  Boxes,
  Settings,
  ChevronLeft,
  Store,
  Menu,
  X,
  FileText,
  LogOut,
  MessageSquare,
  RotateCcw,
  Mail,
  Images,
} from 'lucide-react';
import { adminSignOut } from '@/app/auth/actions';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/collections', label: 'Collections', icon: Store },
  { href: '/admin/hero-banners', label: 'Hero Banners', icon: Images },
  { href: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/refunds', label: 'Refunds', icon: RotateCcw },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
  { href: '/admin/newsletter', label: 'Newsletter', icon: Mail },
  { href: '/admin/discounts', label: 'Discounts', icon: Percent },
  { href: '/admin/media', label: 'Media', icon: Image },
  { href: '/admin/content', label: 'Content', icon: FileText },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const isActive = (href: string) =>
    pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href.split('/').slice(0, 3).join('/')));

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-[#0A0A0A] text-white hover:bg-[#0A0A0A]/80 transition-colors"
        aria-label="Open navigation menu"
      >
        <Menu className="size-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-[#0A0A0A] text-white flex flex-col transition-all duration-300',
          collapsed ? 'w-[68px]' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        role="navigation"
        aria-label="Admin navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10 shrink-0">
          {!collapsed && (
            <Link href="/admin/dashboard" className="font-serif text-lg font-bold tracking-[0.15em] text-[#C9A84C]">
              EVORA
            </Link>
          )}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-white/60 hover:text-white lg:hidden"
              aria-label="Close navigation menu"
            >
              <X className="size-4" />
            </button>
            <button
              onClick={onToggle}
              className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-white/60 hover:text-white hidden lg:block"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronLeft className={cn('size-4 transition-transform', collapsed && 'rotate-180')} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto" aria-label="Admin menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors relative',
                  active
                    ? 'bg-[#C9A84C]/10 text-[#C9A84C]'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                )}
                aria-current={active ? 'page' : undefined}
                title={collapsed ? item.label : undefined}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#C9A84C] rounded-r" />
                )}
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-white/10 shrink-0 space-y-0.5">
          <form action={async () => {
            await adminSignOut();
            window.location.replace('/admin/login');
          }}>
            <button
              type="submit"
              className="flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium text-white/60 hover:text-red-400 hover:bg-white/5 transition-colors w-full"
              title={collapsed ? 'Sign Out' : undefined}
            >
              <LogOut className="size-4 shrink-0" aria-hidden="true" />
              {!collapsed && <span>Sign Out</span>}
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
