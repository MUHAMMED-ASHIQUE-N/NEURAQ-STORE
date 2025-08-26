import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  getFirestore,
  setDoc,
} from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { firestore } from "../firebase";
import {
  CheckCircle2,
  XCircle,
  Pencil,
  Check,
  X,
  ShieldCheck,
  Clock,
  Users,
  CheckCircle,
  UserPlus,
  Mail,
  Lock,
  Eye,
} from "lucide-react";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("main-admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roleOptions = [
    { value: "user", label: "User" },
    { value: "main-admin", label: "Main Admin" },
    { value: "amazon-semi-admin", label: "Amazon Semi-Admin" },
    { value: "local-semi-admin", label: "Local Semi-Admin" },
    { value: "software-semi-admin", label: "Software Semi-Admin" },
  ];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(false);
    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const db = getFirestore();
      const currentUser = auth.currentUser;
      if (currentUser) {
        await setDoc(doc(db, "users", currentUser.uid), {
          email: currentUser.email,
          role,
          createdAt: serverTimestamp(),
        });
      }
      // Reset or give feedback as needed here
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        setError(
          "This email address is already registered. Please log in instead."
        );
      } else {
        setError("Registration failed: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending products from all 3 collections
  useEffect(() => {
    const subscriptions: Array<() => void> = [];

    function listenForPending(collectionName: Product["collectionName"]) {
      const q = query(
        collection(firestore, collectionName),
        where("approved", "==", false),
        where("rejected", "==", false)
      );
      return onSnapshot(q, (snapshot) => {
        const rows: Product[] = [];
        snapshot.forEach((ds) => {
          rows.push({
            id: ds.id,
            collectionName,
            ...(ds.data() as Omit<Product, "id" | "collectionName">),
          });
        });
        setProducts((prev) => {
          // Remove older results for this collection
          const others = prev.filter(
            (p) => p.collectionName !== collectionName
          );
          return [...others, ...rows];
        });
      });
    }

    subscriptions.push(listenForPending("amazonProducts"));
    subscriptions.push(listenForPending("localProducts"));
    subscriptions.push(listenForPending("softwareProducts"));

    return () => subscriptions.forEach((unsub) => unsub());
  }, []);

  // Fetch all users
  useEffect(() => {
    const unsub = onSnapshot(collection(firestore, "users"), (snapshot) => {
      const loaded: User[] = [];
      snapshot.forEach((doc) =>
        loaded.push({ id: doc.id, ...(doc.data() as User) })
      );
      setUsers(loaded);
    });
    return () => unsub();
  }, []);

  // ----- Product Approvals: Approve/Reject Handlers -----
  async function approveProduct(product: Product) {
    setLoadingActionIds((ids) => [...ids, product.id]);
    try {
      await updateDoc(doc(firestore, product.collectionName, product.id), {
        approved: true,
        rejected: false,
      });
      // Write notification
      let notifCollection = "";
      if (product.collectionName === "amazonProducts")
        notifCollection = "amazonProductsNotification";
      if (product.collectionName === "localProducts")
        notifCollection = "localProductsNotification";
      if (product.collectionName === "softwareProducts")
        notifCollection = "softwareProductsNotification";
      await addDoc(collection(firestore, notifCollection), {
        name: product.name,
        productId: product.id,
        status: "approved",
        timestamp: serverTimestamp(),
      });
    } catch (e) {
      alert("Failed to approve: " + (e as Error).message);
    } finally {
      setLoadingActionIds((ids) => ids.filter((id) => id !== product.id));
    }
  }

  async function rejectProduct(product: Product) {
    setLoadingActionIds((ids) => [...ids, product.id]);
    try {
      await updateDoc(doc(firestore, product.collectionName, product.id), {
        rejected: true,
        approved: false,
      });
      // Write notification
      let notifCollection = "";
      if (product.collectionName === "amazonProducts")
        notifCollection = "amazonProductsNotification";
      if (product.collectionName === "localProducts")
        notifCollection = "localProductsNotification";
      if (product.collectionName === "softwareProducts")
        notifCollection = "softwareProductsNotification";
      await addDoc(collection(firestore, notifCollection), {
        name: product.name,
        productId: product.id,
        status: "rejected",
        timestamp: serverTimestamp(),
      });
    } catch (e) {
      alert("Failed to reject: " + (e as Error).message);
    } finally {
      setLoadingActionIds((ids) => ids.filter((id) => id !== product.id));
    }
  }

  // ----- Role Editing -----
  function startRoleEdit(userId: string) {
    setRoleEdits((edits) => ({
      ...edits,
      [userId]: users.find((u) => u.id === userId)?.role ?? "user",
    }));
  }

  function selectRole(userId: string, role: string) {
    setRoleEdits((edits) => ({
      ...edits,
      [userId]: role,
    }));
  }

  function cancelRoleEdit(userId: string) {
    setRoleEdits((edits) => {
      const copy = { ...edits };
      delete copy[userId];
      return copy;
    });
  }

  async function submitRoleEdit(userId: string) {
    if (!roleEdits[userId]) return;
    setLoadingActionIds((ids) => [...ids, userId]);
    try {
      await updateDoc(doc(firestore, "users", userId), {
        role: roleEdits[userId],
      });
      cancelRoleEdit(userId);
    } catch (e) {
      alert("Failed to update user role: " + (e as Error).message);
    } finally {
      setLoadingActionIds((ids) => ids.filter((id) => id !== userId));
    }
  }
  const handleCancel = () => {
    setEmail("");
    setPassword("");
    setRole("main-admin");
  };
  const isLoading = (id: string) => loadingActionIds.includes(id);

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-gray-600">
            Manage product approvals and user permissions
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserPlus className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                Create New Admin User
              </h2>
            </div>
          </div>
          <form onSubmit={handleRegister} className="space-y-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 ml-2">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    className="w-full pl-10 pr-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all mb-2"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    className="w-full pl-10 pr-12 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <Eye id="passwordEyeIcon" className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Role
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  {roleOptions.map((opt) => (
                    <option value={opt.value} key={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="action-button inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  title="Submit Role Change"
                >
                  <CheckCircle className="w-9 h-9 mr-1" />
                  <span>Submit</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="action-button inline-flex items-center px-3 py-1.5 bg-gray-600 text-white text-xs font-medium rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <XCircle className="w-9 h-9 mr-1" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Products Pending Approval Table */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                Pending Products Approvals
              </h2>
            </div>
          </div>

          <div className="table-container">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Collection
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Final Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {product.collectionName.replace("Products", "")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        ${product.finalPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.createdBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          disabled={isLoading(product.id)}
                          onClick={() => approveProduct(product)}
                          title="Approve"
                          className="action-button inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          <span>Accept</span>
                        </button>
                        <button
                          disabled={isLoading(product.id)}
                          onClick={() => rejectProduct(product)}
                          title="Reject"
                          className="action-button inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <X className="w-3 h-3 mr-1" />
                          <span>Reject</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                Users Management
              </h2>
            </div>
          </div>
          <div className="table-container">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Change Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {user.email}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {user.role || "user"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editing ? (
                            <select
                              value={roleEdits[user.id]}
                              onChange={(e) =>
                                selectRole(user.id, e.target.value)
                              }
                              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                              {availableRoles.map((role) => (
                                <option key={role} value={role}>
                                  {role.charAt(0).toUpperCase() + role.slice(1)}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <button
                              onClick={() => startRoleEdit(user.id)}
                              className="flex items-center space-x-1 text-blue-600 hover:underline"
                              title="Change Role"
                            >
                              <Pencil size={14} />
                              <span>Change Role</span>
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {editing && (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => submitRoleEdit(user.id)}
                                disabled={isLoading(user.id)}
                                className="action-button inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                title="Submit Role Change"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                <span>Submit</span>
                              </button>
                              <button
                                onClick={() => cancelRoleEdit(user.id)}
                                className="action-button inline-flex items-center px-3 py-1.5 bg-gray-600 text-white text-xs font-medium rounded-lg hover:bg-gray-700 transition-colors"
                              >
                                <XCircle className="w-3 h-3 mr-1" />
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
      </div>
    </div>
  );
}
