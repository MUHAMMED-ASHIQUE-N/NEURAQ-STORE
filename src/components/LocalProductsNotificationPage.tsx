import React, { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { firestore } from "../firebase";

type Notification = {
  id: string;
  name: string;
  status: "approved" | "rejected";
  timestamp?: any;
};

export default function LocalProductsNotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const q = query(
      collection(firestore, "localProductsNotification"),
      orderBy("timestamp", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const notes: Notification[] = [];
      snap.forEach((doc) => notes.push({ id: doc.id, ...(doc.data() as any) }));
      setNotifications(notes);
    });
    return () => unsub();
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Local Product Notifications</h1>
      <div className="space-y-4">
        {notifications.length === 0 && (
          <div className="text-gray-500 text-center py-8">
            No notifications yet.
          </div>
        )}
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 rounded shadow-sm flex items-center space-x-3
              ${
                n.status === "approved"
                  ? "bg-green-50 border border-green-300 text-green-700"
                  : "bg-red-50 border border-red-300 text-red-700"
              }
            `}
          >
            <span className="flex-1 truncate">
              The product <span className="font-semibold">{n.name}</span> has
              been <span className="capitalize">{n.status}.</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
