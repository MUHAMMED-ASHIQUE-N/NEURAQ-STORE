import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../../firebase";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { useCart } from "../../contexts/CartContext";
import { Heart, Star } from "lucide-react";

type Product = {
  id: string;
  name: string;
  finalPrice: number;
  originalPrice?: number;
  description?: string;
  rating?: number; // 0-5
  reviews?: number;
  images?: [];
  quantity: number;
};

function currency(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(n);
}

export default function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { add } = useCart();

  useEffect(() => {
    async function fetchAllProducts() {
      const collectionNames = [
        "amazonProducts",
        "localProducts",
        "softwareProducts",
      ];
      const allProducts: Product[] = [];

      for (const col of collectionNames) {
        const colRef = collection(firestore, col);
        const snapshot = await getDocs(colRef);
        snapshot.forEach((doc) => {
          const data = doc.data();
          allProducts.push({
            id: doc.id,
            name: data.name,
            originalPrice: data.originalPrice,
            finalPrice: data.finalPrice,
            description: data.description,
            images: Array.isArray(data.images) ? data.images[0] : data.image,
            quantity: data.quantity,
          });
        });
      }
      setProducts(allProducts);
      setLoading(false);
    }

    fetchAllProducts();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-lg">
      {products.map((product) => (
        <div
          key={product.id}
          className="border p-4 rounded-md cursor-pointer hover:shadow-lg"
        >
          <div className="flex space-x-2 overflow-x-auto mb-3">
            {Array.isArray(product.images) && product.images.length > 0 ? (
              product.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${product.name} image ${idx + 1}`}
                  className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                  loading="lazy"
                />
              ))
            ) : product.images ? (
              <img
                src={product.images}
                alt={product.name}
                className="w-full h-48 object-cover rounded-lg mb-3"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                No Image Available
              </div>
            )}
          </div>

          <h2 className="font-semibold text-lg">{product.name}</h2>
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
                add(
                  {
                    id: product.id,
                    name: product.name,
                    price: product.finalPrice,
                    image: product.images,
                  },
                  1
                )
              }
            >
              Add to Cart
            </Button>
            <Button variant="outline" size="icon" aria-label="Add to wishlist">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
