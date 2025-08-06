import React, { useState } from "react";
import { PenSquare, Trash2, Eye, EyeOff } from "lucide-react";

function formatPrice(val: unknown) {
  if (typeof val !== "number" || isNaN(val)) return "N/A";
  return "$" + val.toFixed(2);
}

export default function AmazonProductCard({
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
        {/* Image */}
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
        <div className="text-lg font-bold text-center truncate w-full">
          {product.name}
        </div>
        {/* Price */}
        <div className="mt-1 text-xl text-indigo-700 font-semibold">
          {formatPrice(product.finalPrice)}
        </div>
      </div>

      {/* Action Buttons with lucide-react icons */}
      <div className="flex items-center justify-center gap-3 mb-2">
        <button
          className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 rounded-md font-semibold shadow hover:from-blue-600 hover:to-indigo-600 transition"
          onClick={() => onEdit(product)}
        >
          <PenSquare size={18} /> Edit
        </button>
        <button
          className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-md font-semibold shadow hover:from-red-600 hover:to-pink-600 transition"
          onClick={() => onDelete(product.id)}
        >
          <Trash2 size={18} /> Delete
        </button>
        <button
          className="flex items-center gap-1 bg-gradient-to-r from-gray-500 to-gray-700 text-white px-3 py-1 rounded-md font-semibold shadow hover:from-gray-700 hover:to-gray-900 transition"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? <EyeOff size={18} /> : <Eye size={18} />}
          {expanded ? "Hide" : "View"}
        </button>
      </div>

      {/* Expanded Details Overlay */}
      {expanded && (
        <div className="absolute top-0 left-0 w-full h-full bg-white/95 px-4 py-4 flex flex-col rounded-xl overflow-auto z-10 border">
          <div className="absolute top-2 right-2">
            <button
              className="bg-gray-200 rounded-full text-gray-600 px-2 py-1 font-bold shadow"
              onClick={() => setExpanded(false)}
            >
              ×
            </button>
          </div>
          <div className="space-y-1 text-sm pt-4">
            <div>
              <span className="font-semibold">Image:</span>
              {product.images && product.images[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-24 h-24 object-cover rounded border my-1"
                />
              ) : (
                <span className="text-gray-400"> No Image</span>
              )}
            </div>
            <div>
              <span className="font-semibold">Title:</span> {product.title}
            </div>
            <div>
              <span className="font-semibold">Name:</span> {product.name}
            </div>
            <div>
              <span className="font-semibold">Description:</span>{" "}
              {product.description || (
                <em className="text-gray-400">No description</em>
              )}
            </div>
            <div>
              <span className="font-semibold">Quantity:</span>{" "}
              {product.quantity}
            </div>
            <div>
              <span className="font-semibold">Original Price:</span>{" "}
              {formatPrice(product.originalPrice)}
            </div>
            <div>
              <span className="font-semibold">Discount %:</span>{" "}
              {product.discountPercent ?? "N/A"}%
            </div>
            <div>
              <span className="font-semibold">Final Price:</span>{" "}
              {formatPrice(product.finalPrice)}
            </div>
            <div>
              <span className="font-semibold">Buying Link:</span>{" "}
              {product.buyingLink ? (
                <a
                  href={product.buyingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline break-all"
                >
                  {product.buyingLink}
                </a>
              ) : (
                <span className="text-gray-400">N/A</span>
              )}
            </div>
            <div>
              <span className="font-semibold">Created by:</span>{" "}
              {product.createdBy || "N/A"}
            </div>
            <div>
              <span className="font-semibold">Modified by:</span>{" "}
              {product.modifiedBy || "N/A"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
