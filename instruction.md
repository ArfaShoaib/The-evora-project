# EVORA - E-Commerce Platform Development Instructions

## Project Overview

**Brand Name:** EVORA

**Tagline:** The Art of Everyday Luxury

EVORA is a premium fashion and lifestyle e-commerce brand inspired by the clean luxury of Lama Retail, the visual engagement of Beachtree, and the modern fashion-forward experience of Lulusar.

The website should combine:

* Premium luxury aesthetics
* Modern e-commerce functionality
* High conversion-focused UX
* Mobile-first responsive design
* International-level design standards
* Complete Admin Management System

---

# Technology Stack

## Frontend

* Next.js 15
* TypeScript
* Tailwind CSS
* Shadcn UI
* Framer Motion

## Backend

* Next.js Server Actions
* Next.js API Routes

## Database

* Supabase PostgreSQL

## Authentication

* Supabase Auth

## Storage

* Supabase Storage

## Deployment

* Vercel

---

# Brand Identity

## Brand Personality

* Premium
* Elegant
* Modern
* Minimal
* Luxury
* Fashion-Oriented

---

# Color System

## Primary Color

Luxury Gold

```css
#D4AF37
```

## Secondary Color

Pure Black

```css
#000000
```

## Dark Surface

```css
#111111
```

## Background

```css
#F8F8F8
```

## White

```css
#FFFFFF
```

## Muted Text

```css
#B0B0B0
```

---

# Typography

## Primary Font

Playfair Display

Usage:

* Logo Support
* Hero Headings
* Collection Titles
* Luxury Statements

## Secondary Font

Inter

Usage:

* Navigation
* Product Information
* Body Content
* Buttons
* Forms

---

# Design Direction

Inspired By:

* Lama Retail
* Beachtree
* Lulusar

Design Goals:

* Luxury Black & Gold Theme
* Large Fashion Photography
* Clean Layouts
* High White Space Usage
* Premium Product Presentation
* Fast Shopping Experience
* Strong Mobile UX

---

# Public Website Pages

## Home Page

Sections:

* Announcement Bar
* Navigation
* Hero Banner
* New Arrivals
* Featured Collections
* Best Sellers
* Trending Products
* Seasonal Collection
* Sale Banner
* About EVORA
* Customer Testimonials
* Instagram Gallery
* Newsletter Subscription
* Footer

---

## Shop Page

Features:

* Product Grid
* Search
* Category Filter
* Price Filter
* Sort Options
* Pagination

---

## Product Details Page

Features:

* Product Gallery
* Zoom Images
* Product Description
* Available Sizes
* Available Colors
* Price
* Discount Price
* Stock Status
* Add To Cart
* Buy Now
* Related Products

---

## Cart Page

Features:

* Product List
* Quantity Control
* Remove Product
* Coupon Code
* Shipping Estimate
* Cart Summary

---

## Checkout Page

Features:

* Shipping Information
* Billing Information
* Order Summary
* Payment Method
* Place Order

---

## User Dashboard

Features:

* Profile
* Orders
* Address Book
* Wishlist
* Account Settings

---

## Authentication Pages

* Login
* Register
* Forgot Password
* Reset Password

---

## Additional Pages

* About Us
* Contact Us
* FAQ
* Privacy Policy
* Terms & Conditions
* Shipping Policy
* Return & Exchange Policy

---

# E-Commerce Features

## Customer Features

* User Registration
* Login
* Wishlist
* Shopping Cart
* Product Search
* Product Filters
* Product Reviews
* Order Tracking
* Profile Management
* Address Management

---

# Admin Panel

## Dashboard

Display:

* Total Revenue
* Total Orders
* Total Customers
* Total Products
* Recent Orders
* Low Stock Products
* Sales Analytics

---

## Product Management

Admin Can:

* Add Product
* Edit Product
* Delete Product
* Duplicate Product
* Manage Variants
* Manage Sizes
* Manage Colors

Product Fields:

* Product Name
* SKU
* Description
* Price
* Sale Price
* Category
* Stock Quantity
* Product Images
* Thumbnail Image
* Status

---

## Category Management

Admin Can:

* Create Category
* Edit Category
* Delete Category

---

## Inventory Management

Admin Can:

* Update Stock
* Track Inventory
* View Low Stock Alerts
* Manage Product Availability

---

## Media Library

Admin Can:

* Upload Images
* Delete Images
* Update Product Gallery
* Manage Hero Banners

---

## Discount Management

Admin Can:

* Create Coupons
* Percentage Discounts
* Fixed Discounts
* Flash Sales
* Seasonal Sales

---

## Order Management

Admin Can:

* View Orders
* Update Status
* Process Orders
* Cancel Orders
* Mark Delivered

Order Status:

* Pending
* Processing
* Shipped
* Delivered
* Cancelled

---

## Customer Management

Admin Can:

* View Customers
* Manage Customer Accounts
* View Purchase History

---

## Content Management

Admin Can:

* Homepage Banners
* Promotional Sections
* Homepage Collections
* Seasonal Campaigns

---

# Database Tables

## Users

* id
* name
* email
* password
* role

## Products

* id
* name
* description
* price
* discount
* stock
* category
* images
* thumbnail

## Categories

* id
* name

## Orders

* id
* user_id
* total_price
* status

## Coupons

* id
* code
* discount_type
* discount_value

## Reviews

* id
* user_id
* product_id
* rating
* review

---

# UI Requirements

* Fully Responsive
* Mobile First
* Accessibility Friendly
* Fast Loading
* Modern Animations
* Premium Luxury Feel
* SEO Optimized
* Optimized Images
* Clean Component Architecture

---

# Development Goal

Build a luxury fashion e-commerce platform that combines:

* Lama Retail's premium elegance
* Beachtree's engaging visual energy
* Lulusar's modern fashion experience

while maintaining a clean, scalable, high-performance architecture powered by Next.js and Supabase.
