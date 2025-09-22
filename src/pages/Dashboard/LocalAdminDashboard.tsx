import React, { useState } from "react";
import LocalSidebar from "../../components/Sidebar/LocalSidebar";
import LocalProducts from "../Products/LocalProducts";
import LocalProductsNotificationPage from "../../components/Notification-Page/LocalProductsNotificationPage";
import { useUser } from "../../contexts/UserContext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import ListedLocalProducts from "../../components/Listed-Products/ListedLocalProducts";

export default function LocalAdminDashboard() {
  const user = useUser();
  const navigate = useNavigate();

  // Now track 3 nav options
  const [activeNav, setActiveNav] = useState<
    "local" | "notifications" | "approvals"
  >("local");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar overlay for mobile */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={toggleSidebar}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <div className="fixed top-14 z-60">
        <LocalSidebar
          activeNav={activeNav}
          onSelect={setActiveNav}
          userEmail={user?.email}
          onLogout={handleLogout}
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64 lg:p-5">
        {/* Header with hamburger on mobile */}
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

        <main className="flex-grow p-4 overflow-auto">
          {activeNav === "local" && <LocalProducts />}
          {activeNav === "notifications" && <LocalProductsNotificationPage />}
          {activeNav === "listed-products" && <ListedLocalProducts />}
        </main>
      </div>
    </div>
  );
}
