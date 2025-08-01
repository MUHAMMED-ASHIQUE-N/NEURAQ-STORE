import React, { useState } from "react";

type Product = {
  id: string;
  title: string;
  name: string;
  description: string;
  quantity: number;
  images: string[]; // URLs (Cloudflare or elsewhere)
  originalPrice: number;
  discountPercent: number;
  companyName: string;
  productCategory: string;
  moreInfoLink: string;
  createdBy: string;
  modifiedBy: string;
  createdAt: string;
  updatedAt: string;
};

type ImageInputType = "url" | "upload"; // upload is placeholder to later handle Cloudflare upload

interface ImageInput {
  type: ImageInputType;
  value: string; // image URL or local file placeholder
  file?: File; // For local upload, can store the file temporarily (optional for now)
}

const ADMIN_USERNAME = "admin"; // Replace with auth as needed
const MAX_IMAGES = 3;

const PRODUCT_CATEGORIES = [
  "Electronics",
  "Clothing",
  "Food & Beverages",
  "Furniture",
  "Books",
  "Accessories",
  "Other",
];

const generateId = () => "_" + Math.random().toString(36).slice(2, 9);

/** Final price is computed from original price and discount % */
function computeFinalPrice(originalPrice: number, discountPercent: number) {
  return originalPrice * (1 - discountPercent / 100);
}

