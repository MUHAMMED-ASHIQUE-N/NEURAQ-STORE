import React from "react";
import { Cpu, ShieldCheck, ClipboardCheck, LogOut } from "lucide-react";
import { useUser } from "../contexts/UserContext";

type SidebarProps = {
  activeNav: "products" | "notifications" | "approvals";
  onSelect: (nav: "products" | "notifications" | "approvals") => void;
  userEmail?: string;
  onLogout: () => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
};

export default function SoftwareSidebar({
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
      <aside
        className={`fixed z-50 inset-y-0 left-0 w-64 bg-white shadow-md
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:inset-auto
        flex flex-col h-full`}
      >
        {/* Mobile close header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 lg:hidden">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            onClick={toggleSidebar}
            className="text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            aria-label="Close sidebar"
          >
            {/* Close icon */}
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

        {/* Navigation */}
        <nav className="flex-grow px-4 py-6 overflow-y-auto space-y-3">
          {/* Products */}
          <button
            onClick={() => {
              onSelect("products");
              toggleSidebar();
            }}
            aria-current={activeNav === "products" ? "page" : undefined}
            className={`w-full flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium
              focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500
              ${
                activeNav === "products"
                  ? "text-white bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400"
                  : "text-gray-700 hover:bg-indigo-100"
              }`}
          >
            <Cpu size={20} />
            <span>Software Products</span>
          </button>

          {/* Notifications */}
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
              }`}
          >
            <ShieldCheck size={20} />
            <span>Notifications</span>
          </button>

          {/* Pending Approvals */}
          <button
            onClick={() => {
              onSelect("approvals");
              toggleSidebar();
            }}
            aria-current={activeNav === "approvals" ? "page" : undefined}
            className={`w-full flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium
              focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500
              ${
                activeNav === "approvals"
                  ? "bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-500 text-white"
                  : "text-gray-700 hover:bg-indigo-100"
              }`}
          >
            <ClipboardCheck size={20} />
            <span>Create Admin</span>
          </button>
        </nav>

        {/* User info + logout */}
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
