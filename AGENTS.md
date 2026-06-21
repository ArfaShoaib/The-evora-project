# EVORA — Agent Guide

## Project State

Phase 1 & 2 complete. Layout shell (Header, Footer, Drawer), all public pages (home, shop, product, cart, checkout, account, auth, static pages), and bonus pages (new-arrivals, sale, collections, wishlist, best-sellers, trending, track-order, stores) built with mock data. Supabase schema and types defined but no data fetching wired. Ready for Phase 3 (Supabase setup) or Phase 5 (admin panel).

## Commands

- `npm run dev` — start dev server (port 3000)
- `npm run build` — production build
- `npm run lint` — ESLint (flat config, eslint-config-next)
- No test runner configured. No typecheck script (use `npx tsc --noEmit`).

## Stack Gotchas

- **Tailwind v4** — uses `@tailwindcss/postcss` plugin and CSS-native config in `globals.css` (`@theme inline`). The `tailwind.config.js` has corrupted content and is not the source of truth. Use CSS variables in `globals.css` for theme tokens.
- **Shadcn UI** — "new-york" style, RSC-enabled, lucide icons. Components go in `src/components/ui/`, utilities in `src/lib/utils.ts` (exports `cn()` helper).
- **Next.js 16** (16.2.9) — App Router, React 19. Not Next.js 15 as some docs claim.

## File Structure

```
src/
  app/
    layout.tsx          # Root layout — fonts, Header, Footer, announcement bar
    page.tsx            # Home (placeholder hero)
    globals.css         # Tailwind v4 theme tokens + CSS variables
    auth/               # Auth pages (NO global Header/Footer)
      layout.tsx        # Minimal auth layout
      login/page.tsx
      register/page.tsx
      forgot-password/page.tsx
      verify-email/page.tsx
      actions.ts        # Server actions for auth
  components/
    layout/Header.tsx   # Sticky nav, mobile menu, cart drawer, search overlay
    layout/Footer.tsx   # Newsletter, links, social
    ui/Drawer.tsx       # Reusable slide-in drawer (left/right)
  lib/
    utils.ts            # cn() — clsx + tailwind-merge
    supabase/
      server.ts         # createClient() for Server Components/Actions
      client.ts         # createClient() for Client Components (browser)
      middleware.ts     # updateSession() — auth refresh + route protection
  types/
    supabase.ts         # Database types (profiles, products, categories, orders, etc.)
supabase/
  migrations/           # SQL migrations
```

## Conventions

- **Auth routes** live under `/auth/*`, not `/login`, `/register`. Middleware redirects unauthenticated users from `/dashboard` and `/admin` to `/auth/login`.
- **Fonts**: Playfair Display (`--font-playfair`, serif) for headings. Inter (`--font-inter`, sans) for body. Loaded via `next/font/google` in root layout.
- **Color tokens**: gold `#D4AF37`, black `#000000`, dark `#111111`, bg `#F8F8F8`, muted `#B0B0B0`. Use CSS variables from `globals.css`, not hardcoded hex.
- **Path alias**: `@/*` maps to `./src/*`.
- **Dark mode**: Supported via `.dark` class (Tailwind `darkMode: 'class'`).
- **Animations**: Framer Motion for drawers, hover states, page transitions.

## Supabase

- Env vars required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Server client: `import { createClient } from '@/lib/supabase/server'`
- Browser client: `import { createClient } from '@/lib/supabase/client'`
- Middleware refreshes auth session on every request. Do not remove `supabase.auth.getUser()` call in middleware.

## Database Tables

profiles, categories, products, product_variants, orders, order_items, reviews, wishlists, coupons. See `src/types/supabase.ts` for full schema.

---

# Build Specification

Tech stack: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Shadcn UI + Framer Motion + Supabase (Postgres, Auth, Storage), deployed on Vercel.

Build in this order, one phase at a time — confirm each phase works before moving to the next.

## Phase 1 — Project setup & design system

