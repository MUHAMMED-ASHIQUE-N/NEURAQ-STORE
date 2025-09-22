import { Heart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { useCart } from "../../contexts/CartContext";

export type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating?: number; // 0-5
  reviews?: number;
  image: string;
};

function currency(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(n);
}

export default function ProductCard({ product }: { product: Product }) {
  const discount =
    product.originalPrice && product.originalPrice > product.price;
  const { add } = useCart();

  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-lg">
      <Link to={`/product/${product.id}`} className="block">
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </Link>
      <div className="space-y-2 p-4">
        <Link
          to={`/product/${product.id}`}
          className="line-clamp-1 font-medium"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold">
            {currency(product.price)}
          </span>
          {discount && (
            <>
              <span className="text-sm text-muted-foreground line-through">
                {currency(product.originalPrice!)}
              </span>
              <span className="text-xs font-semibold text-primary">
                -
                {Math.round(
                  ((product.originalPrice! - product.price) /
                    product.originalPrice!) *
                    100
                )}
                %
              </span>
            </>
          )}
        </div>
        {(product.rating ?? 0) > 0 && (
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
        )}
        <div className="mt-3 flex items-center gap-2">
          <Button
            className="flex-1"
            onClick={() =>
              add({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
              })
            }
          >
            Add to cart
          </Button>
          <Button variant="outline" size="icon" aria-label="Add to wishlist">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
