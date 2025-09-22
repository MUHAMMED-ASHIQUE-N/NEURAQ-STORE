import { Monitor, Package } from "lucide-react";
import React, { useEffect, useState } from "react";
import AmazonProductCard from "./Product-Card/AmazonProductCard";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { firestore } from "../firebase";
import LocalProductCard from "./Product-Card/LocalProductCard";
import SoftwareProductCard from "./Product-Card/SoftwareProductCard";

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
};
type ProductL = {
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
type ProductS = {
  id: string;
  title: string;
  name: string;
  description: string;
  quantity: number;
  images: string[];
  originalPrice: number;
  discountPercent: number;
  finalPrice: number;
  companyName: string;
  accessDuration: string;
  createdBy: string;
  modifiedBy: string;
  createdAt: string;
  updatedAt: string;
  approved: boolean;
  rejected?: boolean;
};

function AllProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [localProducts, setLocalProducts] = useState<ProductL[]>([]);
  const [softwareProducts, setSoftwareProducts] = useState<ProductS[]>([]);
  useEffect(() => {
    // Load only approved products
    const unsub = onSnapshot(
      query(
        collection(firestore, "amazonProducts"),
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
        setLocalProducts(prods);
      }
    );
    return () => unsub();
  }, []);
  useEffect(() => {
    // Load only approved products
    const unsub = onSnapshot(
      query(
        collection(firestore, "softwareProducts"),
        where("approved", "==", true) // already filters only approved
      ),
      (snapshot) => {
        const prods: ProductS[] = [];
        snapshot.forEach((doc) => {
          prods.push({ id: doc.id, ...(doc.data() as ProductS) });
        });
        setSoftwareProducts(prods);
      }
    );
    return () => unsub();
  }, []);
  function handleDelete(id: string) {
    // Firestore deletion should be handled here too if desired
    setProducts((prods) => prods.filter((p) => p.id !== id));
  }
  function handleDeleteL(id: string) {
    // Firestore deletion should be handled here too if desired
    setLocalProducts((prods) => prods.filter((p) => p.id !== id));
  }
  function handleDeleteS(id: string) {
    // Firestore deletion should be handled here too if desired
    setSoftwareProducts((prods) => prods.filter((p) => p.id !== id));
  }
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Amazon Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Package className="w-6 h-6 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Amazon Products</h1>
        </div>
      </div>
      {/* Amazon Products List */}
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((prod) => (
              <AmazonProductCard
                key={prod.id}
                product={prod}
                onEdit={() => {}}
                onDelete={handleDelete}
              />
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  No approved products found.
                </td>
              </tr>
            )}
          </div>
        </div>
      </div>
      <div className="mt-6">
        {/* Local Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Local Products</h1>
          </div>
        </div>
        {/* LocalProducts List */}
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {localProducts.map((prod) => (
                <LocalProductCard
                  key={prod.id}
                  product={prod}
                  onEdit={() => {}}
                  onDelete={handleDeleteL}
                />
              ))}
              {localProducts.length === 0 && (
                <div className="text-center py-6 text-gray-500 text-sm md:text-base">
                  <h2>No approved products found.</h2>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6">
        {/* Software Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 gradient-bg rounded-lg">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">
              Software Products
            </h1>
          </div>
        </div>
        {/* Software Products List */}
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {softwareProducts.map((prod) => (
                <SoftwareProductCard
                  key={prod.id}
                  product={prod}
                  onEdit={() => {}}
                  onDelete={handleDeleteS}
                />
              ))}
              {softwareProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    No approved products found.
                  </td>
                </tr>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllProducts;
