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
import {
  Check,
  CheckCircle,
  Pencil,
  ShieldCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";

type User = {
  id: string;
  email: string;
  role: string;
};

export default function CreateLocalSemiAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [roleEdits, setRoleEdits] = useState<
    Record<string, string | undefined>
  >({});
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  // Fetch users with role "user" only
  useEffect(() => {
    const q = query(
      collection(firestore, "users"),
      where("role", "==", "user")
    );
    const unsub = onSnapshot(q, (snap) => {
      const users: User[] = [];
      snap.forEach((doc) => users.push({ id: doc.id, ...(doc.data() as any) }));
      setUsers(users);
    });
    return () => unsub();
  }, []);

  function startEdit(userId: string, role: string) {
    setRoleEdits((edits) => ({ ...edits, [userId]: role }));
  }

  function changeRole(userId: string, role: string) {
    setRoleEdits((edits) => ({ ...edits, [userId]: role }));
  }

  function cancelEdit(userId: string) {
    setRoleEdits((edits) => {
      const copy = { ...edits };
      delete copy[userId];
      return copy;
    });
  }

  async function submitEdit(userId: string) {
    const newRole = roleEdits[userId];
    if (!newRole) return;
    setLoadingIds((ids) => [...ids, userId]);
    try {
      await updateDoc(doc(firestore, "users", userId), { role: newRole });
      setMessage(`Role updated to "${newRole}"`);
      cancelEdit(userId);
    } catch (err: any) {
      setMessage("Update failed: " + err.message);
    } finally {
      setLoadingIds((ids) => ids.filter((id) => id !== userId));
    }
  }

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
          <p className="text-gray-600">Create Local Semi Admin</p>
        </div>
        <div className="p-4 md:p-6 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">
            Create New Local Semi Admin
          </h1>
          {message && (
            <div className="mb-6 text-center text-sm text-green-700 bg-green-100 border border-green-300 px-3 py-2 rounded">
              {message}
            </div>
          )}
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
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
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
                        No user accounts found.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => {
                      const editing = user.id in roleEdits;
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
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editing ? (
                              <select
                                value={roleEdits[user.id]}
                                onChange={(e) =>
                                  changeRole(user.id, e.target.value)
                                }
                                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              >
                                <option value="user">User</option>
                                <option value="local-semi-admin">
                                  Local Semi Admin
                                </option>
                              </select>
                            ) : (
                              <button
                                onClick={() => startEdit(user.id, user.role)}
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
                                  onClick={() => submitEdit(user.id)}
                                  disabled={loadingIds.includes(user.id)}
                                  className="action-button inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                  title="Submit Role Change"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  <span>Submit</span>
                                </button>
                                <button
                                  onClick={() => cancelEdit(user.id)}
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
    </div>
  );
}
