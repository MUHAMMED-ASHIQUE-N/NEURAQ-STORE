import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { firestore } from "../firebase";

type WishItem = {
  id: string;
  name: string;
  image: string;
  finalPrice: number;
};
const storageKey = "aurora_wishlist_v1";

function readWishlist(): WishItem[] {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as WishItem[]) : [];
  } catch {
    return [];
  }
}

function currency(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(n);
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishItem[]>([]);
  const user = useAuth();
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user?.user?.id) return;
      const wishlistRef = collection(
        firestore,
        "users",
        user.user.id,
        "wishlist"
      );
      const snapshot = await getDocs(wishlistRef);
      const wishlistItems: WishItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        wishlistItems.push({
          id: doc.id,
          name: data.name,
          image: data.image,
          finalPrice: data.finalPrice,
        });
      });
      setItems(wishlistItems);
    };
    fetchWishlist();
  }, [user?.user?.id]);

  return (
    <div className="container py-8 md:py-10">
      <h1 className="text-2xl font-bold">Wishlist</h1>
      {items.length === 0 ? (
        <div className="mt-6 rounded-xl border p-6">
          <p className="text-muted-foreground">Your wishlist is empty.</p>
          <Link
            to="/products"
            className="mt-3 inline-block text-primary hover:underline"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((i) => (
            <div key={i.id} className="overflow-hidden rounded-xl border">
              <img
                src={i.image}
                alt={i.name}
                className="h-40 w-full object-cover"
              />
              <div className="p-3">
                <div className="font-medium">{i.name}</div>
                <div className="text-sm text-muted-foreground">
                  {i.finalPrice.toLocaleString(undefined, {
                    style: "currency",
                    currency: "USD",
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