export default function LocalProducts() {
  // Manage list of products in local state (replace with API or Firebase for real world)
  const [products, setProducts] = useState<Product[]>([]);

  // Form state
  const [form, setForm] = useState({
    title: "",
    name: "",
    description: "",
    quantity: 0,
    originalPrice: 0,
    discountPercent: 0,
    companyName: "",
    productCategory: PRODUCT_CATEGORIES[0],
    moreInfoLink: "",
  });

  // For images: array of image inputs (up to 3)
  const [imageInputs, setImageInputs] = useState<ImageInput[]>([
    { type: "url", value: "" },
  ]);

  // Editing state id
  const [editingId, setEditingId] = useState<string | null>(null);

  // Validation errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle changes to text/number inputs and dropdowns
  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = e.target;
    // Convert numeric fields properly
    if (["quantity", "originalPrice", "discountPercent"].includes(name)) {
      setForm((f) => ({ ...f, [name]: Number(value) }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  }

  // Change image input type (dropdown) from 'url' to 'upload' or vice versa
  function handleImageInputTypeChange(idx: number, newType: ImageInputType) {
    setImageInputs((inputs) =>
      inputs.map((input, i) =>
        i === idx
          ? { type: newType, value: "" } // clear previous value/file on type change
          : input
      )
    );
  }

  // Change image URL for given index
  function handleImageUrlChange(idx: number, newValue: string) {
    setImageInputs((inputs) =>
      inputs.map((input, i) =>
        i === idx ? { ...input, value: newValue } : input
      )
    );
  }

  // Placeholder for image upload handler - replace with Cloudflare upload API integration
  function handleUploadFile(idx: number, file: File) {
    // Currently just simulates a local object URL - replace this with actual Cloudflare upload and get URL
    // For demonstration, create a blob URL (NOT suitable for production)
    const url = URL.createObjectURL(file);
    setImageInputs((inputs) =>
      inputs.map((input, i) =>
        i === idx ? { type: "upload", value: url, file } : input
      )
    );
  }

  // Remove image input slot at index
  function removeImage(idx: number) {
    setImageInputs((inputs) => inputs.filter((_, i) => i !== idx));
  }

  // Add a new image input slot with default type 'url' if less than max
  function addImageInput() {
    if (imageInputs.length < MAX_IMAGES) {
      setImageInputs((inputs) => [...inputs, { type: "url", value: "" }]);
    }
  }

  // Validate form before submit
  function validate() {
    const newErrors: Record<string, string> = {};

    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (form.quantity < 0) newErrors.quantity = "Quantity can’t be negative";
    if (form.originalPrice < 0)
      newErrors.originalPrice = "Original price must be non-negative";
    if (form.discountPercent < 0 || form.discountPercent > 100)
      newErrors.discountPercent = "Discount % must be 0-100";
    if (!form.companyName.trim())
      newErrors.companyName = "Company name is required";
    if (!PRODUCT_CATEGORIES.includes(form.productCategory))
      newErrors.productCategory = "Select a valid product category";
    if (form.moreInfoLink.trim() && !isValidUrl(form.moreInfoLink.trim()))
      newErrors.moreInfoLink = "More About Product link must be a valid URL";

    // Validate image URLs
    imageInputs.forEach((input, idx) => {
      if (input.type === "url" && input.value.trim() !== "") {
        if (!isValidUrl(input.value.trim()))
          newErrors[`image_${idx}`] = "Image URL is invalid";
      }
      // If type is upload, no validation needed here (assumed handled by upload)
    });

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  // Utility to check if string is valid URL
  function isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Reset form including images, errors, editing state
  function resetForm() {
    setForm({
      title: "",
      name: "",
      description: "",
      quantity: 0,
      originalPrice: 0,
      discountPercent: 0,
      companyName: "",
      productCategory: PRODUCT_CATEGORIES[0],
      moreInfoLink: "",
    });
    setImageInputs([{ type: "url", value: "" }]);
    setErrors({});
    setEditingId(null);
  }

  // When submitting the form for Add or Update
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const timestamp = new Date().toISOString();

    // Compose image URLs array from image inputs (only URLs)
    const images = imageInputs
      .map((input) => input.value.trim())
      .filter((url) => url !== "");

    if (editingId) {
      // Update existing product
      setProducts((prev) =>
        prev.map((prod) =>
          prod.id === editingId
            ? {
                ...prod,
                ...form,
                images,
                modifiedBy: ADMIN_USERNAME,
                updatedAt: timestamp,
              }
            : prod
        )
      );
    } else {
      // Add new product
      const newProduct: Product = {
        id: generateId(),
        ...form,
        images,
        createdBy: ADMIN_USERNAME,
        modifiedBy: ADMIN_USERNAME,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      setProducts((prev) => [...prev, newProduct]);
    }

    resetForm();
  }

  // Click Edit - load product into form
  function handleEdit(productId: string) {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    setEditingId(productId);
    setForm({
      title: prod.title,
      name: prod.name,
      description: prod.description,
      quantity: prod.quantity,
      originalPrice: prod.originalPrice,
      discountPercent: prod.discountPercent,
      companyName: prod.companyName,
      productCategory: prod.productCategory,
      moreInfoLink: prod.moreInfoLink,
    });
    setImageInputs(
      prod.images.length > 0
        ? prod.images.map((url) => ({ type: "url", value: url }))
        : [{ type: "url", value: "" }]
    );
    setErrors({});
  }

  // Delete product by id with confirmation
  function handleDelete(productId: string) {
    if (window.confirm("Confirm deletion of this product?")) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      if (editingId === productId) resetForm();
    }
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Local Products Management
      </h1>

      {/* Product Form */}
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl bg-white rounded-lg shadow p-6 mb-8"
        noValidate
      >
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? "Edit Product" : "Add New Product"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block mb-1 font-medium text-gray-700"
            >
              Title <span className="text-red-600">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block mb-1 font-medium text-gray-700"
            >
              Name <span className="text-red-600">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label
              htmlFor="quantity"
              className="block mb-1 font-medium text-gray-700"
            >
              Quantity <span className="text-red-600">*</span>
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min={0}
              value={form.quantity}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${
                errors.quantity ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.quantity && (
              <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>
            )}
          </div>

          {/* Company Name */}
          <div>
            <label
              htmlFor="companyName"
              className="block mb-1 font-medium text-gray-700"
            >
              Company Name <span className="text-red-600">*</span>
            </label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              value={form.companyName}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${
                errors.companyName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.companyName && (
              <p className="text-red-600 text-sm mt-1">{errors.companyName}</p>
            )}
          </div>

          {/* Product Category */}
          <div>
            <label
              htmlFor="productCategory"
              className="block mb-1 font-medium text-gray-700"
            >
              Product Category <span className="text-red-600">*</span>
            </label>
            <select
              id="productCategory"
              name="productCategory"
              value={form.productCategory}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${
                errors.productCategory ? "border-red-500" : "border-gray-300"
              }`}
            >
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.productCategory && (
              <p className="text-red-600 text-sm mt-1">
                {errors.productCategory}
              </p>
            )}
          </div>

          {/* Original Price */}
          <div>
            <label
              htmlFor="originalPrice"
              className="block mb-1 font-medium text-gray-700"
            >
              Original Price ($) <span className="text-red-600">*</span>
            </label>
            <input
              id="originalPrice"
              name="originalPrice"
              type="number"
              min={0}
              step="0.01"
              value={form.originalPrice}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${
                errors.originalPrice ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.originalPrice && (
              <p className="text-red-600 text-sm mt-1">
                {errors.originalPrice}
              </p>
            )}
          </div>

          {/* Discount % */}
          <div>
            <label
              htmlFor="discountPercent"
              className="block mb-1 font-medium text-gray-700"
            >
              Discount % <span className="text-red-600">*</span>
            </label>
            <input
              id="discountPercent"
              name="discountPercent"
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={form.discountPercent}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${
                errors.discountPercent ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.discountPercent && (
              <p className="text-red-600 text-sm mt-1">
                {errors.discountPercent}
              </p>
            )}
          </div>

          {/* Final Price (computed) */}
          <div className="flex flex-col justify-end">
            <label className="block mb-1 font-medium text-gray-700">
              Final Price ($)
            </label>
            <p className="text-lg font-semibold">
              {computeFinalPrice(
                form.originalPrice,
                form.discountPercent
              ).toFixed(2)}
            </p>
          </div>

          {/* More About Product external info */}
          <div className="md:col-span-2">
            <label
              htmlFor="moreInfoLink"
              className="block mb-1 font-medium text-gray-700"
            >
              More About Product (External Link)
            </label>
            <input
              id="moreInfoLink"
              name="moreInfoLink"
              type="url"
              value={form.moreInfoLink}
              onChange={handleChange}
              placeholder="https://example.com/product-info"
              className={`w-full p-2 border rounded ${
                errors.moreInfoLink ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.moreInfoLink && (
              <p className="text-red-600 text-sm mt-1">{errors.moreInfoLink}</p>
            )}
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label
              htmlFor="description"
              className="block mb-1 font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              className="w-full p-2 border rounded border-gray-300"
            />
          </div>

          {/* Images Inputs with dropdowns */}
          <div className="md:col-span-2">
            <label className="block mb-2 font-medium text-gray-700">
              Images (up to {MAX_IMAGES})
            </label>
            {imageInputs.map((input, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-3">
                <select
                  value={input.type}
                  onChange={(e) =>
                    handleImageInputTypeChange(
                      idx,
                      e.target.value as ImageInputType
                    )
                  }
                  className="border rounded p-1"
                >
                  <option value="url">Add Image by URL</option>
                  <option value="upload">Upload Image</option>
                </select>
                {input.type === "url" ? (
                  <input
                    type="url"
                    value={input.value}
                    onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                    placeholder="Image URL"
                    className={`flex-grow p-2 border rounded ${
                      errors[`image_${idx}`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleUploadFile(idx, file);
                      }
                    }}
                    className="flex-grow"
                  />
                )}
                {/* Preview Image if valid URL */}
                {input.value && (
                  <img
                    src={input.value}
                    alt={`Preview ${idx + 1}`}
                    className="w-16 h-12 object-cover rounded border"
                  />
                )}
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="text-red-600 hover:text-red-800 font-semibold"
                >
                  Remove
                </button>
              </div>
            ))}
            {imageInputs.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={addImageInput}
                className="px-3 py-1 bg-indigo-600 rounded text-white hover:bg-indigo-700"
              >
                Add Image
              </button>
            )}
          </div>
        </div>

        {/* Submit and Clear buttons */}
        <div className="mt-6 flex gap-4">
          <button
            type="submit"
            className="px-5 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 font-semibold"
          >
            {editingId ? "Update Product" : "Add Product"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="px-5 py-2 rounded border border-gray-400 text-gray-700 hover:bg-gray-100"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Product list table */}
      <section className="max-w-6xl bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Local Products</h2>
        {products.length === 0 ? (
          <p className="text-gray-500">No products added yet.</p>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-left text-sm text-gray-700">
              <thead className="bg-indigo-100">
                <tr>
                  <th className="px-4 py-2">Title</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Company</th>
                  <th className="px-4 py-2">Category</th>
                  <th className="px-4 py-2">Quantity</th>
                  <th className="px-4 py-2">Final Price</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr
                    key={prod.id}
                    className="border-b last:border-none hover:bg-indigo-50"
                  >
                    <td className="px-4 py-2">{prod.title}</td>
                    <td className="px-4 py-2">{prod.name}</td>
                    <td className="px-4 py-2">{prod.companyName}</td>
                    <td className="px-4 py-2">{prod.productCategory}</td>
                    <td className="px-4 py-2">{prod.quantity}</td>
                    <td className="px-4 py-2">
                      {computeFinalPrice(
                        prod.originalPrice,
                        prod.discountPercent
                      ).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 flex gap-3">
                      <button
                        onClick={() => handleEdit(prod.id)}
                        className="text-indigo-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(prod.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
