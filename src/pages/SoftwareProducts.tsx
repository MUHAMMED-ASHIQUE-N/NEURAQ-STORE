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

  function computeFinalPrice() {
    return form.originalPrice * (1 - form.discountPercent / 100);
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
      const finalPrice = computeFinalPrice();
      const payload = {
        ...form, // title, name, etc.
        images, // <--------- array of image URLs
        finalPrice: computeFinalPrice(form.originalPrice, form.discountPercent),
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
    }
  }

  function handleEdit(product) {
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
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Software Products Management
      </h1>

      {message && <div className="mb-4 text-green-600">{message}</div>}

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
        </div>
        <div className="mt-4">
          <label className="block font-bold mb-2">
            Images (max {MAX_IMAGES})
          </label>
          {imageInputs.map((input, idx) => (
            <div key={idx} className="flex space-x-2 items-center mb-2">
              <select
                className="border rounded p-1"
                disabled={loading}
                value={input.type}
                onChange={(e) => {
                  setImageInputs((imgs) =>
                    imgs.map((img, i) =>
                      i === idx
                        ? {
                            type: e.target.value as "url" | "upload",
                            value: "",
                          }
                        : img
                    )
                  );
                }}
              >
                <option value="url">Add Image by URL</option>
                <option value="upload">Upload Local Image</option>
              </select>

              {input.type === "url" ? (
                <input
                  type="url"
                  placeholder="Image URL"
                  className={`flex-grow p-2 border rounded ${
                    errors[`image_${idx}`]
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  disabled={loading}
                  value={input.value}
                  onChange={(e) =>
                    setImageInputs((imgs) =>
                      imgs.map((img, i) =>
                        i === idx ? { ...img, value: e.target.value } : img
                      )
                    )
                  }
                />
              ) : (
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file)
                      await handleFileChange(
                        e as React.ChangeEvent<HTMLInputElement>,
                        idx
                      );
                  }}
                  disabled={loading}
                />
              )}

              {input.value && (
                <img
                  src={input.value}
                  alt="Preview"
                  className="w-16 h-12 object-cover rounded border"
                />
              )}

              <button
                type="button"
                onClick={() => removeImageInput(idx)}
                disabled={loading}
                className="flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold"
              >
                <Trash2 size={16} />
                Remove
              </button>
            </div>
          ))}

          {imageInputs.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={addImageInput}
              disabled={imageInputs.length >= MAX_IMAGES || loading}
              className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded px-3 py-1 font-semibold shadow hover:from-blue-600 hover:to-indigo-600 transition"
            >
              <Plus size={18} />
              Add Image
            </button>
          )}
        </div>

        <div className="mt-6 flex space-x-4">
          <button
            className="flex items-center gap-1 mt-6 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded px-6 py-2 font-bold shadow hover:from-blue-600 hover:to-indigo-600 transition"
            type="submit"
            disabled={loading}
          >
            <CheckSquare size={18} />
            {editingId ? "Update Product" : "Add Product"}
          </button>

          <button
            type="button"
            onClick={resetForm}
            disabled={loading}
            className="flex items-center gap-1 mt-6 bg-gradient-to-r from-gray-400 to-gray-700 text-white rounded px-6 py-2 font-bold shadow hover:from-gray-600 hover:to-gray-900 transition"
          >
            <Eraser size={18} />
            Clear
          </button>
        </div>
      </form>

      {/* Your products table goes here */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((prod) => (
          <SoftwareProductCard
            key={prod.id}
            product={prod}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
