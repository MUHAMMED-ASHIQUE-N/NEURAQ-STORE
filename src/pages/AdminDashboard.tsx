import React from "react";

const stats = [
  { label: "Total Products", value: 1243 },
  { label: "Pending Approvals", value: 18 },
  { label: "Active Users", value: 512 },
];

const navigation = [
  { name: "All Modules", path: "/admin/modules" },
  { name: "Amazon Products", path: "/admin/amazon-products" },
  { name: "Local Products", path: "/admin/local-products" },
  { name: "Software Products", path: "/admin/software-products" },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm p-6 flex flex-col">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-indigo-700">Admin</h2>
        </div>
        <nav>
          <div className="text-gray-500 font-semibold mb-4">Navigation</div>
          <ul className="space-y-2">
            {navigation.map((link) => (
              <li key={link.path}>
                <a
                  href={link.path}
                  className="block px-3 py-2 rounded-md hover:bg-indigo-100 text-indigo-700 font-medium"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main dashboard content */}
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Quick overview and navigation</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white p-6 rounded-xl shadow flex flex-col items-center"
            >
              <div className="text-2xl font-bold text-indigo-600">
                {stat.value}
              </div>
              <div className="text-gray-700 mt-2">{stat.label}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
