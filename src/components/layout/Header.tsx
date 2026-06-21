"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  UserCheck,
  Menu,
  X,
  ChevronDown,
  Package,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/context/cart-context";
import { useWishlist } from "@/lib/context/wishlist-context";
import { useCurrency, type Currency } from "@/lib/context/currency-context";
import { Drawer } from "@/components/ui/Drawer";
import { createClient } from "@/lib/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────

interface NavCategory {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
}

interface UserState {
  id: string;
  email: string;
}

// ─── Search Overlay ──────────────────────────────────────────────────────────

interface SearchProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  thumbnail: string | null;
  category: string | null;
}

function SearchOverlay({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchProduct[]>([]);
  const [loading, setLoading] = React.useState(false);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  // Click outside to close
  React.useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Escape key to close
  React.useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Debounced search
  const handleSearchChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select("id, name, slug, price, sale_price, thumbnail, category")
        .ilike("name", `%${value.trim()}%`)
        .eq("status", "published")
        .limit(8);
      setResults(data || []);
      setLoading(false);
    }, 300);
  };

  const handleProductClick = (slug: string) => {
    onClose();
    router.push(`/product/${slug}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-x-0 top-0 z-50 bg-[#111111] border-b border-white/10 shadow-lg"
        >
          <div ref={containerRef} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <form
              onSubmit={handleSubmit}
              className="flex items-center h-14 sm:h-16 lg:h-20 gap-4"
            >
              <Search className="h-5 w-5 text-white/50 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search for products..."
                className="flex-1 bg-transparent text-base sm:text-lg text-white placeholder-white/40 focus:outline-none font-sans"
              />
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-white/50 hover:text-white transition-colors"
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </button>
            </form>

            {/* Search Results Dropdown */}
            {query.trim().length >= 2 && (
              <div className="pb-4">
                {loading ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="h-5 w-5 border-2 border-white/30 border-t-[#D4AF37] rounded-full animate-spin" />
                  </div>
                ) : results.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {results.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleProductClick(product.slug)}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5 transition-colors text-left group"
                      >
                        <div className="w-12 h-14 bg-white/5 rounded overflow-hidden flex-shrink-0 relative">
                          {product.thumbnail && (
                            <Image
                              src={product.thumbnail}
                              alt={product.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white/90 truncate group-hover:text-[#D4AF37] transition-colors">
                            {product.name}
                          </p>
                          <p className="text-xs text-white/40 mt-0.5">
                            {product.category || "Uncategorized"}
                          </p>
                          <p className="text-xs font-medium text-[#D4AF37] mt-0.5">
                            {product.sale_price != null ? (
                              <>
                                <span className="line-through text-white/30 mr-1">
                                  PKR {product.price.toLocaleString()}
                                </span>
                                PKR {product.sale_price.toLocaleString()}
                              </>
                            ) : (
                              `PKR ${product.price.toLocaleString()}`
                            )}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-white/40 text-sm py-6">
                    No products found for &quot;{query}&quot;
                  </p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Cart Drawer ─────────────────────────────────────────────────────────────

function CartDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { items, itemCount, removeItem, updateQuantity } = useCart();
  const { formatPrice } = useCurrency();
  const [cartProducts, setCartProducts] = React.useState<
    Record<
      string,
      { name: string; price: number; image: string; slug: string } | undefined
    >
  >({});

  React.useEffect(() => {
    if (!isOpen || items.length === 0) return;
    const supabase = createClient();
    const ids = items.map((i) => i.productId);
    supabase
      .from("products")
      .select("id, name, price, slug, thumbnail")
      .in("id", ids)
      .then(({ data }) => {
        if (!data) return;
        const map: typeof cartProducts = {};
        data.forEach((p) => {
          map[p.id] = {
            name: p.name,
            price: p.price,
            image: p.thumbnail || "",
            slug: p.slug,
          };
        });
        setCartProducts(map);
      });
  }, [isOpen, items]);

  const subtotal = items.reduce((sum, item) => {
    const product = cartProducts[item.productId];
    return sum + (product?.price || 0) * item.quantity;
  }, 0);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} side="right" title={`Cart (${itemCount})`}>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ShoppingBag className="h-12 w-12 text-zinc-300 mb-4" />
          <p className="text-sm text-zinc-500">Your cart is empty</p>
          <Link
            href="/shop"
            onClick={onClose}
            className="mt-4 px-6 py-2.5 bg-[#111111] text-white text-xs tracking-[0.15em] uppercase hover:bg-[#D4AF37] transition-colors"
          >
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Cart Items - Scrollable */}
          <div className="flex-1 overflow-y-auto -mx-4 px-4">
            <div className="flex flex-col gap-4">
              {items.map((item) => {
                const product = cartProducts[item.productId];
                return (
                  <div
                    key={`${item.productId}-${item.size}-${item.color}`}
                    className="flex gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                  >
                    <div className="w-16 h-20 bg-zinc-100 dark:bg-zinc-800 flex-shrink-0 overflow-hidden rounded relative">
                      {product?.image && (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${product?.slug || item.productId}`}
                        onClick={onClose}
                        className="text-sm font-medium text-foreground hover:text-[#D4AF37] transition-colors truncate block"
                      >
                        {product?.name || "Product"}
                      </Link>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {item.size && `Size: ${item.size}`}
                        {item.size && item.color && " · "}
                        {item.color && `Color: ${item.color}`}
                      </p>
                      {product && (
                        <p className="text-xs font-medium text-[#D4AF37] mt-1">
                          {formatPrice(product.price)}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded">
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, Math.max(1, item.quantity - 1))
                            }
                            className="px-2 py-1 text-xs text-zinc-500 hover:text-foreground transition-colors"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-medium">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                            className="px-2 py-1 text-xs text-zinc-500 hover:text-foreground transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom: Subtotal + Buttons */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-zinc-600">Subtotal</span>
              <span className="text-sm font-bold text-foreground">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href="/checkout"
                onClick={onClose}
                className="block w-full text-center bg-[#D4AF37] text-white py-3 text-xs tracking-[0.15em] uppercase hover:bg-[#D4AF37]/90 transition-colors font-medium"
              >
                Checkout
              </Link>
              <Link
                href="/cart"
                onClick={onClose}
                className="block w-full text-center bg-[#111111] text-white py-3 text-xs tracking-[0.15em] uppercase hover:bg-[#111111]/80 transition-colors"
              >
                View Cart
              </Link>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}

