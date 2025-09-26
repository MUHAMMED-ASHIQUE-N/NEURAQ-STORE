import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase"; // adjust path as needed

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

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const { add } = useCart();

  // Example to determine source (amazon/local/software) - can be adapted
  const searchParams = new URLSearchParams(window.location.search);
  const source = (searchParams.get("amazon, local, software") || "amazon") as
    | "amazon"
    | "local"
    | "software";

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;

      const collectionMap = {
        amazon: "amazonProducts",
        local: "localProducts",
        software: "softwareProducts",
      };
      const collectionName = collectionMap[source];

      const ref = doc(firestore, collectionName, id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setProduct({
          id: snap.id,
          name: data.name,
          originalPrice: data.originalPrice,
          finalPrice: data.finalPrice,
          images: data.images,
          description: data.description,
          quantity: data.quantity,
        });
      } else {
        setProduct(null); // or fallback logic
      }
    }
    fetchProduct();
  }, [id, source]);

  if (!product) return <div>Loading...</div>;

  const discount =
    product.originalPrice !== undefined &&
    product.originalPrice > product.finalPrice;

  return (
    <div className="container py-8 md:py-10">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="aspect-square overflow-hidden rounded-xl border bg-muted">
            <img
              src={product.images[active]}
              alt={product.name}
              className="object-cover"
            />
          </div>
          <div className="mt-4 flex space-x-4 overflow-x-auto">
            {product.images.map((img, i) => (
              <img
                key={img}
                src={img}
                alt={`${product.name} ${i + 1}`}
                className={`h-24 w-24 cursor-pointer rounded-md border object-cover ${
                  active === i ? "border-primary" : "border-transparent"
                }`}
                onClick={() => setActive(i)}
              />
            ))}
          </div>
        </div>
        {/* Info */}
        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>

          <div className="mt-3 flex items-center space-x-2">
            <span className="text-2xl font-semibold">
              {currency(product.finalPrice)}
            </span>
            {discount && (
              <>
                <span className="line-through text-muted-foreground">
                  {currency(product.originalPrice!)}
                </span>
                <span className="text-sm font-medium text-red-500">
                  Save {currency(product.originalPrice! - product.finalPrice)}
                </span>
              </>
            )}
          </div>

          {/* Quantity */}
          <div className="mt-6 flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
            >
              -
            </Button>
            <span>{qty}</span>
            <Button variant="outline" onClick={() => setQty((q) => q + 1)}>
              +
            </Button>
          </div>

          {/* Add to Cart Button */}
          <div className="mt-6 flex space-x-4">
            <Button
              onClick={() =>
                add(
                  {
                    id: product.id,
                    name: product.name,
                    price: product.finalPrice,
                    image: product.images[0],
                  },
                  qty
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

          <Separator className="my-8" />
          {/* Additional info, delivery, reviews... */}
          <div>
            <h2 className="text-lg font-bold">Details</h2>
            <p className="mt-2">{product.description}</p>

            <h2 className="mt-8 text-lg font-bold">Key features</h2>

            <h2 className="mt-8 text-lg font-bold">Reviews</h2>
            <p className="mt-2">No reviews yet.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
