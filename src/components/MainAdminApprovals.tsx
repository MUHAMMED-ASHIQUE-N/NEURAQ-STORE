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
import { CheckCircle2, XCircle, Pencil, Check, X } from "lucide-react";

type Product = {
  id: string;
  collectionName: "amazonProducts" | "localProducts" | "softwareProducts";
  title: string;
  name: string;
  quantity: number;
  finalPrice: number;
  createdBy: string;
  approved: boolean;
  rejected?: boolean;
};

type User = {
  id: string;
  email: string;
  role?: string;
};

type RoleEdits = Record<string, string | undefined>;

const availableRoles = [
  "user",
  "main-admin",
  "amazon-semi-admin",
  "local-semi-admin",
  "software-semi-admin",
];

export default function MainAdminApprovals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roleEdits, setRoleEdits] = useState<RoleEdits>({});
  const [loadingActionIds, setLoadingActionIds] = useState<string[]>([]);

  // Fetch pending products from all 3 collections
  useEffect(() => {
    const subs = [];

    // Helper: fetch pending docs from a collection, map to unified product and listen
    function fetchPendingProductsFromCollection(
      collectionName: Product["collectionName"]
    ) {
      const q = query(
        collection(firestore, collectionName),
        where("approved", "==", false),
        where("rejected", "==", false)
      );
      return onSnapshot(q, (snapshot) => {
        const prods: Product[] = [];
        snapshot.forEach((docSnap) => {
          prods.push({
            id: docSnap.id,
            collectionName,
            ...(docSnap.data() as Omit<Product, "id" | "collectionName">),
          });
        });
        setProducts((prev) => {
          // Remove old products from this collection and add updated ones
          const rest = prev.filter((p) => p.collectionName !== collectionName);
          return [...rest, ...prods];
        });
      });
    }

    subs.push(fetchPendingProductsFromCollection("amazonProducts"));
    subs.push(fetchPendingProductsFromCollection("localProducts"));
    subs.push(fetchPendingProductsFromCollection("softwareProducts"));

    return () => {
      subs.forEach((unsub) => unsub());
    };
  }, []);

  // Fetch users collection
  useEffect(() => {
    const q = collection(firestore, "users");
    const unsub = onSnapshot(q, (snapshot) => {
      const loadedUsers: User[] = [];
      snapshot.forEach((doc) => {
        loadedUsers.push({ id: doc.id, ...(doc.data() as User) });
      });
      setUsers(loadedUsers);
    });
    return () => unsub();
  }, []);

  // Handle approve product: set approved = true
  async function approveProduct(product: Product) {
    setLoadingActionIds((ids) => [...ids, product.id]);
    try {
      const ref = doc(firestore, product.collectionName, product.id);
      await updateDoc(ref, { approved: true, rejected: false });
      // Automatically removed from pending due to query filter
    } catch (e) {
      alert("Failed to approve product: " + (e as Error).message);
    } finally {
      setLoadingActionIds((ids) => ids.filter((id) => id !== product.id));
    }
  }

  // Handle reject product: set rejected = true
  async function rejectProduct(product: Product) {
    setLoadingActionIds((ids) => [...ids, product.id]);
    try {
      const ref = doc(firestore, product.collectionName, product.id);
      await updateDoc(ref, { rejected: true, approved: false });
      // Automatically removed from pending due to query filter
    } catch (e) {
      alert("Failed to reject product: " + (e as Error).message);
    } finally {
      setLoadingActionIds((ids) => ids.filter((id) => id !== product.id));
    }
  }

  // Handle initiating role edit for a user
  function initiateRoleEdit(userId: string) {
    setRoleEdits((prev) => ({
      ...prev,
      [userId]: users.find((u) => u.id === userId)?.role || "user",
    }));
  }

  // Handle change role selection
  function changeRole(userId: string, role: string) {
    setRoleEdits((prev) => ({ ...prev, [userId]: role }));
  }

  // Cancel role editing for a user
  function cancelRoleEdit(userId: string) {
    setRoleEdits((prev) => {
      const copy = { ...prev };
      delete copy[userId];
      return copy;
    });
  }

  // Submit role change to Firestore
  async function submitRoleChange(userId: string) {
    if (!roleEdits[userId]) return;
    setLoadingActionIds((ids) => [...ids, userId]);
    try {
      const ref = doc(firestore, "users", userId);
      await updateDoc(ref, { role: roleEdits[userId] });
      // Clear edit state
      cancelRoleEdit(userId);
    } catch (e) {
      alert("Failed to update user role: " + (e as Error).message);
    } finally {
      setLoadingActionIds((ids) => ids.filter((id) => id !== userId));
    }
  }

  const isLoading = (id: string) => loadingActionIds.includes(id);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-full">
      {/* Products Pending Approval Table */}
      <div className="overflow-x-auto mb-10">
        <h2 className="text-xl font-semibold mb-4">
          Pending Product Approvals
        </h2>
        <table className="min-w-full table-auto border border-gray-300 divide-y divide-gray-200 rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-2 text-left text-xs md:text-sm font-medium text-gray-500 uppercase min-w-[80px]">
                Collection
              </th>
              <th className="px-2 py-2 text-left text-xs md:text-sm font-medium text-gray-500 uppercase min-w-[120px]">
                Title
              </th>
              <th className="px-2 py-2 text-left text-xs md:text-sm font-medium text-gray-500 uppercase min-w-[100px]">
                Name
              </th>
              <th className="px-2 py-2 text-center whitespace-nowrap text-xs md:text-sm font-medium text-gray-500 uppercase min-w-[60px]">
                Quantity
              </th>
              <th className="px-2 py-2 text-left whitespace-nowrap text-xs md:text-sm font-medium text-gray-500 uppercase min-w-[100px]">
                Final Price
              </th>
              <th className="px-2 py-2 text-left whitespace-nowrap text-xs md:text-sm font-medium text-gray-500 uppercase min-w-[120px]">
                Created By
              </th>
              <th className="px-2 py-2 text-left whitespace-nowrap text-xs md:text-sm font-medium text-gray-500 uppercase min-w-[120px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-6 text-gray-500 text-xs md:text-sm"
                >
                  No pending products for approval.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={`${product.collectionName}-${product.id}`}
                  className="hover:bg-gray-50"
                >
                  <td className="px-2 py-2 whitespace-nowrap text-xs md:text-sm text-gray-700">
                    {product.collectionName.replace("Products", "")}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs md:text-sm text-gray-700">
                    {product.title}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs md:text-sm text-gray-700">
                    {product.name}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-center text-xs md:text-sm text-gray-700">
                    {product.quantity}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs md:text-sm text-gray-700">
                    ${product.finalPrice.toFixed(2)}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs md:text-sm text-gray-700">
                    {product.createdBy}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs md:text-sm text-gray-700 flex space-x-2">
                    <button
                      disabled={isLoading(product.id)}
                      onClick={() => approveProduct(product)}
                      title="Approve"
                      className="flex items-center space-x-1 text-green-600 hover:text-green-800 disabled:opacity-50"
                    >
                      <CheckCircle2 size={16} />
                      <span>Accept</span>
                    </button>
                    <button
                      disabled={isLoading(product.id)}
                      onClick={() => rejectProduct(product)}
                      title="Reject"
                      className="flex items-center space-x-1 text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      <XCircle size={16} />
                      <span>Reject</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">Users</h2>
        <table className="min-w-full table-auto border border-gray-300 divide-y divide-gray-200 rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-2 text-left text-xs md:text-sm font-medium text-gray-500 uppercase min-w-[180px]">
                User
              </th>
              <th className="px-2 py-2 text-left text-xs md:text-sm font-medium text-gray-500 uppercase min-w-[180px]">
                Current Role
              </th>
              <th className="px-2 py-2 text-left text-xs md:text-sm font-medium text-gray-500 uppercase min-w-[220px]">
                Change Role
              </th>
              <th className="px-2 py-2 text-left text-xs md:text-sm font-medium text-gray-500 uppercase min-w-[140px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-6 text-gray-500 text-xs md:text-sm"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const editing = roleEdits.hasOwnProperty(user.id);
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-2 py-2 text-xs md:text-sm text-gray-700 whitespace-nowrap">
                      {user.email}
                    </td>
                    <td className="px-2 py-2 text-xs md:text-sm text-gray-700 whitespace-nowrap">
                      {user.role || "user"}
                    </td>
                    <td className="px-2 py-2 text-xs md:text-sm text-gray-700">
                      {editing ? (
                        <select
                          value={roleEdits[user.id]}
                          onChange={(e) => changeRole(user.id, e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-xs md:text-sm"
                        >
                          {availableRoles.map((role) => (
                            <option key={role} value={role}>
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <button
                          onClick={() => initiateRoleEdit(user.id)}
                          className="flex items-center space-x-1 text-blue-600 hover:underline"
                          title="Change Role"
                        >
                          <Pencil size={14} />
                          <span>Change Role</span>
                        </button>
                      )}
                    </td>
                    <td className="px-2 py-2 text-xs md:text-sm text-gray-700 whitespace-nowrap">
                      {editing && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => submitRoleChange(user.id)}
                            disabled={isLoading(user.id)}
                            className="flex items-center space-x-1 text-green-600 hover:text-green-800 disabled:opacity-50"
                            title="Submit Role Change"
                          >
                            <Check size={16} />
                            <span>Submit</span>
                          </button>
                          <button
                            onClick={() => cancelRoleEdit(user.id)}
                            className="flex items-center space-x-1 text-red-600 hover:text-red-800"
                            title="Cancel Role Change"
                          >
                            <X size={16} />
                            <span>Cancel</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
