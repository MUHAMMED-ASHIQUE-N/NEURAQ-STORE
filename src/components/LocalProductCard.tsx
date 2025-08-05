import React from "react";

function formatPrice(val: any) {
  if (typeof val !== "number" || isNaN(val)) return "N/A";
  return val.toFixed(2);
}

export default function LocalProductCard({
  product,
  onEdit,
  onDelete,
}: {
  product: any;
  onEdit: (product: any) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="bg-white max-w-sm rounded-2xl overflow-hidden shadow-lg hover:scale-102 hover:shadow-2xl border hover:border-yellow-400 transition-shadow duration-300 flex flex-col p-4">
      {/* Thumbnail from images[0] */}
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
          <strong>Company:</strong> {product.companyName}
        </p>
        <p>
          <strong>Category:</strong> {product.productCategory}
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
      {product.moreInfoLink && (
        <div className="mt-2">
          <strong>More Info: </strong>
          <a
            href={product.moreInfoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-500 underline break-all"
          >
            {product.moreInfoLink}
          </a>
        </div>
      )}
      <div className="text-xs text-gray-600 mt-4">
        <div>Created by: {product.createdBy || "N/A"}</div>
        <div>Modified by: {product.modifiedBy || "N/A"}</div>
      </div>
      <div className="pt-4 flex space-x-4">
        <button
          className="rounded-lg bg-gradient-to-r from-yellow-400 via-red-400 to-pink-400 text-white px-4 py-2 font-semibold hover:from-yellow-500 hover:to-pink-500 transition"
          onClick={() => onEdit(product)}
        >
          Edit
        </button>
        <button
          className="rounded-lg bg-gradient-to-r from-red-600 via-pink-600 to-yellow-500 text-white px-4 py-2 font-semibold hover:from-red-700 hover:to-yellow-400 transition"
          onClick={() => onDelete(product.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
