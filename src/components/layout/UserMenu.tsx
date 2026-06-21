'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import {
  User,
  Package,
  Truck,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { createClient } from '@/lib/supabase/client';
import { Drawer } from '@/components/ui/Drawer';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const MENU_ITEMS = [
  { label: 'My Profile', href: '/account/profile', icon: User },
  { label: 'My Orders', href: '/account/orders', icon: Package },
  { label: 'Track Order', href: '/account/track-order', icon: Truck },
  { label: 'Wishlist', href: '/account/wishlist', icon: Heart },
  { label: 'Settings', href: '/account/settings', icon: Settings },
] as const;

export function UserMenu() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const dropdownCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    dropdownCloseRef.current?.click();
    await supabase.auth.signOut();
    router.refresh();
    router.push('/');
  };

  const handleMobileLogout = async () => {
    setIsMobileOpen(false);
    await supabase.auth.signOut();
    router.refresh();
    router.push('/');
  };

  const initial = user?.email?.[0]?.toUpperCase() ?? '?';

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-0.5 sm:p-1 md:p-1.5">
        <div className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 rounded-full bg-zinc-700 animate-pulse" />
      </div>
    );
  }

  // ── Not logged in ───────────────────────────────────────────────────────────
  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="p-0.5 sm:p-1 md:p-1.5 text-zinc-400 hover:text-white transition-colors"
        aria-label="Sign in to your account"
      >
        <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
      </Link>
    );
  }

  // ── Logged in — Desktop dropdown ─────────────────────────────────────────────
  return (
    <>
      <div className="relative hidden lg:block">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className="flex items-center justify-center w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-gold text-black font-bold text-sm hover:bg-gold/90 transition-colors focus:outline-none focus:ring-2 focus:ring-gold/50 focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
              aria-label="Account menu"
            >
              {initial}
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="z-50 w-60 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
            >
              {/* User info header */}
              <div className="px-3 py-2.5 mb-1 border-b border-zinc-100 dark:border-zinc-800">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                  {user.email}
                </p>
              </div>

              {MENU_ITEMS.map((item) => (
                <DropdownMenu.Item key={item.label} asChild>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white transition-colors cursor-pointer outline-none"
                  >
                    <item.icon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                    {item.label}
                  </Link>
                </DropdownMenu.Item>
              ))}

              <DropdownMenu.Separator className="my-1 h-px bg-zinc-100 dark:bg-zinc-800" />

              <DropdownMenu.Item
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer outline-none"
                onSelect={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Hidden button to programmatically close dropdown */}
        <button ref={dropdownCloseRef} className="hidden" aria-hidden="true" />
      </div>

      {/* ── Mobile: avatar button opens drawer ─────────────────────────────────── */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-gold text-black font-bold text-[10px] sm:text-xs md:text-sm"
        aria-label="Open account menu"
      >
        {initial}
      </button>

      <Drawer
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        side="right"
        title="Account"
      >
        {/* User info */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gold text-black font-bold text-lg shrink-0">
            {initial}
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 truncate">
            {user.email}
          </p>
        </div>

        {/* Menu items */}
        <nav className="flex flex-col gap-1">
          {MENU_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center gap-4 px-4 py-3.5 rounded-lg text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
            >
              <item.icon className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
              <span className="flex-1 text-sm font-medium tracking-wide">
                {item.label}
              </span>
              <ChevronRight className="h-4 w-4 text-zinc-300 dark:text-zinc-600" />
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={handleMobileLogout}
            className="flex items-center gap-4 w-full px-4 py-3.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium tracking-wide">Logout</span>
          </button>
        </div>
      </Drawer>
    </>
  );
}
