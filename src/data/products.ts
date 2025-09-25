import { getDoc, doc } from "firebase/firestore";
import { firestore } from "../firebase.ts"; // Adjust this import based on your Firestore config

export type Variant = {
  id: string;
  name: string;
};

export type ProductDetail = {
  id: string;
  name: string;
  finalPrice: number; // replaces price
  originalPrice?: number;
  images: string[];
  description: string;
  quantity: number; // replaces availability
};

export const products: ProductDetail[] = [
  {
    id: "f1",
    name: "Noise Cancelling Headphones",
    finalPrice: 149,
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
    quantity: 100, // example quantity
    variants: [
      {
        label: "Color",
        options: [
          { id: "blk", name: "Black" },
          { id: "sil", name: "Silver" },
        ],
      },
    ],
    category: "electronics",
  },
  // More products...
];

// Fetch product from Firestore collections: amazonProducts, localProducts, softwareProducts
export async function getProductById(
  id: string,
  source: "amazon" | "local" | "software"
): Promise<ProductDetail | undefined> {
  const collectionMap = {
    amazon: "amazonProducts",
    local: "localProducts",
    software: "softwareProducts",
  };
  const collectionName = collectionMap[source];

  const ref = doc(firestore, collectionName, id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return undefined;

  const data = snap.data();

  return {
    id: snap.id,
    name: data.name,
    originalPrice: data.originalPrice,
    finalPrice: data.finalPrice,
    images: data.images,
    description: data.description,
    quantity: data.quantity,
  };
}
