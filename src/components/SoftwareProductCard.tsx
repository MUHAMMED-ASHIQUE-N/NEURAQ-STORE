import React from "react";

function formatPrice(val: any) {
  if (typeof val !== "number" || isNaN(val)) return "N/A";
  return val.toFixed(2);
}

export default function SoftwareProductCard({
  product,
  onEdit,
  onDelete,
}: {
  product: any;
  onEdit: (product: any) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="bg-white max-w-sm rounded-2xl overflow-hidden shadow-lg hover:scale-102 hover:shadow-2xl border hover:border-indigo-400 transition-shadow duration-300 flex flex-col p-4">
      {/* Main Image (first image if available) */}
      {product.images && product.images[0] && (
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-48 object-cover rounded mb-3"
        />
      )}

      <div className="font-bold text-xl mb-2">{product.title}</div>
      <div className="text-gray-700 mb-2">
        {product.description || <em>No description</em>}
      </div>
      <div className="space-y-1 text-sm">
        <p>
          <strong>Name:</strong> {product.name}
        </p>
        <p>
          <strong>Company Name:</strong> {product.companyName}
        </p>
        <p>
          <strong>Access Duration:</strong> {product.accessDuration}
        </p>
        <p>
          <strong>Quantity:</strong> {product.quantity}
        </p>
        <p>
          <strong>Original Price:</strong> ${formatPrice(product.originalPrice)}
        </p>
        <p>
          <strong>Discount %:</strong> {product.discountPercent ?? "N/A"}%
        </p>
        <p>
          <strong>Final Price:</strong> ${formatPrice(product.finalPrice)}
        </p>
      </div>
      <div className="text-xs text-gray-600 mt-4">
        <div>Created by: {product.createdBy || "N/A"}</div>
        <div>Modified by: {product.modifiedBy || "N/A"}</div>
      </div>
      <div className="pt-4 flex space-x-4">
        <button
          className="rounded-lg bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 text-white px-4 py-2 font-semibold hover:from-indigo-500 hover:to-cyan-500 transition"
          onClick={() => onEdit(product)}
        >
          Edit
        </button>
        <button
          className="rounded-lg bg-gradient-to-r from-red-600 via-pink-600 to-indigo-500 text-white px-4 py-2 font-semibold hover:from-red-700 hover:to-indigo-400 transition"
          onClick={() => onDelete(product.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
