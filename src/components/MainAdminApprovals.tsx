import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "../firebase";

interface Product {
  id: string;
  title: string;
  name: string;
  description: string;
  approved: boolean;
  rejected?: boolean;
  createdBy: string;
  createdAt?: string;
  // add other fields as necessary
}

export default function MainAdminApprovals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Query for products NOT approved and NOT rejected (pending)
    const q = query(
      collection(firestore, "products"),
      where("approved", "==", false),
      where("rejected", "in", [false, null]) // include products pending approval
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const prods: Product[] = [];
        snapshot.forEach((doc) => {
          prods.push({ id: doc.id, ...(doc.data() as Product) });
        });
        setProducts(prods);
        setLoading(false);
      },
      (err) => {
        setError("Failed to fetch pending approvals: " + err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Approve product — sets approved: true and approvedAt timestamp
  async function approveProduct(productId: string) {
    setActionLoading(productId);
    setError("");
    try {
      const productRef = doc(firestore, "products", productId);
      await updateDoc(productRef, {
        approved: true,
        approvedAt: new Date().toISOString(),
      });
    } catch (err) {
      setError("Failed to approve product: " + (err as Error).message);
    } finally {
      setActionLoading(null);
    }
  }

  // Reject product — mark rejected: true with rejectedAt timestamp (or delete if preferred)
  async function rejectProduct(productId: string) {
    setActionLoading(productId);
    setError("");
    try {
      const productRef = doc(firestore, "products", productId);
      // Optionally delete:
      // await deleteDoc(productRef);

      // Or mark as rejected:
      await updateDoc(productRef, {
        approved: false,
        rejected: true,
        rejectedAt: new Date().toISOString(),
      });
    } catch (err) {
      setError("Failed to reject product: " + (err as Error).message);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) return <div>Loading pending approvals...</div>;

  return (
    <div className="max-w-5xl p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Pending Product Approvals</h2>

      {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}

      {products.length === 0 ? (
        <div>No pending product approvals.</div>
      ) : (
        <table className="min-w-full table-auto text-left text-sm text-gray-700">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4">Title</th>
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4 max-w-xs">Description</th>
              <th className="py-2 px-4">Created By</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod) => (
              <tr key={prod.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">{prod.title}</td>
                <td className="py-2 px-4">{prod.name}</td>
                <td
                  className="py-2 px-4 max-w-xs truncate"
                  title={prod.description}
                >
                  {prod.description}
                </td>
                <td className="py-2 px-4">{prod.createdBy}</td>
                <td className="py-2 px-4 flex gap-2">
                  <button
                    disabled={actionLoading === prod.id}
                    onClick={() => approveProduct(prod.id)}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {actionLoading === prod.id ? "Approving..." : "Approve"}
                  </button>
                  <button
                    disabled={actionLoading === prod.id}
                    onClick={() => rejectProduct(prod.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    {actionLoading === prod.id ? "Rejecting..." : "Reject"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
