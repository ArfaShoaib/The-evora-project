// ─── Categories ──────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
}

export const categories: Category[] = [
  {
    id: "cat-1",
    name: "Dresses",
    slug: "dresses",
    image: "/categories/dresses.jpg",
    description: "From effortless day dresses to statement evening wear",
  },
  {
    id: "cat-2",
    name: "Tops & Blouses",
    slug: "tops",
    image: "/categories/tops.jpg",
    description: "Refined silhouettes for every occasion",
  },
  {
    id: "cat-3",
    name: "Bags",
    slug: "bags",
    image: "/categories/bags.jpg",
    description: "Luxury craftsmanship meets modern design",
  },
  {
    id: "cat-4",
    name: "Shoes",
    slug: "shoes",
    image: "/categories/shoes.jpg",
    description: "Step into sophistication",
  },
  {
    id: "cat-5",
    name: "Accessories",
    slug: "accessories",
    image: "/categories/accessories.jpg",
    description: "The finishing touches that define your style",
  },
  {
    id: "cat-6",
    name: "Outerwear",
    slug: "outerwear",
    image: "/categories/outerwear.jpg",
    description: "Layer with luxury",
  },
];

// ─── Products ────────────────────────────────────────────────────────────────

export interface ProductVariant {
  id: string;
  size: string | null;
  color: string | null;
  color_hex: string | null;
  material: string | null;
  stock: number;
  price_modifier: number;
  image_url: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  images: string[];
  category: string;
  categoryId: string;
  categorySlug: string;
  subcategory: string | null;
  sizes: string[];
  colors: { name: string; hex: string }[];
  materials: string[];
  volumes: string[];
  scentFamilies: string[];
  variants: ProductVariant[];
  stock: number;
  rating: number;
  reviewCount: number;
  description: string;
  isNew: boolean;
  isBestSeller: boolean;
  isTrending: boolean;
}

