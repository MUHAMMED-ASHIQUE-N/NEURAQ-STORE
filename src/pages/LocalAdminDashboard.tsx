import React, { useState } from "react";
import LocalSidebar from "../components/LocalSidebar";
import LocalProducts from "./LocalProducts";
import LocalProductsNotificationPage from "../components/LocalProductsNotificationPage"; // import notification component
import { useUser } from "../contexts/UserContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function LocalAdminDashboard() {
  const user = useUser();
  const navigate = useNavigate();

  // Use string state to track nav: "local" or "notifications"
  const [activeNav, setActiveNav] = useState<"local" | "notifications">(
    "local"
  );

  // State for sidebar visibility on mobile/medium screens
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Overlay shown when sidebar is open on mobile/md */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={toggleSidebar}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <LocalSidebar
        activeNav={activeNav}
        onSelect={setActiveNav}
        userEmail={user?.email}
        onLogout={handleLogout}
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header containing hamburger button for mobile/md */}
        <header className="bg-white shadow lg:hidden flex items-center justify-between px-4 h-14">
          <button
            onClick={toggleSidebar}
            className="text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            aria-label="Toggle sidebar"
          >
            {/* Hamburger icon */}
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            Local Admin Dashboard
          </h1>
          <div className="w-6" /> {/* spacer */}
        </header>

        <main className="flex-grow p-4 overflow-auto">
          {activeNav === "local" && <LocalProducts />}
          {activeNav === "notifications" && <LocalProductsNotificationPage />}
        </main>
      </div>
    </div>
  );
}
