import React, { useState } from "react";
import SoftwareSidebar from "../components/SoftwareSidebar";
import SoftwareProducts from "./SoftwareProducts";

export default function SoftwareProductsPage() {
  const [active, setActive] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SoftwareSidebar active={active} onSelect={() => setActive(true)} />
      <main className="flex-1 p-6 overflow-auto">
        {active && <SoftwareProducts />}
      </main>
    </div>
  );
}
