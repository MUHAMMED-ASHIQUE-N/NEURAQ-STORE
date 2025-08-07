import React from "react";
import { Package, ShieldCheck, LogOut } from "lucide-react";
import { useUser } from "../contexts/UserContext";

type SidebarProps = {
  active: boolean; // which module is active, here likely only one
  onSelect: () => void; // function to activate the module
  userEmail?: string; // logged in user's email
  onLogout: () => void; // logout function
  sidebarOpen: boolean; // sidebar visibility on mobile/md
  toggleSidebar: () => void; // toggle function to show/hide sidebar
};

export default function Sidebar({
  active,
  onSelect,
  userEmail,
  onLogout,
  sidebarOpen,
  toggleSidebar,
}: SidebarProps) {
  const { user } = useUser();
  return (
    <>
      {/* Overlay behind sidebar on mobile/md when open */}
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
        aria-label="Local Sidebar"
      >
        {/* Mobile/Medium header with close button */}
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

        {/* Navigation (single or multiple if you want) */}
        <nav className="flex-grow px-4 py-6 overflow-y-auto space-y-3">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <ShieldCheck size={36} className="text-indigo-600" />
            <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-600">
              Admin Dashboard
            </h1>
          </div>
          <button
            onClick={() => {
              onSelect();
              toggleSidebar(); // close on mobile/md after click
            }}
            aria-current={active ? "page" : undefined}
            className={`w-full flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium
              focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500
              ${
                active
                  ? "text-white bg-gradient-to-r from-yellow-400 via-red-400 to-pink-400"
                  : "text-gray-700 hover:bg-indigo-100"
              }
            `}
          >
            <Package size={20} />
            <span>Local Products</span>
          </button>

          {/* If you want, add other nav items here with similar pattern */}
        </nav>

        {/* User info and logout at bottom */}
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
