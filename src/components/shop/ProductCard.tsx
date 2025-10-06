import { useEffect, useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { useCart } from "../../contexts/CartContext";
import { Heart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { firestore } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";

type Product = {
  id: string;
  name: string;
  finalPrice: number;
  originalPrice?: number;
  description?: string;
  rating?: number;
  reviews?: number;
  images?: string[];
  image?: string;
  quantity: number;
  // add/remove fields as needed
};

function currency(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(n);
}

export default function ProductsList({ product }: { product: Product }) {
  const { add } = useCart();
  const navigate = useNavigate();
  const [wishlistActive, setWishlistActive] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchWishlistStatus = async () => {
      if (!user?.id) return;
      const wishlistDocRef = doc(
        firestore,
        "users",
        user.id,
        "wishlist",
        product.id
      );
      const docSnap = await getDoc(wishlistDocRef);
      setWishlistActive(docSnap.exists() && docSnap.data().status === true);
    };
    fetchWishlistStatus();
  }, [user?.id, product.id]);

  const handleWishlist = async () => {
    if (!user?.id) return;

    const newActive = !wishlistActive;
    setWishlistActive(newActive);

    const wishlistDocRef = doc(
      firestore,
      "users",
      user.id,
      "wishlist",
      product.id
    );

    if (newActive) {
      await setDoc(wishlistDocRef, {
        productId: product.id,
        name: product.name,
        description: product.description,
        image:
          Array.isArray(product.images) && product.images.length > 0
            ? product.images[0]
            : product.image,
        finalPrice: product.finalPrice,
        status: true,
        createdAt: new Date().toISOString(),
      });
    } else {
      await deleteDoc(wishlistDocRef);
    }
  };

  const productImage =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : product.image ||
        "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg";

  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-lg ">
      <div className="flex space-x-2 overflow-x-auto mb-3">
        {Array.isArray(product.images) && product.images.length > 0 ? (
          product.images.map((img, idx) => (
            <Link to={`/product/${product.id}`} className="block">
              <div className="aspect-square overflow-hidden bg-muted">
                <img
                  key={idx}
                  src={productImage}
                  alt={`${product.name} image ${idx + 1}`}
                  className="w-full h-full object-cover rounded-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            </Link>
          ))
        ) : product.images ? (
          <img
            src={productImage}
            alt={product.name}
            className="w-full h-full object-cover rounded-lg mb-3"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
            No Image Available
          </div>
        )}
      </div>
      <div className="space-y-2 p-4">
        <Link
          to={`/product/${product.id}`}
          className="line-clamp-1 font-medium"
        >
          <h2 className="font-semibold text-lg">{product.name}</h2>
        </Link>
        <p className="text-muted-foreground mb-2 line-clamp-3">
          {product.description}
        </p>
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-xl font-bold">
            {currency(product.finalPrice)}
          </span>
          {product.originalPrice &&
            product.originalPrice > product.finalPrice && (
              <span className="line-through text-muted-foreground">
                {currency(product.originalPrice)}
              </span>
            )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${
                i < (product.rating || 0)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }`}
            />
          ))}
          <span className="ml-1">({product.reviews ?? 0})</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Button
            className="w-full"
            disabled={product.quantity === 0}
            onClick={() =>
              add({
                id: product.id,
                name: product.name,
                price: product.finalPrice,
                image: product.images,
                quantity: 1,
              })
            }
          >
            Add to Cart
          </Button>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Button
            className="w-full"
            disabled={product.quantity === 0}
            onClick={() => {
              add({
                id: product.id,
                name: product.name,
                price: product.finalPrice,
                image: product.images,
                quantity: 1,
              });
              navigate("/cart");
            }}
            variant="secondary"
          >
            Buy Now
          </Button>

          <Button
            variant="outline"
            size="icon"
            aria-label="Add to wishlist"
            onClick={handleWishlist}
          >
            <Heart
              className="h-4 w-4"
              style={{ color: wishlistActive ? "red" : undefined }}
              fill={wishlistActive ? "red" : "none"}
            />
          </Button>
        </div>
      </div>
    </div>
  );
}