export const products: Product[] = [
  {
    id: "prod-1",
    name: "Silk midi slip dress",
    slug: "silk-midi-slip-dress",
    price: 189,
    salePrice: null,
    images: ["/products/silk-slip-dress-1.jpg", "/products/silk-slip-dress-2.jpg"],
    category: "Dresses",
    categoryId: "cat-1",
    categorySlug: "dresses",
    subcategory: "Midi Dresses",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Champagne", hex: "#F5E6D3" },
      { name: "Black", hex: "#000000" },
      { name: "Emerald", hex: "#2E8B57" },
    ],
    variants: [],
    materials: [],
    volumes: [],
    scentFamilies: [],
    stock: 24,
    rating: 4.8,
    reviewCount: 127,
    description: "Luxurious silk midi dress with delicate straps. Timeless elegance for day-to-night dressing.",
    isNew: true,
    isBestSeller: true,
    isTrending: false,
  },
  {
    id: "prod-2",
    name: "Structured wool blazer",
    slug: "structured-wool-blazer",
    price: 295,
    salePrice: null,
    images: ["/products/wool-blazer-1.jpg", "/products/wool-blazer-2.jpg"],
    category: "Outerwear",
    categoryId: "cat-6",
    categorySlug: "outerwear",
    subcategory: "Blazers",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Camel", hex: "#C19A6B" },
      { name: "Black", hex: "#000000" },
    ],
    variants: [],
    materials: [],
    volumes: [],
    scentFamilies: [],
    stock: 18,
    rating: 4.9,
    reviewCount: 89,
    description: "Impeccably tailored wool blazer. A wardrobe essential that transcends seasons.",
    isNew: false,
    isBestSeller: true,
    isTrending: true,
  },
  {
    id: "prod-3",
    name: "Leather crossbody bag",
    slug: "leather-crossbody-bag",
    price: 245,
    salePrice: 195,
    images: ["/products/crossbody-bag-1.jpg", "/products/crossbody-bag-2.jpg"],
    category: "Bags",
    categoryId: "cat-3",
    categorySlug: "bags",
    subcategory: "Crossbody",
    sizes: ["One Size"],
    colors: [
      { name: "Cognac", hex: "#834A25" },
      { name: "Black", hex: "#000000" },
      { name: "Burgundy", hex: "#800020" },
    ],
    variants: [],
    materials: [],
    volumes: [],
    scentFamilies: [],
    stock: 32,
    rating: 4.7,
    reviewCount: 203,
    description: "Handcrafted Italian leather crossbody with gold-tone hardware. Compact yet spacious.",
    isNew: false,
    isBestSeller: true,
    isTrending: false,
  },
  {
    id: "prod-4",
    name: "Cashmere knit sweater",
    slug: "cashmere-knit-sweater",
    price: 220,
    salePrice: null,
    images: ["/products/cashmere-sweater-1.jpg", "/products/cashmere-sweater-2.jpg"],
    category: "Tops",
    categoryId: "cat-2",
    categorySlug: "tops",
    subcategory: "Knitwear",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Ivory", hex: "#FFFFF0" },
      { name: "Grey Melange", hex: "#B0B0B0" },
      { name: "Navy", hex: "#000080" },
    ],
    variants: [],
    materials: [],
    volumes: [],
    scentFamilies: [],
    stock: 45,
    rating: 4.6,
    reviewCount: 156,
    description: "Pure cashmere knit with relaxed fit. Ultimate comfort meets understated luxury.",
    isNew: true,
    isBestSeller: false,
    isTrending: true,
  },
  {
    id: "prod-5",
    name: "Pointed-toe kitten heels",
    slug: "pointed-toe-kitten-heels",
    price: 175,
    salePrice: null,
    images: ["/products/kitten-heels-1.jpg", "/products/kitten-heels-2.jpg"],
    category: "Shoes",
    categoryId: "cat-4",
    categorySlug: "shoes",
    subcategory: "Heels",
    sizes: ["36", "37", "38", "39", "40", "41"],
    colors: [
      { name: "Black Patent", hex: "#000000" },
      { name: "Nude", hex: "#E3BC9A" },
    ],
    variants: [],
    materials: [],
    volumes: [],
    scentFamilies: [],
    stock: 28,
    rating: 4.5,
    reviewCount: 94,
    description: "Elegant kitten heel with pointed toe. Perfect for the office or evening events.",
    isNew: false,
    isBestSeller: false,
    isTrending: true,
  },
  {
    id: "prod-6",
    name: "Pleated midi skirt",
    slug: "pleated-midi-skirt",
    price: 145,
    salePrice: 115,
    images: ["/products/pleated-skirt-1.jpg", "/products/pleated-skirt-2.jpg"],
    category: "Dresses",
    categoryId: "cat-1",
    categorySlug: "dresses",
    subcategory: "Skirts",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Cream", hex: "#FFFDD0" },
      { name: "Sage", hex: "#9CAF88" },
    ],
    variants: [],
    materials: [],
    volumes: [],
    scentFamilies: [],
    stock: 36,
    rating: 4.7,
    reviewCount: 178,
    description: "Fluid pleated midi skirt with elasticated waist. Effortless movement and grace.",
    isNew: false,
    isBestSeller: true,
    isTrending: false,
  },
  {
    id: "prod-7",
    name: "Gold chain necklace",
    slug: "gold-chain-necklace",
    price: 125,
    salePrice: null,
    images: ["/products/gold-necklace-1.jpg", "/products/gold-necklace-2.jpg"],
    category: "Accessories",
    categoryId: "cat-5",
    categorySlug: "accessories",
    subcategory: "Jewelry",
    sizes: ["One Size"],
    colors: [
      { name: "Gold", hex: "#D4AF37" },
    ],
    variants: [],
    materials: [],
    volumes: [],
    scentFamilies: [],
    stock: 60,
    rating: 4.8,
    reviewCount: 245,
    description: "18k gold-plated chain necklace. A versatile piece for layering or wearing solo.",
    isNew: true,
    isBestSeller: true,
    isTrending: true,
  },
  {
    id: "prod-8",
    name: "Linen blend trousers",
    slug: "linen-blend-trousers",
    price: 165,
    salePrice: null,
    images: ["/products/linen-trousers-1.jpg", "/products/linen-trousers-2.jpg"],
    category: "Dresses",
    categoryId: "cat-1",
    categorySlug: "dresses",
    subcategory: "Trousers",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Sand", hex: "#C2B280" },
      { name: "Black", hex: "#000000" },
    ],
    variants: [],
    materials: [],
    volumes: [],
    scentFamilies: [],
    stock: 42,
    rating: 4.6,
    reviewCount: 112,
    description: "Relaxed-fit linen blend trousers. Breathable elegance for warm-weather dressing.",
    isNew: false,
    isBestSeller: false,
    isTrending: false,
  },
  {
    id: "prod-9",
    name: "Quilted shoulder bag",
    slug: "quilted-shoulder-bag",
    price: 320,
    salePrice: null,
    images: ["/products/quilted-bag-1.jpg", "/products/quilted-bag-2.jpg"],
    category: "Bags",
    categoryId: "cat-3",
    categorySlug: "bags",
    subcategory: "Shoulder Bags",
    sizes: ["One Size"],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Rose Gold", hex: "#B76E79" },
    ],
    variants: [],
    materials: [],
    volumes: [],
    scentFamilies: [],
    stock: 15,
    rating: 4.9,
    reviewCount: 87,
    description: "Signature quilted leather shoulder bag with chain strap. Iconic luxury.",
    isNew: true,
    isBestSeller: false,
    isTrending: true,
  },
  {
    id: "prod-10",
    name: "Oversized sunglasses",
    slug: "oversized-sunglasses",
    price: 95,
    salePrice: 75,
    images: ["/products/sunglasses-1.jpg", "/products/sunglasses-2.jpg"],
    category: "Accessories",
    categoryId: "cat-5",
    categorySlug: "accessories",
    subcategory: "Eyewear",
    sizes: ["One Size"],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Tortoise", hex: "#8B4513" },
    ],
    variants: [],
    materials: [],
    volumes: [],
    scentFamilies: [],
    stock: 50,
    rating: 4.4,
    reviewCount: 198,
    description: "Oversized acetate sunglasses with UV protection. Glamour meets function.",
    isNew: false,
    isBestSeller: true,
    isTrending: false,
  },
  {
    id: "prod-11",
    name: "Satin blouse",
    slug: "satin-blouse",
    price: 135,
    salePrice: null,
    images: ["/products/satin-blouse-1.jpg", "/products/satin-blouse-2.jpg"],
    category: "Tops",
    categoryId: "cat-2",
    categorySlug: "tops",
    subcategory: "Blouses",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Champagne", hex: "#F5E6D3" },
      { name: "Black", hex: "#000000" },
      { name: "Burgundy", hex: "#800020" },
    ],
    variants: [],
    materials: [],
    volumes: [],
    scentFamilies: [],
    stock: 38,
    rating: 4.7,
    reviewCount: 134,
    description: "Fluid satin blouse with relaxed fit. Understated elegance for any occasion.",
    isNew: false,
    isBestSeller: false,
    isTrending: false,
  },
  {
    id: "prod-12",
    name: "Leather ankle boots",
    slug: "leather-ankle-boots",
    price: 285,
    salePrice: 225,
    images: ["/products/ankle-boots-1.jpg", "/products/ankle-boots-2.jpg"],
    category: "Shoes",
    categoryId: "cat-4",
    categorySlug: "shoes",
    subcategory: "Boots",
    sizes: ["36", "37", "38", "39", "40"],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Brown", hex: "#8B4513" },
    ],
    variants: [],
    materials: [],
    volumes: [],
    scentFamilies: [],
    stock: 22,
    rating: 4.8,
    reviewCount: 167,
    description: "Handcrafted leather ankle boots with block heel. Versatile luxury for everyday.",
    isNew: false,
    isBestSeller: true,
    isTrending: true,
  },
];

