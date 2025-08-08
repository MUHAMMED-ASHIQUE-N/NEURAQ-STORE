import React, { useState } from "react";
import AmazonSidebar from "../components/AmazonSidebar";
import AmazonProducts from "./AmazonProducts";
import AmazonProductsNotificationPage from "../components/AmazonProductsNotificationPage";
import { useUser } from "../contexts/UserContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function AmazonAdminDashboard() {
  const user = useUser();
  const navigate = useNavigate();

  // Which module is active: "products" or "notifications"
  const [activeNav, setActiveNav] = useState<"products" | "notifications">(
    "products"
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Overlay for sidebar on small/medium screens */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={toggleSidebar}
        aria-hidden="true"
      ></div>

      {/* Responsive Sidebar */}
      <AmazonSidebar
        activeNav={activeNav}
        onSelect={(nav) => {
          setActiveNav(nav);
          setSidebarOpen(false);
        }}
        userEmail={user?.email}
        onLogout={handleLogout}
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Responsive header with hamburger */}
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
            Amazon Admin Dashboard
          </h1>
          <div className="w-6" /> {/* spacer for symmetry */}
        </header>

        <main className="flex-grow overflow-auto p-4">
          {activeNav === "products" && <AmazonProducts />}
          {activeNav === "notifications" && <AmazonProductsNotificationPage />}
        </main>
      </div>
    </div>
  );
}
