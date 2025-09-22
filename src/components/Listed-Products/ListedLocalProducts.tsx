import { Package } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { firestore } from "../../firebase";
import LocalProductCard from "../Product-Card/LocalProductCard";

type Product = {
  id: string;
  title: string;
  name: string;
  description: string;
  quantity: number;
  images: string[];
  originalPrice: number;
  discountPercent: number;
  finalPrice: number;
  buyingLink: string;
  createdBy: string;
  modifiedBy: string;
  createdAt: string;
  updatedAt: string;
  approved: boolean;
  category: string;
  companyName: string;
};

function ListedLocalProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    // Load only approved products
    const unsub = onSnapshot(
      query(
        collection(firestore, "localProducts"),
        where("approved", "==", true) // already filters only approved
      ),
      (snapshot) => {
        const prods: Product[] = [];
        snapshot.forEach((doc) => {
          prods.push({ id: doc.id, ...(doc.data() as Product) });
        });
        setProducts(prods);
      }
    );
    return () => unsub();
  }, []);
  function handleDelete(id: string) {
    // Firestore deletion should be handled here too if desired
    setProducts((prods) => prods.filter((p) => p.id !== id));
  }
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Local Products</h1>
          </div>
        </div>
        {/* Products List */}
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((prod) => (
                <LocalProductCard
                  key={prod.id}
                  product={prod}
                  onEdit={() => {}}
                  onDelete={handleDelete}
                />
              ))}
              {products.length === 0 && (
                <div className="text-center py-6 text-gray-500 text-sm md:text-base">
                  <h2>No approved products found.</h2>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListedLocalProducts;
