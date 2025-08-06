import React, { useState } from "react";
import LocalSidebar from "../components/LocalSidebar";
import LocalProducts from "./LocalProducts";

export default function LocalProductsPage() {
  const [active, setActive] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <LocalSidebar active={active} onSelect={() => setActive(true)} />
      <main className="flex-1 p-6 overflow-auto">
        {active && <LocalProducts />}
      </main>
    </div>
  );
}
