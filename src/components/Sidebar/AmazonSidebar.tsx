import React from "react";
import {
  ShoppingCart,
  ShieldCheck,
  ClipboardCheck,
  LogOut,
  ShoppingBag,
  Barcode,
} from "lucide-react";
import { useUser } from "../../contexts/UserContext";

type SidebarProps = {
  activeNav: "products" | "notifications" | "listed-products";
  onSelect: (nav: "products" | "notifications" | "listed-products") => void;
  userEmail?: string;
  onLogout: () => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
};

export default function AmazonSidebar({
  activeNav,
  onSelect,
  userEmail,
  onLogout,
  sidebarOpen,
  toggleSidebar,
}: SidebarProps) {
  const { user } = useUser(); // If needed, but using userEmail directly

  return (
    <>
      <aside
        className={`
          fixed z-50 inset-y-0 left-0 w-64 bg-white shadow-md
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:inset-auto
          flex flex-col h-screen
        `}
      >
        {/* Mobile close header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 lg:hidden">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            onClick={toggleSidebar}
            className="text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            aria-label="Close sidebar"
          >
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
        <nav className="flex-1 px-4 py-6 space-y-2">
          <div className="mb-6">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Product Management
            </h3>
            {/* Products */}
            <button
              onClick={() => {
                onSelect("products");
                toggleSidebar();
              }}
              aria-current={activeNav === "products" ? "page" : undefined}
              className={`w-full flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium
                focus:outline-none focus:bg-indigo-100
              ${
                activeNav === "products"
                  ? "text-gray-700 hover:bg-indigo-50"
                  : "text-gray-700 hover:bg-indigo-50"
              }
            `}
            >
              <ShoppingBag size={20} />
              <span>Amazon Products</span>
            </button>

            {/* Notifications */}
            <button
              onClick={() => {
                onSelect("notifications");
                toggleSidebar();
              }}
              aria-current={activeNav === "notifications" ? "page" : undefined}
              className={`w-full flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium
                focus:outline-none focus:bg-indigo-100
              ${
                activeNav === "notifications"
                  ? "text-gray-700 hover:bg-indigo-50"
                  : "text-gray-700 hover:bg-indigo-50"
              }
            `}
            >
              <ShieldCheck size={20} />
              <span>Notifications</span>
            </button>

            {/* Listed Products */}
            <button
              onClick={() => {
                onSelect("listed-products");
                toggleSidebar();
              }}
              aria-current={
                activeNav === "listed-products" ? "page" : undefined
              }
              className={`w-full flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium
                focus:outline-none focus:bg-indigo-100
              ${
                activeNav === "listed-products"
                  ? "text-gray-700 hover:bg-indigo-50"
                  : "text-gray-700 hover:bg-indigo-50"
              }
            `}
            >
              <Barcode size={20} />
              <span>Listed Products</span>
            </button>
          </div>
        </nav>

        {/* User info + logout */}
        <div className="sticky bottom-0 px-4 py-4 border-t border-gray-200 bg-white">
          <div className="text-sm font-medium text-gray-900 truncate">
            Logged in as: <strong>{user.email ?? "Guest"}</strong>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors duration-200"
          >
            <div className="flex items-center justify-center space-x-2">
              <LogOut className="w-4 h-4 mr-2" />
              <span>Logout</span>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
