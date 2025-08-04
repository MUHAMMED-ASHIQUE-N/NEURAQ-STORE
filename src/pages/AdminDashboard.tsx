import React, { useState } from "react";
import {
  Check,
  X,
  Box,
  ShoppingCart,
  Package,
  Cpu,
  ShieldCheck,
} from "lucide-react";
import MultiCollectionApprovals from "../components/MainAdminApprovals"; // Your renamed multi-collection approvals component
import AmazonProducts from "./AmazonProducts";
import LocalProducts from "./LocalProducts";
import SoftwareProducts from "./SoftwareProducts";

export default function AdminDashboard() {
  const [activeModule, setActiveModule] = useState<
    "approvals" | "amazon" | "local" | "software"
  >("approvals");

  const navItems = [
    {
      key: "approvals",
      label: "Product Approvals",
      icon: Box,
      gradient: "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500",
    },
    {
      key: "amazon",
      label: "Amazon Products",
      icon: ShoppingCart,
      gradient: "bg-gradient-to-r from-green-400 via-blue-500 to-purple-600",
    },
    {
      key: "local",
      label: "Local Products",
      icon: Package,
      gradient: "bg-gradient-to-r from-yellow-400 via-red-400 to-pink-400",
    },
    {
      key: "software",
      label: "Software Products",
      icon: Cpu,
      gradient: "bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-72 p-6 bg-white shadow flex flex-col space-y-6">
        {/* Admin Dashboard Heading */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
          <ShieldCheck size={36} className="text-indigo-600" />
          <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-600">
            Admin Dashboard
          </h1>
        </div>
        {/* Navigation Links */}
        {navItems.map(({ key, label, icon: Icon, gradient }) => (
          <button
            key={key}
            onClick={() => setActiveModule(key as typeof activeModule)}
            className={`flex items-center gap-3 text-white rounded-lg px-4 py-3 text-lg font-semibold shadow-lg
            transition-colors duration-300
            ${
              activeModule === key
                ? gradient
                : "bg-gray-300 hover:bg-gray-400 text-gray-800"
            }`}
          >
            <Icon size={24} />
            {label}
          </button>
        ))}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        {activeModule === "approvals" && <MultiCollectionApprovals />}
        {activeModule === "amazon" && <AmazonProducts />}
        {activeModule === "local" && <LocalProducts />}
        {activeModule === "software" && <SoftwareProducts />}
      </main>
    </div>
  );
}
