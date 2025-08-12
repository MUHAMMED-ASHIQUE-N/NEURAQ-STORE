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
  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      {/* Card */}
      <div
        className="bg-white rounded-lg shadow-lg p-4 flex flex-col justify-between 
        transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1"
      >
        {/* Thumbnail image with fallback */}
        {product.images ? (
          <img
            src={product.images}
            alt={product.name}
            className="w-full object-contain rounded mb-3"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/no-image.png"; // Update with actual placeholder
            }}
          />
        ) : null}

        {/* Name */}
        <h6 className="text-lg font-semibold truncate">{product.name}</h6>

        {/* Price */}
        {product.finalPrice !== undefined && (
          <p className="text-gray-800 font-medium">
            {formatPrice(product.finalPrice)}
          </p>
        )}

        {/* Buttons */}
        <div className="flex space-x-3 mt-3">
          <button
            onClick={() => onEdit(product.id)}
            className="flex items-center space-x-1 px-3 py-1 rounded-md bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
            title="Edit"
          >
            <PenSquare size={16} />
            <span>Edit</span>
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="flex items-center space-x-1 px-3 py-1 rounded-md bg-red-100 text-red-800 hover:bg-red-200"
            title="Delete"
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
          <button
            onClick={() => setShowPopup(true)}
            className="flex items-center space-x-1 px-3 py-1 rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200"
            title="View details"
          >
            <Eye size={16} />
            <span>View</span>
          </button>
        </div>
      </div>

      {/* Modal */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg aspect-square p-6 overflow-y-auto max-h-[90vh]">
            {/* Close */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowPopup(false)}
                className="text-gray-500 hover:text-gray-800"
                title="Close"
              >
                <EyeOff size={20} />
              </button>
            </div>

            {/* Full image with fallback */}
            {product.images ? (
              <img
                src={product.images}
                alt={product.name}
                className="w-full object-contain rounded mb-4"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/no-image.png"; // Update with your placeholder path
                }}
              />
            ) : null}

            {/* Details */}
            <h2 className="text-xl font-bold mt-4">{product.title}</h2>
            <p className="text-gray-600">{product.name}</p>
            {product.description && (
              <p className="mt-2 text-sm text-gray-700">
                {product.description}
              </p>
            )}

            <div className="mt-4 space-y-1 text-sm">
              <p>
                <strong>Quantity:</strong> {product.quantity}
              </p>
              <p>
                <strong>Original Price:</strong>{" "}
                {formatPrice(product.originalPrice)}
              </p>
              <p>
                <strong>Discount %:</strong> {product.discountPercent}%
              </p>
              <p>
                <strong>Final Price:</strong> {formatPrice(product.finalPrice)}
              </p>
              {product.buyingLink && (
                <p>
                  <strong>Buying Link:</strong>{" "}
                  <a
                    href={product.buyingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {product.buyingLink}
                  </a>
                </p>
              )}
              <p>
                <strong>Created By:</strong> {product.createdBy}
              </p>
              <p>
                <strong>Modified By:</strong> {product.modifiedBy}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
