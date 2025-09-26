import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../firebase";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useCart } from "../contexts/CartContext";

function currency(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(n);
}

type Variant = {
  id: string;
  name: string;
};

type ProductDetail = {
  id: string;
  name: string;
  finalPrice: number;
  originalPrice?: number;
  images: string[];
  description: string;
  quantity: number;
};

export default function ProductList() {
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const { add } = useCart();

  useEffect(() => {
    async function fetchAllProducts() {
      const collectionNames = [
        "amazonProducts",
        "localProducts",
        "softwareProducts",
      ];
      const all: ProductDetail[] = [];
      for (const col of collectionNames) {
        const colRef = collection(firestore, col);
        const snap = await getDocs(colRef);
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          all.push({
            id: docSnap.id,
            name: data.name,
            originalPrice: data.originalPrice,
            finalPrice: data.finalPrice,
            images: data.images,
            description: data.description,
            quantity: data.quantity,
          });
        });
      }
      setProducts(all);
      setLoading(false);
    }
    fetchAllProducts();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container py-8 md:py-10">
      <div className="grid gap-8 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
        {products.map((product) => (
          <div key={product.id} className="border p-4 rounded-md">
            <img
              src={product.images?.[0] || ""}
              alt={product.name}
              className="object-cover rounded-xl h-48 w-full mb-3"
            />
            <h2 className="text-lg font-bold">{product.name}</h2>
            <p className="text-muted-foreground mt-1">{product.description}</p>
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-xl font-semibold">
                {currency(product.finalPrice)}
              </span>
              {product.originalPrice &&
                product.originalPrice > product.finalPrice && (
                  <span className="line-through text-muted-foreground">
                    {currency(product.originalPrice)}
                  </span>
                )}
            </div>
            <div className="mt-2">
              {product.quantity > 0 ? (
                <Badge variant="success">In stock</Badge>
              ) : (
                <Badge variant="destructive">Out of stock</Badge>
              )}
            </div>
            <div className="mt-4 flex space-x-2">
              <Button
                onClick={() =>
                  add(
                    {
                      id: product.id,
                      name: product.name,
                      price: product.finalPrice,
                      image: product.images?.[0] || "",
                    },
                    1 // default qty
                  )
                }
                disabled={product.quantity === 0}
              >
                Add to cart
              </Button>
              <Button disabled={product.quantity === 0} variant="secondary">
                Buy now
              </Button>
            </div>
            <Separator className="my-4" />
            <div>
              <h2 className="text-lg font-bold">Details</h2>
              <p className="mt-2">{product.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../../firebase";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { useCart } from "../../contexts/CartContext";

type Product = {
  id: string;
  name: string;
  finalPrice: number;
  originalPrice?: number;
  description?: string;
  image?: string;
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
            image: Array.isArray(data.images) ? data.images[0] : data.image,
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
