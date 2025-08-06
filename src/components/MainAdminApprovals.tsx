import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { firestore } from "../firebase";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  CheckCircle,
  XCircle,
  Send,
} from "lucide-react";

// ...rest of your code...
type Product = {
  id: string;
  title: string;
  name: string;
  quantity: number;
  finalPrice: number;
  createdBy: string;
  collectionName: string;
};

type User = {
  id: string;
  email: string;
  role: string;
};

const SEMI_ADMIN_ROLES = [
  "amazon-semi-admin",
  "local-semi-admin",
  "software-semi-admin",
];

export default function MainAdminApprovals() {
  // ...existing state/logic...
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // --- User Management State ---
  const [users, setUsers] = useState([]);
  const [roleEdits, setRoleEdits] = useState<{ [id: string]: string }>({});
  const [pendingSave, setPendingSave] = useState<{ [id: string]: boolean }>({});
  const [roleError, setRoleError] = useState<string | null>(null);

  // Fetch products to approve (existing logic)
  useEffect(() => {
    const collections = ["amazonProducts", "localProducts", "softwareProducts"];
    let unsubscribes: (() => void)[] = [];
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
          mergedProducts = mergedProducts.filter(
            (p) => p.collectionName !== collectionName
          );
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
    collections.forEach(loadFromCollection);
    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, []);

  // Fetch users
  useEffect(() => {
    const unsub = onSnapshot(collection(firestore, "users"), (snap) => {
      const usrs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(usrs);
    });
    return () => unsub();
  }, []);

  // Handler to start editing a role
  function handleEditRole(id: string, current: string) {
    setRoleEdits({ ...roleEdits, [id]: current });
  }

  // Handler to set new role
  function handleChangeRole(id: string, value: string) {
    setRoleEdits({ ...roleEdits, [id]: value });
  }

  // Handler to submit role change
  async function handleSubmitRole(id: string) {
    setPendingSave({ ...pendingSave, [id]: true });
    setRoleError(null);
    try {
      await updateDoc(doc(firestore, "users", id), { role: roleEdits[id] });
      setRoleEdits((ed) => {
        const out = { ...ed };
        delete out[id];
        return out;
      });
    } catch (e: any) {
      setRoleError("Failed to save role: " + e.message);
    } finally {
      setPendingSave((p) => {
        const out = { ...p };
        delete out[id];
        return out;
      });
    }
  }

  // Handler to cancel role edit
  function handleCancelEdit(id: string) {
    setRoleEdits((ed) => {
      const out = { ...ed };
      delete out[id];
      return out;
    });
  }

  // ...rest of your product approvals render...
  // Approve product
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

  // Reject product
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

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded shadow flex flex-col gap-10">
      {/* --- Your existing pending approvals table --- */}
      <div>
        <h2 className="text-2xl mb-4 font-semibold">
          Pending Product Approvals
        </h2>
        {loading ? (
          <div>Loading pending approvals...</div>
        ) : error ? (
          <div className="text-red-600 mb-4">{error}</div>
        ) : products.length === 0 ? (
          <div>No pending approvals.</div>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">Source</th>
                <th className="border px-4 py-2">Title</th>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Quantity</th>
                <th className="border px-4 py-2">Final Price</th>
                <th className="border px-4 py-2">Created By</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod.id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2 capitalize">
                    {prod.collectionName.replace("Products", "")}
                  </td>
                  <td className="border px-4 py-2">{prod.title}</td>
                  <td className="border px-4 py-2">{prod.name}</td>
                  <td className="border px-4 py-2">{prod.quantity}</td>
                  <td className="border px-4 py-2">
                    ${prod.finalPrice.toFixed(2)}
                  </td>
                  <td className="border px-4 py-2">{prod.createdBy}</td>
                  <td className="border px-4 py-2 flex gap-2">
                    <button
                      onClick={() => approveProduct(prod)}
                      disabled={actionLoading === prod.id}
                      className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-60"
                      title="Approve"
                    >
                      <CheckCircle size={18} />
                      {actionLoading === prod.id ? "Approving..." : "Approve"}
                    </button>
                    <button
                      onClick={() => rejectProduct(prod)}
                      disabled={actionLoading === prod.id}
                      className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-60"
                      title="Reject"
                    >
                      <XCircle size={18} />
                      {actionLoading === prod.id ? "Rejecting..." : "Reject"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* ...all product approvals code here, unchanged... */}

      {/* --- User Management Table (for main admin and role updates) --- */}
      <div className="max-w-4xl mt-12 p-6 bg-white rounded shadow border">
        <h2 className="text-xl font-bold mb-6">Registered Accounts & Roles</h2>
        {roleError && <div className="text-red-600 mb-2">{roleError}</div>}
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-3 py-2 border">Email</th>
              <th className="px-3 py-2 border">Current Role</th>
              <th className="px-3 py-2 border">Change Role</th>
              <th className="px-3 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((usr: any) => (
              <tr key={usr.id} className="border hover:bg-gray-50">
                <td className="px-3 py-2 border">{usr.email}</td>
                <td className="px-3 py-2 border">{usr.role || "user"}</td>
                <td className="px-3 py-2 border">
                  {roleEdits[usr.id] === undefined ? (
                    <button
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition"
                      onClick={() => handleEditRole(usr.id, usr.role || "user")}
                      aria-label="Change role"
                    >
                      <ArrowUpCircle size={18} /> Change
                    </button>
                  ) : (
                    <select
                      value={roleEdits[usr.id]}
                      onChange={(e) => handleChangeRole(usr.id, e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="user">user</option>
                      <option value="amazon-semi-admin">
                        amazon-semi-admin
                      </option>
                      <option value="local-semi-admin">local-semi-admin</option>
                      <option value="software-semi-admin">
                        software-semi-admin
                      </option>
                    </select>
                  )}
                </td>
                <td className="px-3 py-2 border">
                  {roleEdits[usr.id] !== undefined && (
                    <span className="flex gap-2">
                      <button
                        onClick={() => handleSubmitRole(usr.id)}
                        className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-lime-500 text-white rounded px-3 py-1 font-semibold shadow hover:from-green-600 hover:to-lime-600 transition"
                        disabled={pendingSave[usr.id]}
                        aria-label="Submit role change"
                      >
                        <Send size={16} /> Submit
                      </button>
                      <button
                        onClick={() => handleCancelEdit(usr.id)}
                        className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded px-3 py-1 font-semibold shadow hover:from-red-600 hover:to-pink-600 transition"
                        aria-label="Cancel role edit"
                      >
                        <XCircle size={16} /> Cancel
                      </button>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
