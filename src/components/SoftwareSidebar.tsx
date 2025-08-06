import React from "react";
import { Cpu, ShieldCheck } from "lucide-react";

type SidebarProps = {
  active: boolean;
  onSelect: () => void;
};

export default function Sidebar({ active, onSelect }: SidebarProps) {
  return (
    <aside className="w-72 p-6 bg-white shadow flex flex-col space-y-6">
      {/* Sidebar Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
        <ShieldCheck size={36} className="text-indigo-600" />
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
      </div>

      {/* Navigation */}
      <button
        className={`flex items-center gap-3 text-white rounded-lg px-4 py-3 text-lg font-semibold shadow-lg transition-colors duration-300 ${
          active
            ? "bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400"
            : "bg-gray-300 hover:bg-gray-400 text-gray-800"
        }`}
        onClick={onSelect}
      >
        <Cpu size={24} />
        Software Products
      </button>
    </aside>
  );
}
