import React, { useState } from "react";
import AmazonSidebar from "../../components/Sidebar/AmazonSidebar";
import AmazonProducts from "../Products/AmazonProducts";
import AmazonProductsNotificationPage from "../../components/Notification-Page/AmazonProductsNotificationPage";
import { useUser } from "../../contexts/UserContext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import ListedAmazonProducts from "../../components/Listed-Products/ListedAmazonProducts";

export default function AmazonAdminDashboard() {
  const user = useUser();
  const navigate = useNavigate();

  // Active navigation: products, notifications, or approvals
  const [activeNav, setActiveNav] = useState<
    "products" | "notifications" | "approvals"
  >("products");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Overlay for mobile screen */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={toggleSidebar}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <div className="fixed top-14 z-60">
        <AmazonSidebar
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
        {/* Mobile/medium header */}
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

        <main className="flex-grow overflow-auto p-4">
          {activeNav === "products" && <AmazonProducts />}
          {activeNav === "notifications" && <AmazonProductsNotificationPage />}
          {activeNav === "approvals" && <AmazonSemiAdminApprovalsPage />}
          {activeNav === "listed-products" && <ListedAmazonProducts />}
        </main>
      </div>
    </div>
  );
}
