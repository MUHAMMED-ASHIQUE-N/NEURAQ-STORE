import React, { useState } from "react";
import MainAdminApprovals from "../components/MainAdminApprovals";
import AmazonProducts from "./AmazonProducts";
import LocalProducts from "./LocalProducts";
import SoftwareProducts from "./SoftwareProducts";

export default function AdminDashboard() {
  const [activeModule, setActiveModule] = useState<
    "approvals" | "amazon" | "local" | "software"
  >("approvals");

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Navigation */}
      <aside className="w-64 p-6 bg-gray-100 flex flex-col gap-3">
        <button
          className={`p-2 rounded font-semibold ${
            activeModule === "approvals"
              ? "bg-indigo-600 text-white"
              : "hover:bg-indigo-200"
          }`}
          onClick={() => setActiveModule("approvals")}
        >
          Product Approvals
        </button>
        <button
          className={`p-2 rounded font-semibold ${
            activeModule === "amazon"
              ? "bg-indigo-600 text-white"
              : "hover:bg-indigo-200"
          }`}
          onClick={() => setActiveModule("amazon")}
        >
          Amazon Products
        </button>
        <button
          className={`p-2 rounded font-semibold ${
            activeModule === "local"
              ? "bg-indigo-600 text-white"
              : "hover:bg-indigo-200"
          }`}
          onClick={() => setActiveModule("local")}
        >
          Local Products
        </button>
        <button
          className={`p-2 rounded font-semibold ${
            activeModule === "software"
              ? "bg-indigo-600 text-white"
              : "hover:bg-indigo-200"
          }`}
          onClick={() => setActiveModule("software")}
        >
          Software Products
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-gray-50 p-6 overflow-auto">
        {activeModule === "approvals" && <MainAdminApprovals />}
        {activeModule === "amazon" && <AmazonProducts />}
        {activeModule === "local" && <LocalProducts />}
        {activeModule === "software" && <SoftwareProducts />}
      </main>
    </div>
  );
}