// ─── Testimonials ────────────────────────────────────────────────────────────

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  avatar: string;
  rating: number;
}

export const testimonials: Testimonial[] = [
  {
    id: "test-1",
    name: "Sophia Chen",
    role: "Fashion Editor",
    quote: "EVORA captures the essence of modern luxury. Every piece feels intentional, timeless, and effortlessly chic.",
    avatar: "/avatars/sophia.jpg",
    rating: 5,
  },
  {
    id: "test-2",
    name: "Amara Okafor",
    role: "Interior Designer",
    quote: "The quality is exceptional. I've never felt fabrics this luxurious at this price point. My wardrobe has never looked better.",
    avatar: "/avatars/amara.jpg",
    rating: 5,
  },
  {
    id: "test-3",
    name: "Isabella Rossi",
    role: "Art Director",
    quote: "From packaging to product, every detail speaks to careful curation. EVORA understands what modern women want.",
    avatar: "/avatars/isabella.jpg",
    rating: 5,
  },
  {
    id: "test-4",
    name: "Priya Sharma",
    role: "Entrepreneur",
    quote: "I receive compliments every time I wear EVORA. The designs are sophisticated yet wearable — exactly what I needed.",
    avatar: "/avatars/priya.jpg",
    rating: 5,
  },
];

// ─── Collections ─────────────────────────────────────────────────────────────

