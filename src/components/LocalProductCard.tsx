import React, { useState } from "react";
import { PenSquare, Trash2, Eye, EyeOff } from "lucide-react";

function formatPrice(val: unknown) {
  if (typeof val !== "number" || isNaN(val)) return "N/A";
  return "$" + val.toFixed(2);
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
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`
        w-full sm:w-72 h-72 bg-white rounded-xl border shadow transition-all duration-300
        hover:shadow-xl hover:scale-105 hover:-translate-y-1
        flex flex-col justify-between overflow-hidden relative
      `}
      style={{ aspectRatio: "1 / 1", minWidth: "16rem", minHeight: "16rem" }}
    >
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-2">
        {/* Product Image */}
        <div className="w-28 h-28 flex-shrink-0 flex items-center justify-center mb-2">
          {product.images && product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover rounded-md border"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>

        {/* Product Name */}
        <div className="text-lg font-bold text-center truncate w-full mb-0.5">
          {product.name}
        </div>

        {/* Final Price */}
        <div className="mt-1 text-yellow-700 text-xl font-semibold">
          {formatPrice(product.finalPrice)}
        </div>
      </div>

      {/* Action Buttons with lucide-react icons, gradients, hover, and transition */}
      <div className="flex items-center justify-center gap-3 mb-2">
        <button
          className="flex items-center gap-1 rounded-md bg-gradient-to-r from-yellow-400 via-red-400 to-pink-400 px-3 py-1 font-semibold text-white shadow hover:from-yellow-500 hover:to-pink-500 transition"
          onClick={() => onEdit(product)}
          aria-label="Edit product"
        >
          <PenSquare size={18} />
          Edit
        </button>
        <button
          className="flex items-center gap-1 rounded-md bg-gradient-to-r from-red-600 via-pink-600 to-yellow-500 px-3 py-1 font-semibold text-white shadow hover:from-red-700 hover:to-yellow-400 transition"
          onClick={() => onDelete(product.id)}
          aria-label="Delete product"
        >
          <Trash2 size={18} />
          Delete
        </button>
        <button
          className="flex items-center gap-1 rounded-md bg-gradient-to-r from-gray-500 to-gray-700 px-3 py-1 font-semibold text-white shadow hover:from-gray-700 hover:to-gray-900 transition"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? "Hide details" : "View details"}
        >
          {expanded ? <EyeOff size={18} /> : <Eye size={18} />}
          {expanded ? "Hide" : "View"}
        </button>
      </div>

      {/* Expanded details overlay */}
      {expanded && (
        <div className="absolute top-0 left-0 z-10 flex h-full w-full flex-col overflow-auto rounded-xl bg-white/95 p-4 border">
          <div className="absolute top-2 right-2">
            <button
              aria-label="Close expanded details"
              className="rounded-full bg-gray-200 px-2 py-1 font-bold text-gray-600 shadow"
              onClick={() => setExpanded(false)}
            >
              ×
            </button>
          </div>
          <div className="space-y-2 text-sm pt-8">
            <div>
              <strong>Image:</strong>{" "}
              {product.images && product.images[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="my-1 h-24 w-24 rounded border object-cover"
                />
              ) : (
                <span className="text-gray-400"> No Image</span>
              )}
            </div>
            <div>
              <strong>Title:</strong> {product.title}
            </div>
            <div>
              <strong>Name:</strong> {product.name}
            </div>
            <div>
              <strong>Description:</strong>{" "}
              {product.description || (
                <em className="text-gray-400">No description</em>
              )}
            </div>
            <div>
              <strong>Quantity:</strong> {product.quantity}
            </div>
            <div>
              <strong>Original Price:</strong>{" "}
              {formatPrice(product.originalPrice)}
            </div>
            <div>
              <strong>Discount %:</strong> {product.discountPercent ?? "N/A"}%
            </div>
            <div>
              <strong>Final Price:</strong> {formatPrice(product.finalPrice)}
            </div>
            <div>
              <strong>Company Name:</strong> {product.companyName}
            </div>
            <div>
              <strong>Product Category:</strong> {product.productCategory}
            </div>
            <div>
              <strong>More Info:</strong>{" "}
              {product.moreInfoLink ? (
                <a
                  href={product.moreInfoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-indigo-600 break-all"
                >
                  {product.moreInfoLink}
                </a>
              ) : (
                <span className="text-gray-400">N/A</span>
              )}
            </div>
            <div>
              <strong>Created by:</strong> {product.createdBy || "N/A"}
            </div>
            <div>
              <strong>Modified by:</strong> {product.modifiedBy || "N/A"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
