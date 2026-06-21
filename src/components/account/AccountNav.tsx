'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Package, Truck, Heart, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from '@/app/auth/actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { href: '/account/profile', label: 'My Profile', icon: User },
  { href: '/account/orders', label: 'My Orders', icon: Package },
  { href: '/account/track-order', label: 'Track Order', icon: Truck },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/account/settings', label: 'Settings', icon: Settings },
];

export function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    router.refresh();
  };

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors',
              isActive
                ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900'
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
      <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2" />
      <button
        onClick={handleSignOut}
        disabled={signingOut}
        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-500 hover:text-red-500 transition-colors disabled:opacity-50"
      >
        <LogOut className="h-4 w-4" />
        {signingOut ? 'Signing out...' : 'Sign Out'}
      </button>
    </nav>
  );
}
