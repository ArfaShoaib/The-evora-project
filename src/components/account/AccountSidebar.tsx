"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { User, Package, Heart, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/auth/actions";

const navItems = [
  { id: "profile", label: "Profile", icon: User },
  { id: "orders", label: "Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "settings", label: "Settings", icon: Settings },
];

interface AccountSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AccountSidebar({ activeTab, onTabChange }: AccountSidebarProps) {
  const router = useRouter();
  const [signingOut, setSigningOut] = React.useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    router.refresh();
  };

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors",
              activeTab === item.id
                ? "bg-gold/10 text-gold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </button>
        );
      })}
      <div className="h-px bg-border my-2" />
      <button
        onClick={handleSignOut}
        disabled={signingOut}
        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50"
      >
        <LogOut className="size-4" />
        {signingOut ? "Signing out..." : "Sign Out"}
      </button>
    </nav>
  );
}