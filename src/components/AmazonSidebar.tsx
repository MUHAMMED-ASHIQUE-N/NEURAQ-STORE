import React from "react";
import { ShoppingCart, ShieldCheck } from "lucide-react";

type SidebarProps = {
  active: boolean;
  onSelect: () => void;
};

const AmazonSidebar: React.FC<SidebarProps> = ({ active, onSelect }) => (
  <aside className="w-72 p-6 bg-white shadow flex flex-col space-y-6">
    <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
      <ShieldCheck size={36} className="text-indigo-600" />
      <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-600">
        Admin Dashboard
      </h1>
    </div>
    <button
      onClick={onSelect}
      className={`flex items-center gap-3 text-white rounded-lg px-4 py-3 text-lg font-semibold shadow-lg transition-colors duration-300
        ${
          active
            ? "bg-gradient-to-r from-green-400 via-blue-500 to-purple-600"
            : "bg-gray-300 hover:bg-gray-400 text-gray-800"
        }
      `}
    >
      <ShoppingCart size={24} />
      Amazon Products
    </button>
  </aside>
);

export default AmazonSidebar;
