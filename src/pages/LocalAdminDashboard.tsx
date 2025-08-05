import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import LocalProducts from "./LocalProducts";

export default function LocalAdminDashboard() {
  const [active, setActive] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar active={active} onSelect={() => setActive(true)} />
      <main className="flex-1 p-6 overflow-auto">
        {active && <LocalProducts />}
      </main>
    </div>
  );
}
