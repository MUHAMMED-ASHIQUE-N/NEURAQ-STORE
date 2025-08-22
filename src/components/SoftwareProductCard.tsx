import React, { useState } from "react";
import {
  PenSquare,
  Trash2,
  Eye,
  EyeOff,
  Edit,
  X,
  Package,
  Percent,
  Share2,
  Heart,
  ShoppingCart,
  UserCheck,
  UserPlus,
} from "lucide-react";

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
        <div className="fixed ml-64 mt-18 inset-0 z-50 flex items-center justify-center p-4">
          <div className=" bg-white rounded-2xl shadow-xl overflow-hidden relative w-full max-w-[60vw]  max-h-[90vh] p-6 overflow-y-auto ">
            {/* Close */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowPopup(false)}
                className="close-btn absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-red-500 border border-gray-200"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Full image */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Left Side - Image */}
              <div className="relative h-64 md:h-80 lg:h-full min-h-[400px]">
                <div className=" w-full h-full flex items-center justify-center">
                  {product.images ? (
                    <img
                      src={product.images}
                      alt={product.name}
                      className="w-80 h-80 justify-left object-contain rounded"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/no-image.png";
                      }}
                    />
                  ) : null}
                  {/* Discount Badge */}
                  <div className="absolute top-4 left-4">
                    <div className="discount-badge px-3 py-2 rounded-full text-white font-bold text-sm shadow-lg">
                      <Percent className="w-4 h-4 inline mr-1" />
                      {product.discountPercent}
                    </div>
                  </div>
                  {/* Quantity Badge */}
                  <div className="absolute bottom-4 left-4">
                    <div className="bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-sm font-medium">
                      <Package className="w-4 h-4 inline mr-1" />
                      Stock: {product.quantity} Units
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Right Side - Product Details */}
            <div className="p-6 md:p-8 lg:p-10 flex flex-col justify-between">
              {/* Product Info */}
              <div className="space-y-6">
                {/* Title and Name */}
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                    {product.title}
                  </h1>
                </div>
                <h2 className="text-lg md:text-xl text-gray-600 font-medium">
                  {product.name}
                </h2>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Description
                  </h3>
                  {product.description && (
                    <p className="text-gray-600 leading-relaxed">
                      {product.description}
                    </p>
                  )}
                </div>
                {/* Pricing Section */}
                <div className="bg-gray-50 rounded-xl p-4 md:p-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    Pricing
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Original Price:</span>

                      <span className="price-strike text-gray-500 font-medium">
                        {formatPrice(product.originalPrice)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Discount:</span>
                      <span className="text-red-600 font-semibold">
                        {product.discountPercent}% OFF
                      </span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-800">
                          Final Price:
                        </span>
                        <span className="text-2xl md:text-3xl font-bold text-green-600">
                          {formatPrice(product.finalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <UserPlus className="w-4 h-4 mr-2 text-blue-500" />
                        <span className="font-medium">Created by:</span>
                      </div>
                      <div className="ml-6 text-gray-800">
                        {product.createdBy}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <UserCheck className="w-4 h-4 mr-2 text-green-500" />
                        <span className="font-medium">Modified by:</span>
                      </div>
                      <div className="ml-6 text-gray-800">
                        {product.modifiedBy}
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 space-y-4">
                    <p>
                      <button
                        rel="noopener noreferrer"
                        className="buy-btn w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 px-6 rounded-xl hover:from-green-600 hover:to-green-700 flex items-center justify-center space-x-2 text-lg"
                      >
                        <ShoppingCart className="w-6 h-6" />
                        <span>Buy Now - {formatPrice(product.finalPrice)}</span>
                      </button>
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="flex items-center justify-center space-x-2 py-3 px-4 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-red-300 hover:text-red-600 transition-colors duration-200">
                        <Heart className="w-5 h-5" />
                        <span>Wishlist</span>
                      </button>
                      <button className="flex items-center justify-center space-x-2 py-3 px-4 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors duration-200">
                        <Share2 className="w-5 h-5" />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
