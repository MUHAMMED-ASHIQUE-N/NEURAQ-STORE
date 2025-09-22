import { useParams } from "react-router-dom";
import { getProductById, products, type ProductDetail } from "../data/products";
import { useMemo, useState } from "react";
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

export default function ProductDetails() {
  const { id } = useParams();
  const product = useMemo(() => getProductById(id || "") || products[0], [id]);
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const { add } = useCart();

  const discount =
    product.originalPrice && product.originalPrice > product.price;

  return (
    <div className="container py-8 md:py-10">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="aspect-square overflow-hidden rounded-xl border bg-muted">
            <img
              src={product.images[active]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {product.images.map((img, i) => (
              <button
                key={i}
                className={`overflow-hidden rounded-lg border ${
                  i === active ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setActive(i)}
              >
                <img
                  src={img}
                  alt="thumb"
                  className="aspect-square h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">{product.name}</h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
            <span>SKU: {product.sku}</span>
            <span>•</span>
            <span
              className={
                product.availability === "in_stock"
                  ? "text-emerald-600"
                  : "text-rose-600"
              }
            >
              {product.availability === "in_stock"
                ? "In stock"
                : "Out of stock"}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-semibold">
              {currency(product.price)}
            </span>
            {discount && (
              <>
                <span className="text-sm text-muted-foreground line-through">
                  {currency(product.originalPrice!)}
                </span>
                <Badge variant="secondary">
                  Save {currency(product.originalPrice! - product.price)}
                </Badge>
              </>
            )}
          </div>

          {/* Variants */}
          {product.variants?.map((v) => (
            <div key={v.label} className="mt-5">
              <div className="text-sm font-medium">{v.label}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {v.options.map((o) => (
                  <button
                    key={o.id}
                    onClick={() =>
                      setSelected((s) => ({ ...s, [v.label]: o.id }))
                    }
                    className={`rounded-md border px-3 py-1.5 text-sm ${
                      selected[v.label] === o.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-accent"
                    }`}
                  >
                    {o.name}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div className="mt-5 flex items-center gap-3">
            <div className="flex items-center rounded-md border">
              <button
                className="px-3 py-2"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                -
              </button>
              <span className="min-w-10 text-center">{qty}</span>
              <button
                className="px-3 py-2"
                onClick={() => setQty((q) => q + 1)}
              >
                +
              </button>
            </div>
            <Button
              className="flex-1"
              onClick={() =>
                add(
                  {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.images[0],
                  },
                  qty
                )
              }
              disabled={product.availability !== "in_stock"}
            >
              Add to cart
            </Button>
            <Button
              variant="secondary"
              disabled={product.availability !== "in_stock"}
            >
              Buy now
            </Button>
          </div>

          <Separator className="my-6" />

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Delivery: Estimated 3-5 business days</p>
            <p>Shipping: Free over $100</p>
            <p>Returns: 30-day return policy</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="details" className="mt-12">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="specs">Key features</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        <TabsContent
          value="details"
          className="prose prose-sm mt-4 max-w-none dark:prose-invert"
        >
          <p>{product.description}</p>
        </TabsContent>
        <TabsContent value="specs" className="mt-4">
          <ul className="list-inside list-disc space-y-1 text-sm">
            {product.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </TabsContent>
        <TabsContent
          value="reviews"
          className="mt-4 text-sm text-muted-foreground"
        >
          <p>No reviews yet.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
