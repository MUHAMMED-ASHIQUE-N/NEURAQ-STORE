import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  CheckSquare,
  Eraser,
  Trash2,
  Package,
  Tag,
  Type,
  Hash,
  ExternalLink,
  DollarSign,
  Images,
  PlusCircle,
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
  const titleRef = useRef<HTMLInputElement>(null);

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
    titleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleDelete(id: string) {
    // Firestore deletion should be handled here too if desired
    setProducts((prods) => prods.filter((p) => p.id !== id));
    if (editingId === id) resetForm();
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
        <p ref={titleRef} className="text-gray-600">
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
          <div className="mt-6">
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

          {/* Quantity, Buying Link */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="mt-4">
              <label
                htmlFor="quantity"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                <Hash className="w-4 h-4 inline mr-1" />
                Quantity
              </label>
              <input
                name="quantity"
                type="number"
                min={0}
                value={form.quantity}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter quantity"
                required
                disabled={loading}
              />
              {errors.quantity && (
                <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>
              )}
            </div>
            <div className="mt-4">
              <label
                htmlFor="buyingLink"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                <ExternalLink className="w-4 h-4 inline mr-1" />
                Buying Link
              </label>
              <input
                name="buyingLink"
                value={form.buyingLink}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="https://amazon.com/..."
                required
                disabled={loading}
              />
              {errors.buyingLink && (
                <p className="text-red-600 text-sm mt-1">{errors.buyingLink}</p>
              )}
            </div>
          </div>

          {/* Original Price, Discount, Final Price */}

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Price Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="">
                <label
                  htmlFor="originalPrice"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Original Price ($)
                </label>
                <input
                  name="originalPrice"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.originalPrice}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="0.00"
                  required
                  disabled={loading}
                />
                {errors.originalPrice && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.originalPrice}
                  </p>
                )}
              </div>

              <div className="">
                <label
                  htmlFor="discountPercent"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Discount (%)
                </label>
                <input
                  name="discountPercent"
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  value={form.discountPercent}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="0"
                  disabled={loading}
                />
                {errors.discountPercent && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.discountPercent}
                  </p>
                )}
              </div>

              {/* Computed Final Price (read-only) */}
              <div className="">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Final Price ($)
                </label>
                <div className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100">
                  {computeFinalPrice(
                    form.originalPrice,
                    form.discountPercent
                  ).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Image Inputs Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Images className="w-5 h-5 mr-2" />
                Product Images (Up to {MAX_IMAGES} )
              </h3>

              {/* Add Image Input Button */}
              {imageInputs.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={addImageInput}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Image
                </button>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4 image-preview">
              {imageInputs.map((input, idx) => (
                <div key={idx} className="">
                  <div className="flex items-center justify-between mb-3">
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
                  {/* Type selector */}
                  <div className="mb-3">
                    <select
                      value={input.type}
                      onChange={(e) =>
                        handleImageTypeChange(
                          idx,
                          e.target.value as ImageInputType
                        )
                      }
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg image-type-select"
                    >
                      <option value="url">Image URL</option>
                      <option value="upload">Upload Image</option>
                    </select>
                  </div>

                  {/* URL input or file upload */}
                  {input.type === "url" ? (
                    <input
                      type="text"
                      value={input.value}
                      onChange={(e) =>
                        handleImageUrlChange(idx, e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Enter image URL"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Upload Image"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit and Clear buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              {editingId ? "Update Product" : "Add Product"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              disabled={loading}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Eraser className="w-5 h-5" />
              Clear
            </button>
          </div>
        </form>
      </div>
      {/* Approved Products List */}
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
      </div>
    </div>
  );
}
