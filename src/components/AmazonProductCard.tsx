import React from "react";

function formatPrice(val: any) {
  if (typeof val !== "number" || isNaN(val)) return "N/A";
  return val.toFixed(2);
}

export default function AmazonProductCard({ product, onEdit, onDelete }) {
  return (
    <div className="max-w-sm rounded-xl overflow-hidden shadow-lg p-4 hover:scale-105 transition-shadow duration-300 bg-white border hover:border-indigo-400 flex flex-col">
      {/* Main Image (first image if available) */}
      {product.images && product.images[0] && (
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-48 object-cover rounded mb-3"
        />
      )}

      <div className="flex-1 px-2 py-2">
        <div className="font-bold text-xl mb-2">{product.title}</div>
        <p className="text-gray-700 text-base mb-2">
          {product.description ? product.description : <em>No description</em>}
        </p>
        <div className="space-y-1 text-sm">
          <p>
            <strong>Name:</strong> {product.name}
          </p>
          <p>
            <strong>Quantity:</strong> {product.quantity}
          </p>
          <p>
            <strong>Original Price:</strong> $
            {formatPrice(product.originalPrice)}
          </p>
          <p>
            <strong>Discount %:</strong> {product.discountPercent ?? "N/A"}%
          </p>
          <p>
            <strong>Final Price:</strong> ${formatPrice(product.finalPrice)}
          </p>
        </div>
        <div className="mt-2">
          <strong>Buying Link: </strong>
          {product.buyingLink ? (
            <a
              href={product.buyingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline break-all"
            >
              {product.buyingLink}
            </a>
          ) : (
            <span>N/A</span>
          )}
        </div>
        {/* Thumbnail preview */}
        {product.buyingLink && (
          <div className="flex items-center mt-2">
            <img
              src={`https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(
                product.buyingLink
              )}`}
              alt="Thumbnail"
              className="w-10 h-10 rounded mr-2 border"
            />
            <span className="text-xs text-gray-400">Link Thumbnail</span>
          </div>
        )}
        <div className="text-xs text-gray-600 mt-3">
          <div>Created by: {product.createdBy || "N/A"}</div>
          <div>Modified by: {product.modifiedBy || "N/A"}</div>
        </div>
      </div>

      <div className="px-2 pt-4 pb-2 flex space-x-4 mt-2">
        <button
          className="rounded-lg bg-blue-600 text-white px-4 py-2 font-semibold hover:bg-blue-700 transition"
          onClick={() => onEdit(product)}
        >
          Edit
        </button>
        <button
          className="rounded-lg bg-red-600 text-white px-4 py-2 font-semibold hover:bg-red-700 transition"
          onClick={() => onDelete(product.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
