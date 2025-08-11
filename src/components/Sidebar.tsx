import React from "react";
import { Box, ShoppingCart, Package, Cpu, LogOut } from "lucide-react";
import { useUser } from "../contexts/UserContext";

type NavItem = {
  key: "approvals" | "amazon" | "local" | "software";
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  gradient: string;
};

type SidebarProps = {
  activeModule: NavItem["key"];
  setActiveModule: (key: NavItem["key"]) => void;
  userEmail?: string; // logged in user's email
  onLogout: () => void; // logout handler
  sidebarOpen: boolean; // controls sidebar visibility (mobile + md)
  toggleSidebar: () => void; // toggle visibility function
};

const navItems: NavItem[] = [
  {
    key: "approvals",
    label: "Product Approvals",
    icon: Box,
    gradient: "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500",
  },
  {
    key: "amazon",
    label: "Amazon Products",
    icon: ShoppingCart,
    gradient: "bg-gradient-to-r from-green-400 via-blue-500 to-purple-600",
  },
  {
    key: "local",
    label: "Local Products",
    icon: Package,
    gradient: "bg-gradient-to-r from-yellow-400 via-red-400 to-pink-400",
  },
  {
    key: "software",
    label: "Software Products",
    icon: Cpu,
    gradient: "bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400",
  },
];

export default function Sidebar({
  activeModule,
  setActiveModule,
  userEmail,
  onLogout,
  sidebarOpen,
  toggleSidebar,
}: SidebarProps) {
  const { user } = useUser();
  return (
    <aside
      className={`
        fixed z-50 inset-y-0 left-0 w-64 bg-white shadow-md
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:inset-auto
        flex flex-col h-screen
      `}
      aria-label="Sidebar navigation"
    >
      {/* Mobile & Medium Header with Close Button */}
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

      {/* Nav modules */}
      <nav className="flex-grow px-4 py-6 overflow-y-auto space-y-3">
        {navItems.map(({ key, label, icon: Icon, gradient }) => {
          const isActive = activeModule === key;

          return (
            <button
              key={key}
              aria-current={isActive ? "page" : undefined}
              onClick={() => {
                setActiveModule(key);
                toggleSidebar(); // close sidebar on mobile/md after selecting
              }}
              className={`w-full flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium
                focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500
                ${
                  isActive
                    ? `text-white ${gradient}`
                    : "text-gray-700 hover:bg-indigo-100"
                }
              `}
            >
              <span
                className={`p-1 rounded-md ${
                  isActive ? "bg-white/30" : "bg-transparent"
                }`}
              >
                <Icon size={20} />
              </span>
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Sticky User Info & Logout at bottom */}
      <div className="sticky bottom-0 px-4 py-4 border-t border-gray-200 bg-white">
        <div className="text-gray-700 mb-2 break-words">
          Logged in as: <strong>{user.email ?? "Guest"}</strong>
        </div>
        <button
          onClick={onLogout}
          className="w-full py-2 px-3 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          <div className="flex items-center justify-center space-x-2">
            <LogOut size={20} />
            <span>Logout</span>
          </div>
        </button>
      </div>
    </aside>
  );
}
