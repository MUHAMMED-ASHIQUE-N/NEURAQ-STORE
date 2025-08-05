import React, { useState } from "react";
import MultiCollectionApprovals from "../components/MainAdminApprovals"; // Your renamed multi-collection approvals component
import AmazonProducts from "./AmazonProducts";
import LocalProducts from "./LocalProducts";
import SoftwareProducts from "./SoftwareProducts";
import Sidebar from "../components/Sidebar";

export default function AdminDashboard() {
  const [activeModule, setActiveModule] = useState<
    "approvals" | "amazon" | "local" | "software"
  >("approvals");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />
      <main className="flex-1 p-6 overflow-auto">
        {activeModule === "approvals" && <MultiCollectionApprovals />}
        {activeModule === "amazon" && <AmazonProducts />}
        {activeModule === "local" && <LocalProducts />}
        {activeModule === "software" && <SoftwareProducts />}
      </main>
    </div>
  );
}
