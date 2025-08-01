import React, { useState } from "react";

type Product = {
  id: string;
  title: string;
  name: string;
  description: string;
  quantity: number;
  images: string[];
  originalPrice: number;
  discountPercent: number;
  companyName: string;
  accessDuration: string;
  createdBy: string;
  modifiedBy: string;
  createdAt: string;
  updatedAt: string;
};

type ImageInputType = "url" | "upload";
interface ImageInput {
  type: ImageInputType;
  value: string;
  file?: File; // used for preview (replace with Cloudflare URL on real integration)
}

const ADMIN_USERNAME = "admin"; // Replace for real authentication
const MAX_IMAGES = 3;

function computeFinalPrice(originalPrice: number, discountPercent: number) {
  return originalPrice * (1 - discountPercent / 100);
}

function generateId() {
  return "_" + Math.random().toString(36).slice(2, 9);
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export default function SoftwareProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({
    title: "",
    name: "",
    description: "",
    quantity: 0,
    originalPrice: 0,
    discountPercent: 0,
    companyName: "",
    accessDuration: "",
  });
  const [imageInputs, setImageInputs] = useState<ImageInput[]>([
    { type: "url", value: "" },
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Image input handlers
  function handleImageInputTypeChange(idx: number, inputType: ImageInputType) {
    setImageInputs((arr) =>
      arr.map((input, i) =>
        i === idx ? { type: inputType, value: "", file: undefined } : input
      )
    );
  }
  function handleImageUrlChange(idx: number, value: string) {
    setImageInputs((arr) =>
      arr.map((input, i) => (i === idx ? { ...input, value } : input))
    );
  }
  function handleUploadFile(idx: number, file: File) {
    // Replace this logic with direct Cloudflare upload as needed
    // Demo: show browser local preview, not persistent
    const url = URL.createObjectURL(file);
    setImageInputs((arr) =>
      arr.map((input, i) =>
        i === idx ? { type: "upload", value: url, file } : input
      )
    );
  }
  function removeImageInput(idx: number) {
    setImageInputs((arr) => arr.filter((_, i) => i !== idx));
  }
  function addImageInput() {
    if (imageInputs.length < MAX_IMAGES) {
      setImageInputs((arr) => [...arr, { type: "url", value: "" }]);
    }
  }

  // Form field handlers
  function handleFieldChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    if (["quantity", "originalPrice", "discountPercent"].includes(name)) {
      setForm((f) => ({ ...f, [name]: Number(value) }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  }

  function validate() {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (form.quantity < 0) newErrors.quantity = "Quantity can't be negative";
    if (form.originalPrice < 0)
      newErrors.originalPrice = "Original price must be non-negative";
    if (form.discountPercent < 0 || form.discountPercent > 100)
      newErrors.discountPercent = "Discount % must be 0-100";
    if (!form.companyName.trim())
      newErrors.companyName = "Company name is required";
    if (!form.accessDuration.trim())
      newErrors.accessDuration = "Access duration is required";
    imageInputs.forEach((input, idx) => {
      if (input.type === "url" && input.value.trim()) {
        if (!isValidUrl(input.value.trim()))
          newErrors[`image_${idx}`] = "Image URL invalid";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function resetForm() {
    setForm({
      title: "",
      name: "",
      description: "",
      quantity: 0,
      originalPrice: 0,
      discountPercent: 0,
      companyName: "",
      accessDuration: "",
    });
    setImageInputs([{ type: "url", value: "" }]);
    setErrors({});
    setEditingId(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const timestamp = new Date().toISOString();
    const images = imageInputs.map((i) => i.value).filter((v) => v.trim());
    if (editingId) {
      setProducts((prods) =>
        prods.map((prod) =>
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
      setProducts((prods) => [
        ...prods,
        {
          id: generateId(),
          ...form,
          images,
          createdBy: ADMIN_USERNAME,
          modifiedBy: ADMIN_USERNAME,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ]);
    }
    resetForm();
  }

  function handleEdit(id: string) {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;
    setEditingId(prod.id);
    setForm({
      title: prod.title,
      name: prod.name,
      description: prod.description,
      quantity: prod.quantity,
      originalPrice: prod.originalPrice,
      discountPercent: prod.discountPercent,
      companyName: prod.companyName,
      accessDuration: prod.accessDuration,
    });
    setImageInputs(
      prod.images.length > 0
        ? prod.images.map((url) => ({ type: "url", value: url }))
        : [{ type: "url", value: "" }]
    );
    setErrors({});
  }

  function handleDelete(id: string) {
    if (window.confirm("Delete product?")) {
      setProducts((prods) => prods.filter((p) => p.id !== id));
      if (editingId === id) resetForm();
    }
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Software Products Management
      </h1>
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl bg-white rounded-xl shadow p-6 mb-8"
        noValidate
      >
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? "Edit Product" : "Add Software Product"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Title <span className="text-red-600">*</span>
            </label>
            <input
              name="title"
              type="text"
              value={form.title}
              onChange={handleFieldChange}
              className={`w-full border px-3 py-2 rounded ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">{errors.title}</p>
            )}
          </div>
          {/* Name */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Name <span className="text-red-600">*</span>
            </label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleFieldChange}
              className={`w-full border px-3 py-2 rounded ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name}</p>
            )}
          </div>
          {/* Quantity */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Quantity <span className="text-red-600">*</span>
            </label>
            <input
              name="quantity"
              type="number"
              min={0}
              value={form.quantity}
              onChange={handleFieldChange}
              className={`w-full border px-3 py-2 rounded ${
                errors.quantity ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.quantity && (
              <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>
            )}
          </div>
          {/* Company Name */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Company Name <span className="text-red-600">*</span>
            </label>
            <input
              name="companyName"
              type="text"
              value={form.companyName}
              onChange={handleFieldChange}
              className={`w-full border px-3 py-2 rounded ${
                errors.companyName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.companyName && (
              <p className="text-red-600 text-sm mt-1">{errors.companyName}</p>
            )}
          </div>
          {/* Access Duration */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Access Duration <span className="text-red-600">*</span>
            </label>
            <input
              name="accessDuration"
              type="text"
              value={form.accessDuration}
              onChange={handleFieldChange}
              placeholder="e.g. 1 year, lifetime, 30 days"
              className={`w-full border px-3 py-2 rounded ${
                errors.accessDuration ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.accessDuration && (
              <p className="text-red-600 text-sm mt-1">
                {errors.accessDuration}
              </p>
            )}
          </div>
          {/* Original Price */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Original Price ($) <span className="text-red-600">*</span>
            </label>
            <input
              name="originalPrice"
              type="number"
              min={0}
              value={form.originalPrice}
              onChange={handleFieldChange}
              className={`w-full border px-3 py-2 rounded ${
                errors.originalPrice ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.originalPrice && (
              <p className="text-red-600 text-sm mt-1">
                {errors.originalPrice}
              </p>
            )}
          </div>
          {/* Discount Percent */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Discount % <span className="text-red-600">*</span>
            </label>
            <input
              name="discountPercent"
              type="number"
              min={0}
              max={100}
              value={form.discountPercent}
              onChange={handleFieldChange}
              className={`w-full border px-3 py-2 rounded ${
                errors.discountPercent ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.discountPercent && (
              <p className="text-red-600 text-sm mt-1">
                {errors.discountPercent}
              </p>
            )}
          </div>
          {/* Computed Final Price */}
          <div className="flex flex-col justify-end">
            <label className="block font-medium text-gray-700">
              Final Price ($)
            </label>
            <p className="text-lg font-semibold mb-1">
              {computeFinalPrice(
                form.originalPrice,
                form.discountPercent
              ).toFixed(2)}
            </p>
          </div>
          {/* Description */}
          <div className="md:col-span-2">
            <label className="block mb-1 font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              value={form.description}
              onChange={handleFieldChange}
              className="w-full border px-3 py-2 rounded border-gray-300"
            />
          </div>
          {/* Images Input Array */}
          <div className="md:col-span-2">
            <label className="block mb-1 font-medium text-gray-700">
              Images (up to {MAX_IMAGES})
            </label>
            {imageInputs.map((input, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <select
                  value={input.type}
                  onChange={(e) =>
                    handleImageInputTypeChange(
                      idx,
                      e.target.value as ImageInputType
                    )
                  }
                  className="p-1 rounded border"
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
                      if (file) handleUploadFile(idx, file);
                    }}
                    className="flex-grow"
                  />
                )}
                {input.value && (
                  <img
                    src={input.value}
                    alt={`Product ${idx + 1}`}
                    className="w-16 h-12 object-cover rounded border"
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeImageInput(idx)}
                  className="text-red-600 hover:text-red-800 font-semibold"
                >
                  Remove
                </button>
                {errors[`image_${idx}`] && (
                  <span className="text-red-600 text-sm">
                    {errors[`image_${idx}`]}
                  </span>
                )}
              </div>
            ))}
            {imageInputs.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={addImageInput}
                className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Add Image
              </button>
            )}
          </div>
        </div>
        <div className="mt-6 flex gap-4">
          <button
            type="submit"
            className="px-5 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
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

      {/* PRODUCTS TABLE */}
      <section className="max-w-6xl bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Software Products</h2>
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
                  <th className="px-4 py-2">Access Duration</th>
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
                    <td className="px-4 py-2">{prod.accessDuration}</td>
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
