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

export default function ProductsPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const q = params.get("q")?.toLowerCase().trim() || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function fetchProducts(searchTerm: string) {
      setLoading(true);
      if (!searchTerm) {
        // Load all products when no search term
        const collections = [
          "amazonProducts",
          "localProducts",
          "softwareProducts",
        ];
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

        setProducts(allProducts);
        setLoading(false);
        return;
      }

      // Search products by title, name, description in collections
      const collections = [
        "amazonProducts",
        "localProducts",
        "softwareProducts",
      ];
      const queries = collections.flatMap((col) => [
        query(
          collection(firestore, col),
          where("title", ">=", searchTerm),
          where("title", "<=", searchTerm + "\uf8ff")
        ),
        query(
          collection(firestore, col),
          where("name", ">=", searchTerm),
          where("name", "<=", searchTerm + "\uf8ff")
        ),
        query(
          collection(firestore, col),
          where("description", ">=", searchTerm),
          where("description", "<=", searchTerm + "\uf8ff")
        ),
      ]);

      let allResults: Product[] = [];
      for (const q of queries) {
        const snap = await getDocs(q);
        snap.forEach((doc) => {
          const data = doc.data() as Omit<Product, "id">;
          allResults.push({ id: doc.id, ...data });
        });
      }

      // Remove duplicates by id
      const seen = new Set<string>();
      const uniqueResults = allResults.filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });

      setProducts(uniqueResults);
      setLoading(false);
    }

    fetchProducts(q);
  }, [q]);

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