export interface Collection {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  productCount: number;
}

export const collections: Collection[] = [
  {
    id: "col-1",
    name: "The Summer Edit",
    slug: "summer-edit",
    image: "/collections/summer-edit.jpg",
    description: "Lightweight luxury for sun-soaked days and balmy evenings",
    productCount: 24,
  },
  {
    id: "col-2",
    name: "Evening Edit",
    slug: "evening-edit",
    image: "/collections/evening-edit.jpg",
    description: "Statement pieces for unforgettable nights",
    productCount: 18,
  },
  {
    id: "col-3",
    name: "Workwear Essentials",
    slug: "workwear-essentials",
    image: "/collections/workwear.jpg",
    description: "Polished professionalism from desk to dinner",
    productCount: 32,
  },
  {
    id: "col-4",
    name: "The Capsule Collection",
    slug: "capsule-collection",
    image: "/collections/capsule.jpg",
    description: "Timeless pieces designed to mix and match effortlessly",
    productCount: 12,
  },
];

// ─── Hero Banners ────────────────────────────────────────────────────────────

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaLink: string;
}

export const heroBanners: HeroBanner[] = [
  {
    id: "hero-1",
    title: "Timeless Elegance",
    subtitle: "The Art of Everyday Luxury",
    image: "/hero/hero-main.jpg",
    ctaText: "Shop Collection",
    ctaLink: "/shop",
  },
];

// ─── Instagram Gallery ───────────────────────────────────────────────────────

export interface InstagramPost {
  id: string;
  image: string;
  likes: number;
  link: string;
}

export const instagramPosts: InstagramPost[] = [
  { id: "ig-1", image: "/instagram/ig-1.jpg", likes: 1243, link: "#" },
  { id: "ig-2", image: "/instagram/ig-2.jpg", likes: 987, link: "#" },
  { id: "ig-3", image: "/instagram/ig-3.jpg", likes: 1567, link: "#" },
  { id: "ig-4", image: "/instagram/ig-4.jpg", likes: 876, link: "#" },
  { id: "ig-5", image: "/instagram/ig-5.jpg", likes: 2134, link: "#" },
  { id: "ig-6", image: "/instagram/ig-6.jpg", likes: 1098, link: "#" },
];

// ─── Navigation Links ────────────────────────────────────────────────────────

export const navLinks = [
  { name: "New Arrivals", href: "/new-arrivals" },
  { name: "Shop", href: "/shop" },
  { name: "Collections", href: "/collections" },
  { name: "Sale", href: "/sale", highlight: true },
];

// ─── Footer Links ────────────────────────────────────────────────────────────

export const footerLinks = {
  shop: [
    { name: "New Arrivals", href: "/new-arrivals" },
    { name: "Best Sellers", href: "/best-sellers" },
    { name: "All Products", href: "/shop" },
    { name: "Trending Now", href: "/trending" },
    { name: "Seasonal Campaign", href: "/collections" },
  ],
  customerCare: [
    { name: "Contact Us", href: "/contact" },
    { name: "FAQs & Support", href: "/faq" },
    { name: "Shipping & Delivery", href: "/shipping-policy" },
    { name: "Returns & Exchanges", href: "/returns" },
    { name: "Order Tracking", href: "/track-order" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Store Directory", href: "/stores" },
    { name: "Corporate Info", href: "/about" },
  ],
};