- [x] Set up Tailwind config with EVORA's color tokens (gold: #D4AF37, black: #000000, dark: #111111, bg: #F8F8F8, white: #FFFFFF, muted: #B0B0B0)
- [x] Configure fonts: Playfair Display (headings/display) and Inter (body/UI), loaded via next/font
- [x] Set up Shadcn UI base components
- [x] Create shared layout components: Header (announcement bar + nav), Footer

## Phase 2 — Public pages (frontend, static/mock data first)

Build these routes using mock/dummy data:

- [x] `/` — Home page with all sections: announcement bar, hero, new arrivals, featured collections, best sellers, trending products, seasonal collection, sale banner, about, testimonials, Instagram gallery, newsletter, footer
- [x] `/shop` — product grid with search, category filter, price filter, sort, pagination
- [x] `/product/[slug]` — product details page (gallery with zoom, description, sizes/colors, price, stock status, add to cart, buy now, related products)
- [x] `/cart` — cart page with quantity controls, remove item, coupon input, shipping estimate, summary
- [x] `/checkout` — shipping/billing forms, order summary, payment method, place order
- [x] `/account` (dashboard) — profile, orders, address book, wishlist, settings
- [x] `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/verify-email`
- [x] `/about`, `/contact`, `/faq`, `/privacy-policy`, `/terms`, `/shipping-policy`, `/returns`
- [x] `/new-arrivals`, `/sale`, `/collections`, `/wishlist`, `/best-sellers`, `/trending`, `/track-order`, `/stores` (bonus pages)

## Phase 3 — Supabase setup

- Create database schema for: users, products, categories, orders, order_items, coupons, reviews (use the fields listed in AGENTS.md, add created_at/updated_at and proper foreign keys)
- Set up Supabase Auth (email/password) and connect to login/register/dashboard pages
- Password handling: Use Supabase Auth's built-in authentication (which handles bcrypt password hashing internally) — never store or handle plaintext passwords manually. Do not create a custom password column in the users table for auth purposes; rely on auth.users managed by Supabase. If a custom users/profiles table is needed for app-specific fields (name, role, etc.), link it via id (foreign key to auth.users.id) and exclude password fields entirely.
- If any custom auth flow or password reset logic is implemented outside Supabase Auth, passwords must be hashed using bcrypt (minimum 10 salt rounds) before storage — never store plaintext or reversible-encrypted passwords.
- Set up Supabase Storage buckets for product images and banners
- Add Row Level Security policies (customers can only access their own orders/wishlist/addresses; admins have full access via role check)

## Phase 4 — Connect frontend to real data

- Replace mock data with Supabase queries (server components for product listings, server actions for cart/checkout/auth)
- Implement wishlist, reviews, order tracking, address management tied to logged-in user

## Phase 5 — Admin panel (/admin)

Protected by role = admin. Build:

- Dashboard (revenue, orders, customers, products stats + recent orders + low stock alerts + sales chart)
- Product management (CRUD, variants, sizes, colors, images, status toggle)
- Category management (CRUD)
- Inventory management (stock updates, low stock alerts)
- Media library (upload/delete images, manage hero banners)
- Discount/coupon management (percentage, fixed, flash sales, seasonal sales)
- Order management (view, update status: pending/processing/shipped/delivered/cancelled)
- Customer management (view accounts + purchase history)
- Content management (homepage banners, promo sections, featured collections, seasonal campaigns)

## Phase 6 — Polish

- Framer Motion micro-animations (fade-ins, hover states, page transitions)
- Mobile-first responsive QA on every page
- Accessibility pass (keyboard nav, alt text, focus states, contrast)
- SEO: metadata, sitemap, og tags, image optimization with next/image
- Performance: lazy loading, code splitting, caching strategies

---

## Design Direction

Black & gold luxury theme, large fashion photography, generous white space, clean grid layouts — inspired by Lama Retail's elegance, Beachtree's visual energy, and Lulusar's modern fashion UX. Maintain consistency with the existing Hero section already built.

## Brand Spec

See `CLAUDE.md` and `instruction.md` for full brand identity, color system, typography, page requirements, and admin panel spec. Those files are the source of truth for feature requirements.
