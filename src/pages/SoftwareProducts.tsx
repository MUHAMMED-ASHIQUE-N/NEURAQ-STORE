import React, { useState, useEffect } from "react";

import { Plus, CheckSquare, Eraser, Trash2 } from "lucide-react";

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

import { firestore } from "../firebase";

import { useUser } from "../contexts/UserContext";

import SoftwareProductCard from "../components/SoftwareProductCard";

type Product = {
  id: string;
  title: string;
  name: string;
  description: string;
  quantity: number;
  images: string[];
  originalPrice: number;
  discountPercent: number;
  finalPrice: number;
  companyName: string;
  accessDuration: string;
  createdBy: string;
  modifiedBy: string;
  createdAt: string;
  updatedAt: string;
  approved: boolean;
  rejected?: boolean;
};

type ImageInput = {
  type: "url" | "upload";
  value: string;
  file?: File;
};

const MAX_IMAGES = 3;

export default function SoftwareProducts() {
  const { user } = useUser();

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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const q = query(
      collection(firestore, "softwareProducts"),
      where("approved", "==", true)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods: Product[] = [];
      snapshot.forEach((doc) => {
        prods.push({ id: doc.id, ...(doc.data() as Product) });
      });
      setProducts(prods);
    });

    return () => unsubscribe();
  }, []);

  function computeFinalPrice(originalPrice: number, discountPercent: number) {
    return originalPrice * (1 - discountPercent / 100);
  }

  function isValidUrl(url: string) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

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

  function addImageInput() {
    if (imageInputs.length < MAX_IMAGES) {
      setImageInputs((arr) => [...arr, { type: "url", value: "" }]);
    }
  }

  function removeImageInput(idx: number) {
    setImageInputs((arr) => arr.filter((_, i) => i !== idx));
  }

  async function uploadImageToServer(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("http://localhost:4000/api/upload", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error("Image upload failed");

    const data = await response.json();
    return data.url;
  }

  async function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setLoading(true);
    try {
      const url = await uploadImageToServer(file);
      const imgs = [...imageInputs];
      imgs[idx] = { type: "upload", value: url, file };
      setImageInputs(imgs);
    } catch (error: any) {
      alert("Cloudflare upload failed: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.name.trim()) errs.name = "Name is required";
    if (form.quantity < 0) errs.quantity = "Quantity cannot be negative";
    if (form.originalPrice < 0)
      errs.originalPrice = "Original price must be non-negative";
    if (form.discountPercent < 0 || form.discountPercent > 100)
      errs.discountPercent = "Discount % must be 0-100";
    if (form.companyName.trim().length === 0)
      errs.companyName = "Company name is required";
    if (form.accessDuration.trim().length === 0)
      errs.accessDuration = "Access duration is required";

    imageInputs.forEach((img, i) => {
      if (
        img.type === "url" &&
        img.value.trim() &&
        !isValidUrl(img.value.trim())
      ) {
        errs[`image_${i}`] = "Image URL invalid";
      }
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.email) {
      alert("You must be logged in.");
      return;
    }
    if (!validate()) return;

    setLoading(true);
    setMessage("");
    try {
      const images = imageInputs.map((imgObj) => imgObj.value).filter(Boolean);
      const timestamp = Timestamp.now();
      const finalPrice = computeFinalPrice(
        form.originalPrice,
        form.discountPercent
      );
      const payload = {
        ...form,
        images,
        finalPrice,
        createdBy: user.email,
        modifiedBy: user.email,
        createdAt: timestamp,
        updatedAt: timestamp,
        approved: false,
        rejected: false,
      };
      if (editingId) {
        await updateDoc(doc(firestore, "softwareProducts", editingId), payload);
      } else {
        await addDoc(collection(firestore, "softwareProducts"), payload);
      }
      resetForm();
      setMessage("Product submitted for approval.");
    } catch (error) {
      alert("Failed to submit product: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
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
    setMessage("");
  }

  function handleDelete(id: string) {
    if (window.confirm("Delete product?")) {
      setProducts((prods) => prods.filter((p) => p.id !== id));
      if (editingId === id) resetForm();
      // You should also delete from firestore here if desired
    }
  }

  function handleEdit(product: Product) {
    setEditingId(product.id);
    setForm({
      title: product.title || "",
      name: product.name || "",
      description: product.description || "",
      quantity: product.quantity || 0,
      originalPrice: product.originalPrice || 0,
      discountPercent: product.discountPercent || 0,
      companyName: product.companyName || "",
      accessDuration: product.accessDuration || "",
    });
    setImageInputs(
      product.images && product.images.length > 0
        ? product.images.map((url) => ({ type: "url", value: url }))
        : [{ type: "url", value: "" }]
    );
    setErrors({});
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">
        Software Products Management
      </h1>

      {message && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? "Edit Product" : "Add Software Product"}
        </h2>

        {/* Title and Name */}
        <div className="flex flex-col md:flex-row md:space-x-4 mb-4">
          <div className="flex-1 mb-4 md:mb-0">
            <label
              htmlFor="title"
              className="block text-sm md:text-base font-medium mb-1"
            >
              Title *
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleFieldChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
              disabled={loading}
            />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          <div className="flex-1">
            <label
              htmlFor="name"
              className="block text-sm md:text-base font-medium mb-1"
            >
              Name *
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleFieldChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              disabled={loading}
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name}</p>
            )}
          </div>
        </div>

        {/* Quantity, Company Name, Access Duration */}
        <div className="flex flex-col md:flex-row md:space-x-4 mb-4">
          <div className="flex-1 mb-4 md:mb-0">
            <label
              htmlFor="quantity"
              className="block text-sm md:text-base font-medium mb-1"
            >
              Quantity *
            </label>
            <input
              name="quantity"
              type="number"
              min={0}
              value={form.quantity}
              onChange={handleFieldChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                errors.quantity ? "border-red-500" : "border-gray-300"
              }`}
              disabled={loading}
            />
            {errors.quantity && (
              <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>
            )}
          </div>

          <div className="flex-1 mb-4 md:mb-0">
            <label
              htmlFor="companyName"
              className="block text-sm md:text-base font-medium mb-1"
            >
              Company Name *
            </label>
            <input
              name="companyName"
              value={form.companyName}
              onChange={handleFieldChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                errors.companyName ? "border-red-500" : "border-gray-300"
              }`}
              disabled={loading}
            />
            {errors.companyName && (
              <p className="text-red-600 text-sm mt-1">{errors.companyName}</p>
            )}
          </div>

          <div className="flex-1">
            <label
              htmlFor="accessDuration"
              className="block text-sm md:text-base font-medium mb-1"
            >
              Access Duration *
            </label>
            <input
              name="accessDuration"
              value={form.accessDuration}
              onChange={handleFieldChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                errors.accessDuration ? "border-red-500" : "border-gray-300"
              }`}
              disabled={loading}
            />
            {errors.accessDuration && (
              <p className="text-red-600 text-sm mt-1">
                {errors.accessDuration}
              </p>
            )}
          </div>
        </div>

        {/* Original Price and Discount Percent */}
        <div className="flex flex-col md:flex-row md:space-x-4 mb-4">
          <div className="flex-1 mb-4 md:mb-0">
            <label
              htmlFor="originalPrice"
              className="block text-sm md:text-base font-medium mb-1"
            >
              Original Price ($) *
            </label>
            <input
              name="originalPrice"
              type="number"
              min={0}
              step="0.01"
              value={form.originalPrice}
              onChange={handleFieldChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                errors.originalPrice ? "border-red-500" : "border-gray-300"
              }`}
              disabled={loading}
            />
            {errors.originalPrice && (
              <p className="text-red-600 text-sm mt-1">
                {errors.originalPrice}
              </p>
            )}
          </div>

          <div className="flex-1">
            <label
              htmlFor="discountPercent"
              className="block text-sm md:text-base font-medium mb-1"
            >
              Discount % *
            </label>
            <input
              name="discountPercent"
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={form.discountPercent}
              onChange={handleFieldChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                errors.discountPercent ? "border-red-500" : "border-gray-300"
              }`}
              disabled={loading}
            />
            {errors.discountPercent && (
              <p className="text-red-600 text-sm mt-1">
                {errors.discountPercent}
              </p>
            )}
          </div>
        </div>

        {/* Computed Final Price (read-only) */}
        <div className="mb-4">
          <label className="block text-sm md:text-base font-medium mb-1">
            Final Price ($)
          </label>
          <div className="px-3 py-2 rounded bg-gray-100 text-base md:text-lg">
            {computeFinalPrice(
              form.originalPrice,
              form.discountPercent
            ).toFixed(2)}
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-sm md:text-base font-medium mb-1"
          >
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleFieldChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            rows={3}
            disabled={loading}
          />
        </div>

        {/* Image Inputs Section */}
        <div className="mb-6">
          <label className="block text-sm md:text-base font-medium mb-2">
            Images (max {MAX_IMAGES})
          </label>

          {imageInputs.map((input, idx) => (
            <div
              key={idx}
              className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4"
            >
              {/* Type selector */}
              <select
                value={input.type}
                onChange={(e) =>
                  setImageInputs((imgs) =>
                    imgs.map((img, i) =>
                      i === idx
                        ? {
                            type: e.target.value as "url" | "upload",
                            value: "",
                          }
                        : img
                    )
                  )
                }
                disabled={loading}
                className="w-full md:w-40 border border-gray-300 rounded px-3 py-2 mb-2 md:mb-0"
              >
                <option value="url">Add Image by URL</option>
                <option value="upload">Upload Image</option>
              </select>

              {/* URL input or file input */}
              {input.type === "url" ? (
                <input
                  type="text"
                  placeholder="Image URL"
                  value={input.value}
                  onChange={(e) =>
                    setImageInputs((imgs) =>
                      imgs.map((img, i) =>
                        i === idx ? { ...img, value: e.target.value } : img
                      )
                    )
                  }
                  className={`flex-grow border rounded px-3 py-2 w-full md:w-auto ${
                    errors[`image_${idx}`]
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  disabled={loading}
                />
              ) : (
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) await handleFileChange(e, idx);
                  }}
                  disabled={loading}
                  className="flex-grow p-1"
                />
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeImageInput(idx)}
                disabled={loading}
                className="mt-2 md:mt-0 text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
                aria-label={`Remove image input ${idx + 1}`}
              >
                <Trash2 size={16} />
                Remove
              </button>
              {errors[`image_${idx}`] && (
                <p className="text-red-600 text-sm mt-1 md:mt-0">
                  {errors[`image_${idx}`]}
                </p>
              )}
            </div>
          ))}

          {/* Add Image Input Button */}
          {imageInputs.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={addImageInput}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 text-white rounded px-4 py-2 font-semibold shadow hover:from-indigo-500 hover:via-blue-500 hover:to-cyan-500 transition"
            >
              <Plus size={20} />
              Add Image
            </button>
          )}
        </div>

        {/* Submit and Clear buttons */}
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold px-4 py-2 rounded shadow hover:bg-indigo-700 transition disabled:opacity-50"
          >
            <CheckSquare size={20} />
            {editingId ? "Update Product" : "Add Product"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-300 text-gray-900 font-semibold px-4 py-2 rounded shadow hover:bg-gray-400 transition disabled:opacity-50"
          >
            <Eraser size={20} />
            Clear
          </button>
        </div>
      </form>

      {/* Products List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:overflow-x-auto">
        {products.map((prod) => (
          <SoftwareProductCard
            key={prod.id}
            product={prod}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
        {products.length === 0 && (
          <tr>
            <td
              colSpan={8}
              className="text-center py-6 text-gray-500 text-sm md:text-base"
            >
              No approved products found.
            </td>
          </tr>
        )}
      </div>
    </div>
  );
}
