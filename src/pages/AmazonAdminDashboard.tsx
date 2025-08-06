import React, { useState } from "react";
import AmazonSidebar from "../components/AmazonSidebar";
import AmazonProducts from "./AmazonProducts";

/**
 * Renders the Amazon admin dashboard with a sidebar and Amazon products module.
 */
export default function AmazonAdminDashboard() {
  // Only one module, so always active.
  const [active, setActive] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AmazonSidebar active={active} onSelect={() => setActive(true)} />
      <main className="flex-1 p-6 overflow-auto">
        {active && <AmazonProducts />}
      </main>
    </div>
  );
}
