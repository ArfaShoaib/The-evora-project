"use client";

import * as React from "react";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { ProfileTab } from "@/components/account/ProfileTab";
import { OrdersTab } from "@/components/account/OrdersTab";
import { WishlistTab } from "@/components/account/WishlistTab";
import { SettingsTab } from "@/components/account/SettingsTab";

const tabs: Record<string, React.ComponentType> = {
  profile: ProfileTab,
  orders: OrdersTab,
  wishlist: WishlistTab,
  settings: SettingsTab,
};

export default function AccountPage() {
  const [activeTab, setActiveTab] = React.useState("profile");

  const ActiveComponent = tabs[activeTab] ?? ProfileTab;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-8 sm:mb-12">
        My Account
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <AccountSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </aside>

        {/* Content */}
        <main className="lg:col-span-3">
          <ActiveComponent />
        </main>
      </div>
    </div>
  );
}