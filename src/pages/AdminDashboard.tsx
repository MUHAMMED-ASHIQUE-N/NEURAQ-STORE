import React, { useState } from "react";
import MultiCollectionApprovals from "../components/MainAdminApprovals";
import AmazonProducts from "./AmazonProducts";
import LocalProducts from "./LocalProducts";
import SoftwareProducts from "./SoftwareProducts";
import Sidebar from "../components/Sidebar";
import { Menu } from "lucide-react";
import { useUser } from "../contexts/UserContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const user = useUser();
  const navigate = useNavigate();

  // State to track active nav module
  const [activeModule, setActiveModule] = useState<
    "approvals" | "amazon" | "local" | "software"
  >("approvals");

  // Sidebar open state for mobile and md screens
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Overlay behind sidebar on mobile/md when sidebar is open */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={toggleSidebar}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <div className="fixed top-14">
        <Sidebar
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          userEmail={user?.email}
          onLogout={handleLogout}
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64 lg:p-5">
        {/* Header for mobile and medium screens with hamburger */}
        <header className="bg-white shadow px-4 h-14 flex items-center justify-between lg:hidden relative z-50">
          <button
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            className="text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          <div className="w-6" /> {/* Spacer */}
        </header>

        {/* Page Content */}
        <main className="flex-grow p-4 overflow-auto">
          {activeModule === "approvals" && <MultiCollectionApprovals />}
          {activeModule === "amazon" && <AmazonProducts />}
          {activeModule === "local" && <LocalProducts />}
          {activeModule === "software" && <SoftwareProducts />}
        </main>
      </div>
    </div>
  );
}
