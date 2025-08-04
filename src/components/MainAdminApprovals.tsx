import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { firestore } from "../firebase";

type Product = {
  id: string;
  title: string;
  name: string;
  quantity: number;
  finalPrice: number;
  createdBy: string;
  collectionName: string; // To track origin collection
};

export default function MainAdminApprovals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const collections = ["amazonProducts", "localProducts", "softwareProducts"];
    let unsubscribes: (() => void)[] = [];

    // Initialize empty temp array to merge results
    let mergedProducts: Product[] = [];

    function loadFromCollection(collectionName: string) {
      const q = query(
        collection(firestore, collectionName),
        where("approved", "==", false),
        where("rejected", "==", false)
      );

      const unsub = onSnapshot(
        q,
        (snapshot) => {
          console.log(
            `Snapshot for ${collectionName}:`,
            snapshot.docs.map((doc) => doc.data())
          );
          // Remove previous docs from this collection in merged state
          mergedProducts = mergedProducts.filter(
            (p) => p.collectionName !== collectionName
          );

          // Append latest docs with collectionName tag
          const newDocs = snapshot.docs.map((docSnap) => {
            const data = docSnap.data() as any;
            return {
              id: docSnap.id,
              title: data.title,
              name: data.name,
              quantity: data.quantity,
              finalPrice:
                data.finalPrice ??
                data.originalPrice * (1 - (data.discountPercent ?? 0) / 100),
              createdBy: data.createdBy,
              collectionName,
            } as Product;
          });

          mergedProducts = [...mergedProducts, ...newDocs];
          setProducts([...mergedProducts]);
          setLoading(false);
        },
        (err) => {
          setError(
            "Failed to load approvals from " +
              collectionName +
              ": " +
              err.message
          );
          setLoading(false);
        }
      );

      unsubscribes.push(unsub);
    }

    // Subscribe to each collection's pending approvals
    collections.forEach(loadFromCollection);

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, []);

  async function approveProduct(prod: Product) {
    setActionLoading(prod.id);
    try {
      const ref = doc(firestore, prod.collectionName, prod.id);
      await updateDoc(ref, {
        approved: true,
        approvedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      setError(`Error approving product: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  }

  async function rejectProduct(prod: Product) {
    setActionLoading(prod.id);
    try {
      const ref = doc(firestore, prod.collectionName, prod.id);
      await deleteDoc(ref);
    } catch (err: any) {
      setError(`Error rejecting product: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) return <div>Loading pending approvals...</div>;

  if (error) return <div className="text-red-600 mb-4">{error}</div>;

  if (products.length === 0) return <div>No pending approvals.</div>;

  return (
    <div className="max-w-6xl p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Pending Product Approvals</h2>
      <table className="min-w-full table-auto border border-gray-300 text-left text-sm text-gray-700">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border border-gray-300">Source</th>
            <th className="py-2 px-4 border border-gray-300">Title</th>
            <th className="py-2 px-4 border border-gray-300">Name</th>
            <th className="py-2 px-4 border border-gray-300">Quantity</th>
            <th className="py-2 px-4 border border-gray-300">Final Price</th>
            <th className="py-2 px-4 border border-gray-300">Created By</th>
            <th className="py-2 px-4 border border-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((prod) => (
            <tr key={prod.id} className="hover:bg-gray-50 border-b">
              <td className="py-2 px-4 border border-gray-300 capitalize">
                {prod.collectionName.replace("Products", "")}
              </td>
              <td className="py-2 px-4 border border-gray-300">{prod.title}</td>
              <td className="py-2 px-4 border border-gray-300">{prod.name}</td>
              <td className="py-2 px-4 border border-gray-300">
                {prod.quantity}
              </td>
              <td className="py-2 px-4 border border-gray-300">
                ${prod.finalPrice.toFixed(2)}
              </td>
              <td className="py-2 px-4 border border-gray-300">
                {prod.createdBy}
              </td>
              <td className="py-2 px-4 border border-gray-300 flex gap-2">
                <button
                  onClick={() => approveProduct(prod)}
                  disabled={actionLoading === prod.id}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading === prod.id ? "Approving..." : "Approve"}
                </button>
                <button
                  onClick={() => rejectProduct(prod)}
                  disabled={actionLoading === prod.id}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading === prod.id ? "Rejecting..." : "Reject"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
