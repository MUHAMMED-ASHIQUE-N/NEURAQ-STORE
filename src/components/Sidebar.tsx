import React from "react";
import { Box, ShoppingCart, Package, Cpu, ShieldCheck } from "lucide-react";

type NavItem = {
  key: "approvals" | "amazon" | "local" | "software";
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  gradient: string;
};

type SidebarProps = {
  activeModule: NavItem["key"];
  setActiveModule: (key: NavItem["key"]) => void;
};

const navItems: NavItem[] = [
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

export default function Sidebar({
  activeModule,
  setActiveModule,
}: SidebarProps) {
  return (
    <aside className="w-72 p-6 bg-white shadow flex flex-col space-y-6">
      {/* Sidebar heading */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
        <ShieldCheck size={36} className="text-indigo-600" />
        <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-600">
          Admin Dashboard
        </h1>
      </div>
      {navItems.map(({ key, label, icon: Icon, gradient }) => (
        <button
          key={key}
          onClick={() => setActiveModule(key)}
          className={`flex items-center gap-3 text-white rounded-lg px-4 py-3 text-lg font-semibold shadow-lg transition-colors duration-300 
              ${
                activeModule === key
                  ? gradient
                  : "bg-gray-300 hover:bg-gray-400 text-gray-800"
              }
            `}
        >
          <Icon size={24} />
          {label}
        </button>
      ))}
    </aside>
  );
}
