import React, { useState, useEffect } from "react";
import {
  Plus,
  CheckSquare,
  Eraser,
  Trash2,
  Package,
  Tag,
  Type,
} from "lucide-react";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { firestore } from "../firebase";
import { useUser } from "../contexts/UserContext";
import AmazonProductCard from "../components/AmazonProductCard";
import { FileText } from "lucide-react";

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
  buyingLink: string;
  createdBy: string;
  modifiedBy: string;
  createdAt: string;
  updatedAt: string;
  approved: boolean;
};

type ImageInputType = "url" | "upload";

interface ImageInput {
  type: ImageInputType;
  value: string;
  file?: File;
}

const MAX_IMAGES = 5;

// Dummy upload function placeholder
async function uploadToCloudflare(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch("http://localhost:4000/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Upload failed");

  const data = await res.json();
  return data.url;
}

function computeFinalPrice(originalPrice: number, discountPercent: number) {
  return originalPrice * (1 - discountPercent / 100);
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export default function AmazonProducts() {
  const { user } = useUser();

  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({
    title: "",
    name: "",
    description: "",
    quantity: 0,
    originalPrice: 0,
    discountPercent: 0,
    buyingLink: "",
  });
  const [imageInputs, setImageInputs] = useState<ImageInput[]>([
    { type: "url", value: "" },
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Load only approved products
    const unsub = onSnapshot(
      query(
        collection(firestore, "amazonProducts"),
        where("approved", "==", true)
      ),
      (snapshot) => {
        const prods: Product[] = [];
        snapshot.forEach((doc) => {
          prods.push({ id: doc.id, ...(doc.data() as Product) });
        });
        setProducts(prods);
      }
    );
    return () => unsub();
  }, []);

  //
  // Handlers and helpers below
  //

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((f) =>
      ["quantity", "originalPrice", "discountPercent"].includes(name)
        ? { ...f, [name]: Number(value) }
        : { ...f, [name]: value }
    );
  }

  function handleImageTypeChange(idx: number, type: ImageInputType) {
    setImageInputs((arr) =>
      arr.map((input, i) => (i === idx ? { type, value: "" } : input))
    );
  }

  function handleImageUrlChange(idx: number, value: string) {
    setImageInputs((arr) =>
      arr.map((input, i) => (i === idx ? { ...input, value } : input))
    );
  }

  async function handleUploadFile(idx: number, file: File) {
    setLoading(true);
    try {
      const url = await uploadToCloudflare(file);
      setImageInputs((arr) =>
        arr.map((input, i) =>
          i === idx ? { type: "upload", value: url } : input
        )
      );
    } catch (err: any) {
      alert("Cloudflare Upload Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  function removeImageInput(idx: number) {
    setImageInputs((arr) => arr.filter((_, i) => i !== idx));
  }

  function addImageInput() {
    if (imageInputs.length < MAX_IMAGES) {
      setImageInputs((arr) => [...arr, { type: "url", value: "" }]);
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
    if (form.buyingLink && !isValidUrl(form.buyingLink))
      newErrors.buyingLink = "Buying link must be a valid URL";

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
      buyingLink: "",
    });
    setImageInputs([{ type: "url", value: "" }]);
    setErrors({});
    setEditingId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || !user?.email) return;
    setLoading(true);
    const timestamp = new Date().toISOString();
    const images = imageInputs.map((i) => i.value).filter((v) => v.trim());
    const finalPrice = computeFinalPrice(
      form.originalPrice,
      form.discountPercent
    );

    try {
      if (editingId) {
        // Update product, mark pending approval
        const ref = doc(firestore, "amazonProducts", editingId);
        await updateDoc(ref, {
          ...form,
          images,
          finalPrice,
          modifiedBy: user.email,
          updatedAt: timestamp,
          approved: false, // mark as pending approval
          rejected: false,
        });
      } else {
        // Add new product
        await addDoc(collection(firestore, "amazonProducts"), {
          ...form,
          images,
          finalPrice,
          createdBy: user.email,
          modifiedBy: user.email,
          createdAt: timestamp,
          updatedAt: timestamp,
          approved: false,
          rejected: false,
        });
      }
      resetForm();
      setMessage("Product submitted for approval.");
    } catch {
      setMessage("Failed to save product.");
    } finally {
      setLoading(false);
    }
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
      buyingLink: prod.buyingLink,
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
      // Deletion in Firestore should be handled here too if desired
    }
  }

  // --- Responsive modified JSX return ---

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Package className="w-6 h-6 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            Amazon Product Management
          </h1>
        </div>
        <p className="text-gray-600">
          Add and manage your Amazon product listings
        </p>
      </div>
      {message && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {message}
        </div>
      )}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <form onSubmit={handleSubmit} className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Edit Product" : ""}
          </h2>

          {/* Title and Name - stacked on mobile, side by side on md+ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="">
              <label
                htmlFor="title"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                <Tag className="w-4 h-4 inline mr-1" />
                Product Title
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter product title"
                required
                disabled={loading}
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div className="">
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                <Type className="w-4 h-4 inline mr-1" />
                Product Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter product name"
                required
                disabled={loading}
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              <FileText className="w-4 h-4 inline mr-1" />
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter detailed product description"
              required
              disabled={loading}
            />
          </div>

          {/* Quantity, Original Price, Discount Percent - flex row on md */}
          <div className="flex flex-col md:flex-row md:space-x-4 mb-4">
            <div className="flex-1 mb-4 md:mb-0">
              <label htmlFor="quantity" className="block font-medium mb-1">
                Quantity *
              </label>
              <input
                name="quantity"
                type="number"
                min={0}
                value={form.quantity}
                onChange={handleInputChange}
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
              <label htmlFor="originalPrice" className="block font-medium mb-1">
                Original Price ($) *
              </label>
              <input
                name="originalPrice"
                type="number"
                min={0}
                step="0.01"
                value={form.originalPrice}
                onChange={handleInputChange}
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
                className="block font-medium mb-1"
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
                onChange={handleInputChange}
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
            <label className="block font-medium mb-1">Final Price ($)</label>
            <div className="px-3 py-2 rounded bg-gray-100">
              {computeFinalPrice(
                form.originalPrice,
                form.discountPercent
              ).toFixed(2)}
            </div>
          </div>

          {/* Buying Link */}
          <div className="mb-4">
            <label htmlFor="buyingLink" className="block font-medium mb-1">
              Buying Link (URL)
            </label>
            <input
              name="buyingLink"
              value={form.buyingLink}
              onChange={handleInputChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                errors.buyingLink ? "border-red-500" : "border-gray-300"
              }`}
              disabled={loading}
            />
            {errors.buyingLink && (
              <p className="text-red-600 text-sm mt-1">{errors.buyingLink}</p>
            )}
          </div>

          {/* Image Inputs Section */}
          <div className="mb-6">
            <label className="block font-medium mb-2">
              Images (up to {MAX_IMAGES})
            </label>

            {imageInputs.map((input, idx) => (
              <div
                key={idx}
                className="flex flex-col md:flex-row md:items-center md:space-x-3 mb-4"
              >
                {/* Type selector */}
                <select
                  value={input.type}
                  onChange={(e) =>
                    handleImageTypeChange(idx, e.target.value as ImageInputType)
                  }
                  disabled={loading}
                  className="mb-2 md:mb-0 border border-gray-300 rounded px-3 py-2 w-full md:w-40"
                >
                  <option value="url">Add Image by URL</option>
                  <option value="upload">Upload Image</option>
                </select>

                {/* URL input or file upload */}
                {input.type === "url" ? (
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={input.value}
                    onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                    className={`flex-grow border rounded px-3 py-2 ${
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
                      if (file) await handleUploadFile(idx, file);
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
                  className="flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold mt-2 md:mt-0 md:ml-2"
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
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded px-4 py-2 font-semibold shadow hover:from-blue-600 hover:to-indigo-600 transition"
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
      </div>
      {/* Approved Products List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:overflow-x-auto">
        {products.map((prod) => (
          <AmazonProductCard
            key={prod.id}
            product={prod}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
        {products.length === 0 && (
          <tr>
            <td colSpan={6} className="text-center py-6 text-gray-500">
              No approved products found.
            </td>
          </tr>
        )}
      </div>
    </div>
  );
}
