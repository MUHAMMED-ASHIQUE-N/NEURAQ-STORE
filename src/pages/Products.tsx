import { useMemo, useState } from "react";
import ProductCard, { type Product } from "../components/shop/ProductCard";
import { Slider } from "../components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { products as productData } from "../data/products";

const allProducts: Product[] = productData.map((p) => ({
  id: p.id,
  name: p.name,
  price: p.price,
  originalPrice: p.originalPrice,
  rating: p.rating,
  reviews: p.reviews,
  image: p.images[0],
}));

const brands = ["Aurora", "Acme", "Nexus", "Zephyr"] as const;
const categories = ["fashion", "electronics", "home"] as const;

import { useLocation } from "react-router-dom";

export default function ProductsPage() {
  const params = new URLSearchParams(useLocation().search);
  const q = params.get("q")?.toLowerCase().trim() || "";

  const [price, setPrice] = useState([0, 300]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sort, setSort] = useState("popularity");

  const filtered = useMemo(() => {
    let list = allProducts.filter(
      (p) => p.price >= price[0] && p.price <= price[1]
    );
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q));
    if (selectedBrands.length)
      list = list.filter((p) => selectedBrands.includes(guessBrand(p.name)));
    if (selectedCategories.length)
      list = list.filter((p) =>
        selectedCategories.some((c) => p.name.toLowerCase().includes(c))
      );

    switch (sort) {
      case "price-asc":
        list = list.slice().sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list = list.slice().sort((a, b) => b.price - a.price);
        break;
      case "newest":
        list = list.slice().reverse();
        break;
      default:
        break;
    }
    return list;
  }, [q, price, selectedBrands, selectedCategories, sort]);

  function toggle(arr: string[], value: string) {
    return arr.includes(value)
      ? arr.filter((v) => v !== value)
      : [...arr, value];
  }

  return (
    <div className="container py-8 md:py-10">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold md:text-2xl">
          {q ? `Search results for “${q}”` : "All Products"}
        </h1>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="popularity">Popularity</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col-1 gap-8">
        <aside className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold">Price range</h3>
            <div className="mt-4">
              <Slider
                value={price}
                onValueChange={setPrice}
                step={10}
                min={0}
                max={300}
                className=""
              />
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>${price[0]}</span>
                <span>${price[1]}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Brand</h3>
            <div className="mt-3 space-y-3 text-sm">
              {brands.map((b) => (
                <label
                  key={b}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <Checkbox
                    checked={selectedBrands.includes(b)}
                    onCheckedChange={() =>
                      setSelectedBrands((v) => toggle(v, b))
                    }
                  />
                  <span>{b}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Category</h3>
            <div className="mt-3 space-y-3 text-sm">
              {categories.map((c) => (
                <label
                  key={c}
                  className="flex cursor-pointer items-center gap-2 capitalize"
                >
                  <Checkbox
                    checked={selectedCategories.includes(c)}
                    onCheckedChange={() =>
                      setSelectedCategories((v) => toggle(v, c))
                    }
                  />
                  <span>{c}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        <section>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function guessBrand(name: string): string {
  const h = name.toLowerCase();
  if (h.includes("pro") || h.includes("smart") || h.includes("wireless"))
    return "Nexus";
  if (h.includes("chair") || h.includes("lamp") || h.includes("home"))
    return "Zephyr";
  if (h.includes("shirt") || h.includes("shoes") || h.includes("backpack"))
    return "Aurora";
  return "Acme";
}
