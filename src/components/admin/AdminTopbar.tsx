'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';

const pageTitles: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/products': 'Products',
  '/admin/products/new': 'New Product',
  '/admin/categories': 'Categories',
  '/admin/collections': 'Collections',
  '/admin/inventory': 'Inventory',
  '/admin/analytics': 'Analytics',
  '/admin/media': 'Media Library',
  '/admin/discounts': 'Discounts',
  '/admin/orders': 'Orders',
  '/admin/customers': 'Customers',
  '/admin/content': 'Content Management',
  '/admin/settings': 'Settings',
};

export function AdminTopbar() {
  const pathname = usePathname();

  const title = Object.entries(pageTitles).find(([key]) => pathname.startsWith(key))?.[1] || 'Admin';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-lg font-semibold text-[#0A0A0A]">{title}</h1>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-[#C9A84C]/10 flex items-center justify-center text-sm font-semibold text-[#C9A84C]">
            A
          </div>
          <span className="text-sm font-medium text-[#0A0A0A] hidden sm:block">Admin</span>
        </div>
      </div>
    </header>
  );
}
