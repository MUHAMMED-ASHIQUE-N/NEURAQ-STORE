import React, { useState, useEffect } from "react";

import {
  Plus,
  CheckSquare,
  Eraser,
  Trash2,
  Monitor,
  Tag,
  Type,
  FileText,
  Hash,
  Clock,
  Building,
  DollarSign,
  Images,
  PlusCircle,
  RefreshCcw,
} from "lucide-react";

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
    <div className="bg-gradient-to-br from-purple-50 to-blue-100 min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 gradient-bg rounded-lg">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">
              Software Product Management
            </h1>
          </div>
          <p className="text-gray-600">
            Add and manage your software products and licenses
          </p>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {message}
          </div>
        )}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? "" : ""}
            </h2>

            {/* Title and Name */}
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
                  onChange={handleFieldChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter software title"
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
                  onChange={handleFieldChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter software name"
                  disabled={loading}
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mt-4">
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
                onChange={handleFieldChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                placeholder="Describe your software product, features, and benefits..."
                rows={3}
                disabled={loading}
              />
            </div>

            {/* Quantity, Access Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="">
                <label
                  htmlFor="quantity"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  <Hash className="w-4 h-4 inline mr-1" />
                  Quantity *
                </label>
                <input
                  name="quantity"
                  type="number"
                  min={0}
                  value={form.quantity}
                  onChange={handleFieldChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Number of licenses"
                  disabled={loading}
                />
                {errors.quantity && (
                  <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>
                )}
              </div>
              <div className="">
                <label
                  htmlFor="accessDuration"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  <Clock className="w-4 h-4 inline mr-1" />
                  Access Duration *
                </label>
                <input
                  name="accessDuration"
                  value={form.accessDuration}
                  onChange={handleFieldChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  disabled={loading}
                />
                {errors.accessDuration && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.accessDuration}
                  </p>
                )}
              </div>
            </div>

            {/* Company Name */}

            <div className="">
              <label
                htmlFor="companyName"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                <Building className="w-4 h-4 inline mr-1" />
                Company Name *
              </label>
              <input
                name="companyName"
                value={form.companyName}
                onChange={handleFieldChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Enter software company name"
                disabled={loading}
              />
              {errors.companyName && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.companyName}
                </p>
              )}
            </div>

            {/* Price Details */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricing Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="">
                  <label
                    htmlFor="originalPrice"
                    className="block text-sm font-semibold text-gray-700 mb-2"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="0.00"
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
                    className="block text-sm font-semibold text-gray-700 mb-2"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Final Price ($)
                  </label>
                  <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="url">Add Image by URL</option>
                        <option value="upload">Upload Image</option>
                      </select>

                      {/* URL input or file input */}
                      <div className="mt-4">
                        {input.type === "url" ? (
                          <input
                            type="text"
                            placeholder="Image URL"
                            value={input.value}
                            onChange={(e) =>
                              setImageInputs((imgs) =>
                                imgs.map((img, i) =>
                                  i === idx
                                    ? { ...img, value: e.target.value }
                                    : img
                                )
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit and Clear buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-semibold"
              >
                <PlusCircle className="w-5 h-5" />
                {editingId ? "Update Product" : "Add Product"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 font-semibold"
              >
                <RefreshCcw className="w-5 h-5" />
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>

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
