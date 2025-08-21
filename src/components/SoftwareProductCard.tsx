import React, { useState } from "react";
import { PenSquare, Trash2, Eye, EyeOff, Edit } from "lucide-react";

function formatPrice(val: unknown) {
  if (typeof val !== "number" || isNaN(val)) return "N/A";
  return "$" + val.toFixed(2);
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
  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      {/* Card */}
      {/* Product Card */}
      <div className="card-hover bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Image Container */}
        <div className="relative aspect-square">
          <div className=" w-full h-full flex items-center justify-center">
            {product.images ? (
              <img
                src={product.images}
                alt={product.name}
                className="w-full object-contain rounded mb-3"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/no-image.png"; // Placeholder if missing
                }}
              />
            ) : null}
            {/* Price */}
            {product.finalPrice !== undefined && (
              <div className="absolute top-3 right-3">
                <span className="price-badge px-3 py-1 text-white text-sm font-bold rounded-full">
                  {formatPrice(product.finalPrice)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Name */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
            {product.name}
          </h3>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between p-2">
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(product)}
              className="action-btn p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(product.id)}
              className="action-btn p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowPopup(true)}
              className="action-btn p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
              title="View details"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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

            {/* Full image */}
            {product.images ? (
              <img
                src={product.images}
                alt={product.name}
                className="w-40 h-40 justify-left object-contain rounded mb-4"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/no-image.png";
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
              <p>
                <strong>Company Name:</strong> {product.companyName}
              </p>
              <p>
                <strong>Access Duration:</strong> {product.accessDuration}
              </p>
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