// ─── Mobile Navigation Drawer ────────────────────────────────────────────────

function MobileNavDrawer({
  isOpen,
  onClose,
  categories,
  user,
}: {
  isOpen: boolean;
  onClose: () => void;
  categories: NavCategory[];
  user: UserState | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const parentCategories = categories.filter((c) => !c.parent_id);
  const [expandedCat, setExpandedCat] = React.useState<string | null>(null);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "New Arrivals", href: "/new-arrivals" },
    { name: "Best Sellers", href: "/best-sellers" },
    { name: "Sale", href: "/sale" },
  ];

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    onClose();
    router.push("/");
    router.refresh();
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} side="left" title="Menu">
      <nav className="flex flex-col gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className={cn(
              "px-3 py-2.5 text-sm font-medium tracking-wide rounded-md transition-colors",
              pathname === link.href
                ? "bg-[#D4AF37]/10 text-[#D4AF37]"
                : "text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-100"
            )}
          >
            {link.name}
          </Link>
        ))}

        <div className="my-2 border-t border-zinc-200 dark:border-zinc-700" />

        <p className="px-3 py-1.5 text-[10px] font-semibold tracking-[0.2em] uppercase text-zinc-500">
          Categories
        </p>
        {parentCategories.map((cat) => {
          const subcats = categories.filter((c) => c.parent_id === cat.id);
          const isExpanded = expandedCat === cat.id;
          return (
            <div key={cat.id}>
              <div className="flex items-center">
                <Link
                  href={`/shop/${cat.slug}`}
                  onClick={onClose}
                  className={cn(
                    "flex-1 px-3 py-2.5 text-sm font-medium tracking-wide rounded-md transition-colors",
                    pathname === `/shop/${cat.slug}`
                      ? "bg-[#D4AF37]/10 text-[#D4AF37]"
                      : "text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-100"
                  )}
                >
                  {cat.name}
                </Link>
                {subcats.length > 0 && (
                  <button
                    onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
                    className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    aria-label={`Expand ${cat.name}`}
                  >
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </button>
                )}
              </div>
              <AnimatePresence>
                {isExpanded && subcats.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {subcats.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/shop/${cat.slug}/${sub.slug}`}
                        onClick={onClose}
                        className="block pl-8 pr-3 py-2 text-sm text-zinc-600 hover:text-[#D4AF37] transition-colors dark:text-zinc-300"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        <div className="my-2 border-t border-zinc-200 dark:border-zinc-700" />

        {/* Account section */}
        {user ? (
          <>
            <Link
              href="/account"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium tracking-wide rounded-md text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-100 transition-colors"
            >
              <UserCheck className="h-4 w-4 text-[#D4AF37]" />
              My Account
            </Link>
            <Link
              href="/account/orders"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium tracking-wide rounded-md text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-100 transition-colors"
            >
              <Package className="h-4 w-4 text-zinc-400" />
              Orders
            </Link>
            <Link
              href="/wishlist"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium tracking-wide rounded-md text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-100 transition-colors"
            >
              <Heart className="h-4 w-4 text-zinc-400" />
              Wishlist
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium tracking-wide rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </>
        ) : (
          <Link
            href="/auth/login"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium tracking-wide rounded-md text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-100 transition-colors"
          >
            <User className="h-4 w-4 text-zinc-400" />
            Login / Register
          </Link>
        )}
      </nav>
    </Drawer>
  );
}

// ─── Desktop Category Dropdown ───────────────────────────────────────────────

function CategoryDropdown({
  categories,
}: {
  categories: NavCategory[];
}) {
  const [open, setOpen] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const parentCategories = categories.filter((c) => !c.parent_id);

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        className="flex items-center gap-1 text-[11px] font-medium tracking-[0.15em] uppercase text-white/80 hover:text-[#D4AF37] transition-colors py-2"
      >
        Shop
        <ChevronDown
          className={cn(
            "h-3 w-3 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 pt-2 z-50"
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
          >
            <div className="bg-[#111111] border border-white/10 shadow-xl rounded-sm min-w-[480px] py-3">
              {/* All Products */}
              <Link
                href="/shop"
                onClick={() => setOpen(false)}
                className="block px-5 py-2.5 text-sm font-medium text-white hover:bg-white/5 hover:text-[#D4AF37] transition-colors"
              >
                All Products
              </Link>
              <div className="border-t border-white/10 my-2" />

              {/* Categories with subcategories */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 px-3">
                {parentCategories.map((cat) => {
                  const subcats = categories.filter((c) => c.parent_id === cat.id);
                  return (
                    <div key={cat.id} className="py-1.5">
                      <Link
                        href={`/shop/${cat.slug}`}
                        onClick={() => setOpen(false)}
                        className="block text-sm font-medium text-white hover:text-[#D4AF37] transition-colors"
                      >
                        {cat.name}
                      </Link>
                      {subcats.length > 0 && (
                        <div className="mt-1 flex flex-col gap-0.5">
                          {subcats.map((sub) => (
                            <Link
                              key={sub.id}
                              href={`/shop/${cat.slug}/${sub.slug}`}
                              onClick={() => setOpen(false)}
                              className="block pl-3 py-1 text-xs text-white/50 hover:text-[#D4AF37] transition-colors"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Currency Switcher ───────────────────────────────────────────────────────

function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div
      className="relative hidden sm:block"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold tracking-wider text-white/80 border border-white/20 rounded-sm hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
      >
        {currency}
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full right-0 mt-1 z-50"
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
          >
            <div className="bg-[#111111] border border-white/10 shadow-xl rounded-sm min-w-[80px] py-1">
              {(["PKR", "USD"] as Currency[]).map((c) => (
                <button
                  key={c}
                  onClick={() => { setCurrency(c); setOpen(false); }}
                  className={cn(
                    "block w-full text-left px-4 py-2 text-xs font-medium tracking-wider transition-colors",
                    currency === c
                      ? "text-[#D4AF37] bg-white/5"
                      : "text-white/60 hover:text-[#D4AF37] hover:bg-white/5"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Account Dropdown (Desktop) ──────────────────────────────────────────────

function AccountDropdown({ user }: { user: UserState | null }) {
  const [open, setOpen] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  };

  // Not logged in — simple link
  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="hidden sm:block p-2 text-white/80 hover:text-[#D4AF37] transition-colors"
        aria-label="Account"
      >
        <User className="h-5 w-5" />
      </Link>
    );
  }

  // Logged in — hover dropdown
  const menuItems = [
    { name: "My Account", href: "/account", icon: User },
    { name: "Orders", href: "/account/orders", icon: Package },
    { name: "Wishlist", href: "/wishlist", icon: Heart },
  ];

  return (
    <div
      className="relative hidden sm:block"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        className="p-2 text-[#D4AF37] transition-colors"
        aria-label="Account"
      >
        <UserCheck className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 pt-2 z-50"
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
          >
            <div className="bg-[#111111] border border-white/10 shadow-xl rounded-sm min-w-[200px] py-2">
              <div className="px-4 py-2 border-b border-white/10 mb-1">
                <p className="text-[10px] text-white/40 tracking-wider uppercase">Signed in as</p>
                <p className="text-xs text-white/80 truncate mt-0.5">{user.email}</p>
              </div>
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:bg-white/5 hover:text-[#D4AF37] transition-colors"
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
              <div className="border-t border-white/10 my-1" />
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-white/60 hover:bg-white/5 hover:text-red-400 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Header ─────────────────────────────────────────────────────────────

export function Header() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [cartOpen, setCartOpen] = React.useState(false);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [categories, setCategories] = React.useState<NavCategory[]>([]);
  const [user, setUser] = React.useState<UserState | null>(null);

  // Fetch categories
  React.useEffect(() => {
    const supabase = createClient();
    supabase
      .from("categories")
      .select("id, name, slug, parent_id")
      .order("name")
      .then(({ data }) => {
        if (data) setCategories(data);
      });
  }, []);

  // Fetch auth user
  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email ?? "" });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email ?? "" });
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Scroll shadow
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close overlays on route change
  const prevPathnameRef = React.useRef(pathname);
  React.useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      setSearchOpen(false);
      setMobileNavOpen(false);
    }
  }, [pathname]);

  const navLinks = [
    { name: "New Arrivals", href: "/new-arrivals" },
    { name: "Best Sellers", href: "/best-sellers" },
    { name: "Collections", href: "/collections" },
    { name: "Sale", href: "/sale" },
  ];

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 bg-[#111111] transition-shadow duration-300",
          scrolled && "shadow-lg shadow-black/20"
        )}
      >
        {/* Main Nav Row */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-[72px]">
            {/* Left: Hamburger (mobile) + Logo */}
            <div className="flex items-center gap-3 lg:gap-0">
              <button
                onClick={() => setMobileNavOpen(true)}
                className="lg:hidden p-2 -ml-2 text-white/80 hover:text-[#D4AF37] transition-colors"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              <Link href="/" className="flex items-center gap-3">
                <Image
                  src="/logo.svg"
                  alt="EVORA"
                  width={120}
                  height={36}
                  className="h-8 sm:h-9 w-auto"
                  priority
                />
              </Link>
            </div>

            {/* Center: Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <CategoryDropdown categories={categories} />
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-[11px] font-medium tracking-[0.15em] uppercase transition-colors py-2",
                    pathname === link.href
                      ? "text-[#D4AF37]"
                      : "text-white/80 hover:text-[#D4AF37]"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Right: Currency + Icons */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
              {/* Currency Switcher */}
              <CurrencySwitcher />

              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-white/80 hover:text-[#D4AF37] transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Account — dropdown if logged in, link if not */}
              <AccountDropdown user={user} />

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="relative p-2 text-white/80 hover:text-[#D4AF37] transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-4 min-w-[16px] px-1 bg-[#D4AF37] text-white text-[9px] font-bold rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 text-white/80 hover:text-[#D4AF37] transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-4 min-w-[16px] px-1 bg-[#D4AF37] text-white text-[9px] font-bold rounded-full">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Overlays */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <MobileNavDrawer
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        categories={categories}
        user={user}
      />
    </>
  );
}
