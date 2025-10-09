import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { firestore } from "../firebase";
import ProductsList from "../components/shop/ProductCard";

interface Product {
  id: string;
  title: string;
  name: string;
  description: string;
  finalPrice: number;
  originalPrice?: number;
  rating?: number;
  reviews?: number;
  images?: string[];
  quantity?: number;
}

const collectionMap: Record<string, string> = {
  amazon: "amazonProducts",
  local: "localProducts",
  software: "softwareProducts",
};

export default function ProductsPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const q = params.get("q")?.toLowerCase().trim() || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const category = params.get("category");

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      let results: Product[] = [];
      // Filter by category
      const chosenCollection = category && collectionMap[category];
      if (chosenCollection) {
        if (q) {
          // Search filtering in chosen category
          const queries = [
            query(
              collection(firestore, chosenCollection),
              where("title", ">=", q),
              where("title", "<=", q + "\uf8ff")
            ),
            query(
              collection(firestore, chosenCollection),
              where("name", ">=", q),
              where("name", "<=", q + "\uf8ff")
            ),
            query(
              collection(firestore, chosenCollection),
              where("description", ">=", q),
              where("description", "<=", q + "\uf8ff")
            ),
          ];
          let allResults: Product[] = [];
          for (const qy of queries) {
            const snap = await getDocs(qy);
            snap.forEach((doc) =>
              allResults.push({
                id: doc.id,
                ...(doc.data() as Omit<Product, "id">),
              })
            );
          }
          // Deduplicate by id
          const seen = new Set();
          results = allResults.filter((item) => {
            if (seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
          });
        } else {
          // Load all from chosen category
          const snap = await getDocs(collection(firestore, chosenCollection));
          results = snap.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Product, "id">),
          }));
        }
      } else if (q) {
        // Search filtering across all collections
        const collections = Object.values(collectionMap);
        const queries = collections.flatMap((col) => [
          query(
            collection(firestore, col),
            where("title", ">=", q),
            where("title", "<=", q + "\uf8ff")
          ),
          query(
            collection(firestore, col),
            where("name", ">=", q),
            where("name", "<=", q + "\uf8ff")
          ),
          query(
            collection(firestore, col),
            where("description", ">=", q),
            where("description", "<=", q + "\uf8ff")
          ),
        ]);
        let allResults: Product[] = [];
        for (const qy of queries) {
          const snap = await getDocs(qy);
          snap.forEach((doc) =>
            allResults.push({
              id: doc.id,
              ...(doc.data() as Omit<Product, "id">),
            })
          );
        }
        // Deduplicate by id
        const seen = new Set();
        results = allResults.filter((item) => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
      } else {
        // Load all products from all collections
        const collections = Object.values(collectionMap);
        let allProducts: Product[] = [];
        for (const col of collections) {
          const snap = await getDocs(collection(firestore, col));
          allProducts = [
            ...allProducts,
            ...snap.docs.map((doc) => ({
              id: doc.id,
              ...(doc.data() as Omit<Product, "id">),
            })),
          ];
        }
        results = allProducts;
      }

      setProducts(results);
      setLoading(false);
    }
    fetchProducts();
  }, [q, category]);

  return (
    <div className="container py-8 md:py-10">
      {loading && <div>Loading...</div>}
      {!loading && products.length === 0 && <div>No products found.</div>}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductsList key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
