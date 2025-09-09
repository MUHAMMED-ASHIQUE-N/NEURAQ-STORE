import React, { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { firestore } from "../firebase";
import { Bell } from "lucide-react";

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
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Bell className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-xl md:text-3xl font-bold text-gray-800">
                  Local Product Notifications
                </h1>
                <p className="text-sm md:text-base text-gray-600">
                  Stay updated on your product submissions
                </p>
              </div>
            </div>
          </div>
        </div>
        {notifications.length === 0 && (
          <div className="text-gray-500 text-center py-8">
            No notifications yet.
          </div>
        )}
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`notification-item bg-white rounded-xl shadow-md border-l-4 border-green-500 p-4 md:p-6
              ${
                n.status === "approved"
                  ? "bg-green-50 border mb-4 border-green-300 text-green-700"
                  : "bg-red-50 border mb-4 border-red-300 text-red-700"
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
