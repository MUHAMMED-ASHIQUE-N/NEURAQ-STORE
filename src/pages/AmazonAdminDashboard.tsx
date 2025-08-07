import React, { useState } from "react";
import AmazonSidebar from "../components/AmazonSidebar";
import AmazonProducts from "./AmazonProducts";
import { useUser } from "../contexts/UserContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function AmazonAdminDashboard() {
  const user = useUser();
  const navigate = useNavigate();

  // Only one module, but we keep 'active' state for demonstration
  const [active, setActive] = useState(true);

  // Controls sidebar visibility on mobile and md screens
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Toggle sidebar open/close
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  // Logout handler
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Overlay for mobile/md */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={toggleSidebar}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <AmazonSidebar
        active={active}
        onSelect={() => setActive(true)}
        userEmail={user?.email}
        onLogout={handleLogout}
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header with hamburger button for mobile/md */}
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
          <div className="w-6" /> {/* For alignment */}
        </header>

        {/* Page content */}
        <main className="flex-grow overflow-auto p-4">
          {active && <AmazonProducts />}
        </main>
      </div>
    </div>
  );
}
