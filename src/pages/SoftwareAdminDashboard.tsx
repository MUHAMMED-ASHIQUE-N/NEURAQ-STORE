import React, { useState } from "react";
import SoftwareSidebar from "../components/SoftwareSidebar";
import SoftwareProducts from "./SoftwareProducts";
import { useUser } from "../contexts/UserContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function SoftwareAdminDashboard() {
  const user = useUser();
  const navigate = useNavigate();

  // Only one active module here, but keeping consistent pattern
  const [active, setActive] = useState(true);

  // Sidebar open state for mobile and medium screens
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Overlay behind sidebar for mobile/md when sidebar open */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={toggleSidebar}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <SoftwareSidebar
        active={active}
        onSelect={() => setActive(true)}
        userEmail={user?.email}
        onLogout={handleLogout}
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header with hamburger toggle on mobile & md */}
        <header className="bg-white shadow lg:hidden flex items-center justify-between px-4 h-14">
          <button
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            className="text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
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
            Software Admin Dashboard
          </h1>
          <div className="w-6" /> {/* Empty div for spacing */}
        </header>

        {/* Page content */}
        <main className="flex-grow overflow-auto p-4">
          {active && <SoftwareProducts />}
        </main>
      </div>
    </div>
  );
}
