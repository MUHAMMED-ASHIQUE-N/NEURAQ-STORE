import React from "react";
import { Package, ShieldCheck, LogOut } from "lucide-react";
import { useUser } from "../contexts/UserContext";

type SidebarProps = {
  activeNav: "local" | "notifications"; // track active nav module
  onSelect: (nav: "local" | "notifications") => void;
  userEmail?: string;
  onLogout: () => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
};

export default function LocalSidebar({
  activeNav,
  onSelect,
  userEmail,
  onLogout,
  sidebarOpen,
  toggleSidebar,
}: SidebarProps) {
  const { user } = useUser();
  return (
    <>
      {/* Sidebar container with slide-in/out on mobile/md */}
      <aside
        className={`
          fixed z-50 inset-y-0 left-0 w-64 bg-white shadow-md
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:inset-auto
          flex flex-col h-full
        `}
        aria-label="Local Sidebar"
      >
        {/* Mobile/medium header with close button */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 lg:hidden">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            onClick={toggleSidebar}
            className="text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            aria-label="Close sidebar"
          >
            {/* Close icon (X) */}
            <svg
              className="h-6 w-6"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation modules */}
        <nav className="flex-grow px-4 py-6 overflow-y-auto space-y-3">
          <button
            onClick={() => {
              onSelect("local");
              toggleSidebar();
            }}
            aria-current={activeNav === "local" ? "page" : undefined}
            className={`w-full flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium
              focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500
              ${
                activeNav === "local"
                  ? "text-white bg-gradient-to-r from-yellow-400 via-red-400 to-pink-400"
                  : "text-gray-700 hover:bg-indigo-100"
              }
            `}
          >
            <Package size={20} />
            <span>Local Products</span>
          </button>

          <button
            onClick={() => {
              onSelect("notifications");
              toggleSidebar();
            }}
            aria-current={activeNav === "notifications" ? "page" : undefined}
            className={`w-full flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium
              focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500
              ${
                activeNav === "notifications"
                  ? "text-white bg-gradient-to-r from-purple-600 via-pink-600 to-red-600"
                  : "text-gray-700 hover:bg-indigo-100"
              }
            `}
          >
            <ShieldCheck size={20} />
            <span>Notifications</span>
          </button>
        </nav>

        {/* User info and logout fixed at bottom */}
        <div className="sticky bottom-0 px-4 py-4 border-t border-gray-200 bg-white">
          <div className="text-gray-700 mb-2 break-words">
            Logged in as: <strong>{user.email ?? "Guest"}</strong>
          </div>
          <button
            onClick={onLogout}
            className="w-full py-2 px-3 bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center justify-center space-x-2"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
