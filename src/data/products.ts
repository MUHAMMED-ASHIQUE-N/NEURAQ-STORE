export type Variant = { id: string; name: string };
export type ProductDetail = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviews?: number;
  images: string[];
  description: string;
  features: string[];
  sku: string;
  availability: "in_stock" | "out_of_stock";
  variants?: { label: string; options: Variant[] }[];
  category: string;
};

export const products: ProductDetail[] = [
  {
    id: "f1",
    name: "Noise Cancelling Headphones",
    price: 149,
    originalPrice: 219,
    rating: 5,
    reviews: 412,
    images: [
      "https://images.unsplash.com/photo-1518443855757-8d2f50a94f21?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=1200&auto=format&fit=crop",
    ],
    description:
      "Experience immersive sound with advanced active noise cancellation and 30-hour battery life.",
    features: ["Bluetooth 5.3", "ANC", "30h battery", "Fast charging"],
    sku: "AUR-HP-F1",
    availability: "in_stock",
    variants: [{ label: "Color", options: [{ id: "blk", name: "Black" }, { id: "sil", name: "Silver" }] }],
    category: "electronics",
  },
  {
    id: "f2",
    name: "Minimal Desk Lamp",
    price: 59,
    originalPrice: 79,
    rating: 4,
    reviews: 123,
    images: [
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1200&auto=format&fit=crop",
    ],
    description:
      "Matte-finish LED lamp with adjustable neck and warm to cool color temperatures.",
    features: ["LED", "Dimmable", "USB-C"],
    sku: "AUR-LP-F2",
    availability: "in_stock",
    category: "home",
  },
  {
    id: "f3",
    name: "Classic Linen Shirt",
    price: 39,
    originalPrice: 59,
    rating: 4,
    reviews: 89,
    images: [
      "https://images.unsplash.com/photo-1520975859264-05d80fcf0b3f?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520975922215-230f73b73fcd?q=80&w=1200&auto=format&fit=crop",
    ],
    description: "Breathable linen shirt for everyday comfort.",
    features: ["100% linen", "Machine washable"],
    sku: "AUR-SH-F3",
    availability: "in_stock",
    variants: [{ label: "Size", options: [{ id: "s", name: "S" }, { id: "m", name: "M" }, { id: "l", name: "L" }] }],
    category: "fashion",
  },
  {
    id: "f4",
    name: "Everyday Sneakers",
    price: 89,
    originalPrice: 109,
    rating: 5,
    reviews: 240,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1200&auto=format&fit=crop",
    ],
    description: "Lightweight sneakers with cushioned sole for all-day wear.",
    features: ["Breathable mesh", "Cushion sole"],
    sku: "AUR-SN-F4",
    availability: "in_stock",
    variants: [{ label: "Size", options: [{ id: "7", name: "7" }, { id: "8", name: "8" }, { id: "9", name: "9" }] }],
    category: "fashion",
  },
  {
    id: "p1",
    name: "Wireless Headphones",
    price: 129,
    originalPrice: 199,
    rating: 4,
    reviews: 128,
    images: [
      "https://images.unsplash.com/photo-1518443855757-8d2f50a94f21?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1200&auto=format&fit=crop",
    ],
    description: "Crisp audio with long battery life.",
    features: ["20h battery", "Microphone"],
    sku: "AUR-HP-P1",
    availability: "in_stock",
    category: "electronics",
  },
];

export function getProductById(id: string): ProductDetail | undefined {
  return products.find((p) => p.id === id);
}
