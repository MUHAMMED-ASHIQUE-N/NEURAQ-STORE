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
import { Check, X } from "lucide-react";

type User = {
  id: string;
  email: string;
  role: string;
};

export default function CreateSoftwareSemiAdmin() {
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
      const loadedUsers: User[] = [];
      snap.forEach((docSnap) =>
        loadedUsers.push({ id: docSnap.id, ...(docSnap.data() as any) })
      );
      setUsers(loadedUsers);
    });
    return () => unsub();
  }, []);

  // Start edit mode for a specific user
  function startEdit(userId: string, currentRole: string) {
    setRoleEdits((prev) => ({ ...prev, [userId]: currentRole }));
  }

  // Handle dropdown change
  function changeRole(userId: string, newRole: string) {
    setRoleEdits((prev) => ({ ...prev, [userId]: newRole }));
  }

  // Cancel edit mode
  function cancelEdit(userId: string) {
    setRoleEdits((prev) => {
      const copy = { ...prev };
      delete copy[userId];
      return copy;
    });
  }

  // Submit role update to Firestore
  async function submitEdit(userId: string) {
    const newRole = roleEdits[userId];
    if (!newRole) return;

    setLoadingIds((prev) => [...prev, userId]);
    try {
      await updateDoc(doc(firestore, "users", userId), { role: newRole });
      setMessage(`Role updated to "${newRole}"`);
      cancelEdit(userId);
    } catch (error: any) {
      setMessage("Update failed: " + error.message);
    } finally {
      setLoadingIds((prev) => prev.filter((id) => id !== userId));
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Create New Software Semi Admin
      </h1>

      {message && (
        <div className="mb-4 text-center text-sm text-green-700 bg-green-100 border border-green-300 px-3 py-2 rounded">
          {message}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border border-gray-300 divide-y divide-gray-200 rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-2 text-left text-xs md:text-sm font-medium uppercase text-gray-500 min-w-[140px]">
                Email
              </th>
              <th className="px-2 py-2 text-left text-xs md:text-sm font-medium uppercase text-gray-500 min-w-[100px]">
                Current Role
              </th>
              <th className="px-2 py-2 text-left text-xs md:text-sm font-medium uppercase text-gray-500 min-w-[180px]">
                Change Role
              </th>
              <th className="px-2 py-2 text-left text-xs md:text-sm font-medium uppercase text-gray-500 min-w-[80px]">
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
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-2 py-2 whitespace-nowrap text-xs md:text-sm text-gray-700">
                      {user.email}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs md:text-sm text-gray-700">
                      {user.role}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs md:text-sm text-gray-700">
                      {editing ? (
                        <select
                          value={roleEdits[user.id]}
                          onChange={(e) => changeRole(user.id, e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-xs md:text-sm"
                        >
                          <option value="user">User</option>
                          <option value="software-semi-admin">
                            Software Semi Admin
                          </option>
                        </select>
                      ) : (
                        <button
                          onClick={() => startEdit(user.id, user.role)}
                          className="text-blue-600 hover:underline text-xs md:text-sm"
                          title="Change Role"
                        >
                          Change Role
                        </button>
                      )}
                    </td>

                    <td className="px-2 py-2 whitespace-nowrap text-xs md:text-sm text-gray-700">
                      {editing && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => submitEdit(user.id)}
                            disabled={loadingIds.includes(user.id)}
                            className="flex items-center space-x-1 text-green-600 hover:text-green-800 disabled:opacity-50"
                            title="Submit"
                          >
                            <Check size={16} />
                            <span>Submit</span>
                          </button>
                          <button
                            onClick={() => cancelEdit(user.id)}
                            className="flex items-center space-x-1 text-red-600 hover:text-red-800"
                            title="Cancel"
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
