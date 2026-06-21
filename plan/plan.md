# Phase 2 Implementation Plan — Public Pages

## Overview

Build all public-facing routes with mock data. Auth pages already exist under `/auth/*`. Focus on home page sections, shop, product details, cart, checkout, account dashboard, and static pages.

## Existing Patterns to Follow

- **Auth pages** use `'use client'`, `useTransition`, server actions from `actions.ts`
- **Styling**: Tailwind utility classes, hardcoded color hex (`#D4AF37`, `#111111`, `#B0B0B0`, `#F8F8F8`)
- **Fonts**: `font-serif` for headings, default sans for body
- **Layout**: Auth pages have their own layout (no Header/Footer). All other pages inherit root layout.
- **Components**: `src/components/ui/` for reusable, `src/components/layout/` for structural

---

## Task Breakdown

### Section A: Foundation

- [ ] **A1. Create mock data file** — `src/lib/mock-data.ts` with products (12+), categories (6+), testimonials (4+), collections (4+). Each product: id, name, slug, price, salePrice, images[], category, sizes[], colors[], stock, rating, description.
- [ ] **A2. Install Shadcn components** — Run `npx shadcn@latest add button input badge separator select slider skeleton`. Verify they compile.
- [ ] **A3. Install pagination component** — `npx shadcn@latest add pagination` or build custom if unavailable.
- [ ] **A4. Build ProductCard component** — `src/components/ui/ProductCard.tsx`. Reusable tile: image, name, category, price (with sale strike-through), hover overlay with "Quick View" + "Add to Bag". Uses `next/image` and `next/link`.
- [ ] **A5. Build SectionHeader component** — `src/components/ui/SectionHeader.tsx`. Props: title, subtitle. Renders gold accent line + heading + optional subtitle.
- [ ] **A6. Build PriceDisplay component** — `src/components/ui/PriceDisplay.tsx`. Props: price, salePrice. Formats currency, shows strike-through when on sale.

### Section B: Home Page

