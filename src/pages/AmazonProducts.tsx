import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  Timestamp,
  query,
  where,
} from "firebase/firestore";
import { firestore } from "../firebase";
import { useUser } from "../contexts/UserContext";
import AmazonProductCard from "../components/AmazonProductCard";

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

// Cloudflare Upload Helper
// async function uploadImageToCloudflare(file: File): Promise<string> {
//   const CLOUDFLARE_ACCOUNT_ID = a26ad94e691df93fea801ec5e167209f;
//   const CLOUDFLARE_API_TOKEN = cFCd3IYqHIJEInWJpK4cpLPdqr6aZPzgzVbl2_un;
//   const formData = new FormData();
//   formData.append("file", file);

//   const res = await fetch(
//     `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1`,
//     {
//       method: "POST",
//       headers: { Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}` },
//       body: formData,
//     }
//   );

//   const data = await res.json();
//   if (!res.ok || !data.success)
//     throw new Error(data.errors?.[0]?.message || "Cloudflare upload failed");
//   // Use default variant:
//   return data.result.variants[0];
// }
async function uploadToCloudflare(file) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch("http://localhost:4000/api/upload", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.url; // or data.allVariants[0]
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
    // Only load approved products
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
      arr.map((input, i) =>
        i === idx ? { type, value: "", file: undefined } : input
      )
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
        // Update product -> set as pending approval
        const ref = doc(firestore, "amazonProducts", editingId);
        await updateDoc(ref, {
          ...form,
          images,
          finalPrice,
          modifiedBy: user.email,
          updatedAt: timestamp,
          approved: false,
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

  // Rest of handlers (edit, delete) from previous code...
  // --- Form handlers ---
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
    }
  }

  function populateFormForEdit(prod: Product) {
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
      prod.images && prod.images.length > 0
        ? prod.images.map((url) => ({ type: "url", value: url }))
        : [{ type: "url", value: "" }]
    );
    setErrors({});
  }

  // RENDER
  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Amazon Products Management
      </h1>
      {message && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
          {message}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl bg-white rounded-xl shadow p-6 mb-8"
        noValidate
      >
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? "Edit Product" : "Add Amazon Product"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ... The same field inputs as your code ... */}
          <div>
            <label className="block font-medium mb-1">Title *</label>
            <input
              name="title"
              type="text"
              value={form.title}
              onChange={handleInputChange}
              className={`w-full p-2 border rounded ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">{errors.title}</p>
            )}
          </div>
          {/* repeat for name, description, quantity, originalPrice, discountPercent, buyingLink */}
          {/* ... */}
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
          {/* Buying Link */}
          <div className="md:col-span-2">
            <label className="block mb-1 font-medium text-gray-700">
              Buying Link (URL)
            </label>
            <input
              name="buyingLink"
              type="url"
              value={form.buyingLink}
              onChange={handleFieldChange}
              className={`w-full border px-3 py-2 rounded ${
                errors.buyingLink ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.buyingLink && (
              <p className="text-red-600 text-sm mt-1">{errors.buyingLink}</p>
            )}
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
          <div>
            <label className="block font-medium mb-1">Final Price</label>
            <p className="p-2 font-semibold">
              {computeFinalPrice(
                form.originalPrice,
                form.discountPercent
              ).toFixed(2)}
            </p>
          </div>
        </div>
        {/* IMAGE INPUTS */}
        <div className="mt-5">
          <label className="block mb-2 font-semibold text-gray-700">
            Images (up to {MAX_IMAGES})
          </label>
          {imageInputs.map((input, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-3">
              <select
                value={input.type}
                onChange={(e) =>
                  handleImageTypeChange(idx, e.target.value as ImageInputType)
                }
                className="border rounded p-1"
                disabled={loading}
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
                  className="flex-grow"
                  disabled={loading}
                />
              )}
              {input.value && (
                <img
                  src={input.value}
                  alt={`Image Preview ${idx + 1}`}
                  className="w-16 h-12 object-cover rounded border"
                />
              )}
              <button
                type="button"
                onClick={() => removeImageInput(idx)}
                className="text-red-600 hover:text-red-800 font-semibold"
                disabled={loading}
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
              disabled={loading}
            >
              Add Image
            </button>
          )}
        </div>
        <div className="mt-6 flex gap-4">
          <button
            type="submit"
            className="px-5 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
            disabled={loading}
          >
            {editingId ? "Update Product" : "Add Product"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="px-5 py-2 rounded border border-gray-400 text-gray-700 hover:bg-gray-100"
            disabled={loading}
          >
            Clear
          </button>
        </div>
      </form>
      {/* Approved Product Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((prod) => (
          <AmazonProductCard
            key={prod.id}
            product={prod}
            onEdit={populateFormForEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
