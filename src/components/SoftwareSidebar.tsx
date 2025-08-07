import React from "react";
import { Cpu, ShieldCheck, LogOut } from "lucide-react";
import { useUser } from "../contexts/UserContext";

type SidebarProps = {
  active: boolean; // active nav module indicator
  onSelect: () => void; // handler to select the module
  userEmail?: string; // logged in user email
  onLogout: () => void; // logout handler
  sidebarOpen: boolean; // sidebar visibility state (mobile/md)
  toggleSidebar: () => void; // toggle sidebar visibility handler
};

export default function SoftwareSidebar({
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
      {/* Overlay to cover screen when sidebar is open on mobile/md */}
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
        aria-label="Software Sidebar"
      >
        {/* Mobile & Medium header with close button */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 lg:hidden">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            onClick={toggleSidebar}
            className="text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            aria-label="Close sidebar"
          >
            {/* Close (X) icon */}
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
          {/* Software Products Nav */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <ShieldCheck size={36} className="text-indigo-600" />
            <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-600">
              Admin Dashboard
            </h1>
          </div>
          <button
            onClick={() => {
              onSelect();
              toggleSidebar(); // close sidebar on mobile/md after click
            }}
            aria-current={active ? "page" : undefined}
            className={`w-full flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium
              focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500
              ${
                active
                  ? "text-white bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400"
                  : "text-gray-700 hover:bg-indigo-100"
              }
            `}
          >
            <Cpu size={20} />
            <span>Software Products</span>
          </button>

          {/* Placeholder for additional nav item */}
        </nav>

        {/* Logged-in Email and Logout button fixed at bottom */}
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