- [ ] **B1. Rewrite Hero section** — Enhance existing hero in `src/app/page.tsx`. Ensure CTA links to `/shop`. Keep existing styling.
- [ ] **B2. Build New Arrivals section** — Server component. Fetch 4 products from mock data, render in 4-column grid using ProductCard.
- [ ] **B3. Build Featured Collections section** — 2x2 grid of collection cards with image overlay, name, and "Shop Now" link.
- [ ] **B4. Build Best Sellers section** — 4-column grid of top-rated products. Optional: horizontal scroll on mobile.
- [ ] **B5. Build Trending Products section** — 4-column grid, different products from Best Sellers.
- [ ] **B6. Build Seasonal Collection banner** — Full-width section with background image, overlay text, CTA button.
- [ ] **B7. Build Sale Banner** — Promotional section with countdown-style layout, gold accents, "Shop Sale" CTA.
- [ ] **B8. Build About EVORA section** — Two-column: text left, image right. Brand story snippet with "Read More" link to `/about`.
- [ ] **B9. Build Testimonials section** — Carousel or grid of customer quotes. Client component for navigation.
- [ ] **B10. Build Instagram Gallery section** — 6-image grid with hover overlay showing Instagram icon + follower count.
- [ ] **B11. Build inline Newsletter section** — Email signup form (duplicate of Footer's, but inline on home page).
- [ ] **B12. Assemble Home page** — Compose all sections in `src/app/page.tsx`. Verify full page renders correctly.

### Section C: Shop Page

- [ ] **C1. Create shop layout** — `src/app/shop/page.tsx` with sidebar + main content area. Responsive: sidebar collapses on mobile.
- [ ] **C2. Build FilterSidebar component** — `src/components/shop/FilterSidebar.tsx`. Sections: Category (checkboxes), Price Range (min/max inputs or slider), Size (button group), Color (swatch group).
- [ ] **C3. Build SortSelect component** — `src/components/shop/SortSelect.tsx`. Dropdown: Newest, Price: Low to High, Price: High to Low, Bestselling.
- [ ] **C4. Build ProductGrid component** — `src/components/shop/ProductGrid.tsx`. Responsive grid (2 cols mobile, 3 tablet, 4 desktop). Uses ProductCard.
- [ ] **C5. Build shop Pagination** — `src/components/shop/Pagination.tsx`. Page numbers with prev/next. Reads `?page=` from URL.
- [ ] **C6. Wire URL query params** — Sync filters, sort, page to URL search params. Read params on server, pass to components.
- [ ] **C7. Build shop page** — Compose FilterSidebar + SortSelect + ProductGrid + Pagination. Filter mock data based on active params.
- [ ] **C8. Add mobile filter drawer** — On mobile, filters slide in from left (use existing Drawer component). "Filters" button triggers it.

### Section D: Product Detail Page

- [ ] **D1. Create product page route** — `src/app/product/[slug]/page.tsx`. Generate static params from mock data. 404 for unknown slugs.
- [ ] **D2. Build ImageGallery component** — `src/components/product/ImageGallery.tsx`. Main image + thumbnail strip. Click thumbnail to change main. Hover to zoom (CSS transform).
- [ ] **D3. Build SizeSelector component** — `src/components/product/SizeSelector.tsx`. Button group from product.sizes[]. Selected state with gold border.
- [ ] **D4. Build ColorSelector component** — `src/components/product/ColorSelector.tsx`. Circular swatches from product.colors[]. Selected state with ring.
- [ ] **D5. Build StockStatus component** — `src/components/product/StockStatus.tsx`. Shows "In Stock" (green), "Low Stock" (amber), or "Out of Stock" (red).
- [ ] **D6. Build AddToCart component** — `src/components/product/AddToCart.tsx`. Quantity selector + "Add to Bag" button + "Buy Now" button. Client component with state.
- [ ] **D7. Build product page** — Compose ImageGallery + product info + SizeSelector + ColorSelector + StockStatus + AddToCart. Two-column layout (gallery left, info right).
- [ ] **D8. Build RelatedProducts section** — 4-column grid of products from same category. Shown below main product info.

### Section E: Cart Page

- [ ] **E1. Create cart page route** — `src/app/cart/page.tsx`. Two-column: items list left, summary right.
- [ ] **E2. Build CartItem component** — `src/components/cart/CartItem.tsx`. Row with: image, name, size/color, quantity controls (+/-), price, remove button.
- [ ] **E3. Build CartSummary component** — `src/components/cart/CartSummary.tsx`. Subtotal, shipping estimate, total, "Proceed to Checkout" button, "Continue Shopping" link.
- [ ] **E4. Build CouponInput component** — `src/components/cart/CouponInput.tsx`. Text input + "Apply" button. Mock validation.
- [ ] **E5. Build ShippingEstimate component** — `src/components/cart/ShippingEstimate.tsx`. Radio options: Standard (free over $250), Express ($15), Next Day ($25).
- [ ] **E6. Assemble Cart page** — Compose CartItem list + CouponInput + ShippingEstimate + CartSummary. Empty state when cart is empty.

### Section F: Checkout Page

- [ ] **F1. Create checkout page route** — `src/app/checkout/page.tsx`. Two-column: form left, order summary right.
- [ ] **F2. Build ShippingForm component** — `src/components/checkout/ShippingForm.tsx`. Fields: firstName, lastName, email, phone, address, city, state, zip, country. Uses Shadcn Input.
- [ ] **F3. Build BillingForm component** — `src/components/checkout/BillingForm.tsx`. Same fields as Shipping. "Same as shipping" checkbox to auto-fill.
- [ ] **F4. Build PaymentMethod component** — `src/components/checkout/PaymentMethod.tsx`. Mock radio: Credit Card, PayPal, Apple Pay. Card fields (disabled/placeholder).
- [ ] **F5. Build OrderSummary component** — `src/components/checkout/OrderSummary.tsx`. Items list, subtotal, shipping, tax, total. Sticky on desktop.
- [ ] **F6. Build PlaceOrder component** — `src/components/checkout/PlaceOrder.tsx`. Button + terms checkbox. Shows confirmation modal on click.
- [ ] **F7. Assemble Checkout page** — Compose ShippingForm + BillingForm + PaymentMethod + OrderSummary + PlaceOrder. Form validation with state.

### Section G: Account Dashboard

- [ ] **G1. Create account page route** — `src/app/account/page.tsx`. Check auth (mock), redirect if not logged in. Sidebar + content layout.
- [ ] **G2. Build AccountSidebar component** — `src/components/account/AccountSidebar.tsx`. Nav links: Profile, Orders, Address Book, Wishlist, Settings. Active state styling.
- [ ] **G3. Build ProfileTab component** — `src/components/account/ProfileTab.tsx`. Display/edit name, email, avatar. Save button.
- [ ] **G4. Build OrdersTab component** — `src/components/account/OrdersTab.tsx`. Table of mock orders: date, order number, status, total, "View" link.
- [ ] **G5. Build AddressBookTab component** — `src/components/account/AddressBookTab.tsx`. List of saved addresses. "Add New Address" button. Edit/delete actions.
- [ ] **G6. Build WishlistTab component** — `src/components/account/WishlistTab.tsx`. Grid of wishlisted products using ProductCard. "Remove" button on each.
- [ ] **G7. Build SettingsTab component** — `src/components/account/SettingsTab.tsx`. Email preferences, password change, delete account.
- [ ] **G8. Assemble Account page** — Wire sidebar to content area. Tab switching with state (or route-based).

### Section H: Static Pages

- [ ] **H1. Build About page** — `src/app/about/page.tsx`. Brand story, mission, team section, values. Server component with metadata.
- [ ] **H2. Build Contact page** — `src/app/contact/page.tsx`. Contact form (name, email, subject, message) + contact info (email, phone, address).
- [ ] **H3. Build FAQ page** — `src/app/faq/page.tsx`. Accordion sections: Orders, Shipping, Returns, Account, Payments. Client component for expand/collapse.
- [ ] **H4. Build Privacy Policy page** — `src/app/privacy-policy/page.tsx`. Static legal content.
- [ ] **H5. Build Terms page** — `src/app/terms/page.tsx`. Static legal content.
- [ ] **H6. Build Shipping Policy page** — `src/app/shipping-policy/page.tsx`. Shipping options, timelines, international info.
- [ ] **H7. Build Returns page** — `src/app/returns/page.tsx`. Return policy, process steps, exceptions.

### Section I: Verification

- [ ] **I1. Run `npm run build`** — Ensure no build errors across all new pages.
- [ ] **I2. Run `npm run lint`** — Fix any lint errors.
- [ ] **I3. Visual QA — Home page** — Check all 11 sections render correctly on mobile/tablet/desktop.
- [ ] **I4. Visual QA — Shop page** — Test filters, sort, pagination, mobile filter drawer.
- [ ] **I5. Visual QA — Product detail** — Test image gallery, size/color selectors, add to cart.
- [ ] **I6. Visual QA — Cart** — Test quantity controls, remove, coupon, shipping estimate.
- [ ] **I7. Visual QA — Checkout** — Test form validation, same-as-shipping, place order flow.
- [ ] **I8. Visual QA — Account** — Test all tabs render correctly.
- [ ] **I9. Visual QA — Static pages** — Verify all 7 pages render with correct content.
- [ ] **I10. Navigation test** — Click through all nav links, footer links, CTAs. Ensure no broken routes.

---

## Implementation Order

1. Section A (Foundation) — do first, everything depends on it
2. Section B (Home Page) — largest section, most visible
3. Section C (Shop Page) — core e-commerce flow
4. Section D (Product Detail) — depends on Shop
5. Section E (Cart Page) — depends on Product Detail
6. Section F (Checkout Page) — depends on Cart
7. Section G (Account Dashboard) — independent, can parallelize with E/F
8. Section H (Static Pages) — independent, can parallelize anytime
9. Section I (Verification) — after all sections complete
