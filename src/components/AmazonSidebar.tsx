import React from "react";
import { ShoppingCart, ShieldCheck, LogOut } from "lucide-react";
import { useUser } from "../contexts/UserContext";

type SidebarProps = {
  active: boolean; // whether the (only) Amazon module is active
  onSelect: () => void; // function to activate Amazon module (click nav)
  userEmail?: string; // logged in user's email
  onLogout: () => void; // logout handler
  sidebarOpen: boolean; // sidebar open state on mobile/md
  toggleSidebar: () => void; // toggles sidebar
};

const AmazonSidebar: React.FC<SidebarProps> = ({
  active,
  onSelect,
  userEmail,
  onLogout,
  sidebarOpen,
  toggleSidebar,
}) => {
  const { user } = useUser();
  return (
    <>
      {/* Overlay for mobile/md screens */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={toggleSidebar}
        aria-hidden="true"
      ></div>

      <aside
        className={`
          fixed z-50 inset-y-0 left-0 w-64 bg-white shadow-md
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:inset-auto
          flex flex-col h-full
        `}
        aria-label="Amazon Sidebar"
      >
        {/* Mobile & Medium Header with Close button */}
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

        {/* Nav Link for Amazon Products */}
        <nav className="flex-grow px-4 py-6">
          <button
            onClick={() => {
              onSelect();
              toggleSidebar();
            }}
            aria-current={active ? "page" : undefined}
            className={`w-full flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium
              focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500
              ${
                active
                  ? "bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white"
                  : "text-gray-700 hover:bg-indigo-100"
              }
            `}
          >
            <ShoppingCart size={20} />
            <span>Amazon Products</span>
          </button>
        </nav>

        {/* User info and Logout placed at bottom */}
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
};

export default AmazonSidebar;
