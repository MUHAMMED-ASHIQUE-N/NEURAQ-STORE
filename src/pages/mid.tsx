import React, { useState, useEffect } from "react";
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

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    idx?: number
  ) {
    const { name, value } = e.target;
    if (name === "images" && idx !== undefined) {
      const imgs = [...imageInputs];
      imgs[idx].value = value;
      setImageInputs(imgs);
    } else if (
      ["quantity", "originalPrice", "discountPercent"].includes(name)
    ) {
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
      const filteredImages = imageInputs
        .map((img) => img.value.trim())
        .filter(Boolean);
      const timestamp = Timestamp.now();
      const finalPrice = computeFinalPrice();

      if (editingId) {
        const ref = doc(firestore, "softwareProducts", editingId);
        await updateDoc(ref, {
          ...form,
          images: filteredImages,
          finalPrice,
          modifiedBy: user.email,
          updatedAt: timestamp,
          approved: false,
          rejected: false,
        });
      } else {
        await addDoc(collection(firestore, "softwareProducts"), {
          ...form,
          images: filteredImages,
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

  return (
    <div className="max-w-5xl mx-auto p-4 bg-white rounded border shadow">
      <h1 className="text-xl font-bold mb-4">Add Software Product</h1>

      {message && <div className="mb-4 text-green-600">{message}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-semibold">Title</label>
            <input
              className={`w-full border p-2 rounded ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
              value={form.title}
              name="title"
              onChange={handleInputChange}
              required
            />
            {errors.title && (
              <p className="text-red-600 text-sm">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-semibold">Name</label>
            <input
              className={`w-full border p-2 rounded ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              value={form.name}
              name="name"
              onChange={handleInputChange}
              required
            />
            {errors.name && (
              <p className="text-red-600 text-sm">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-semibold">Company Name</label>
            <input
              className={`w-full border p-2 rounded ${
                errors.companyName ? "border-red-500" : "border-gray-300"
              }`}
              value={form.companyName}
              name="companyName"
              onChange={handleInputChange}
              required
            />
            {errors.companyName && (
              <p className="text-red-600 text-sm">{errors.companyName}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-semibold">Access Duration</label>
            <input
              className={`w-full border p-2 rounded ${
                errors.accessDuration ? "border-red-500" : "border-gray-300"
              }`}
              value={form.accessDuration}
              name="accessDuration"
              onChange={handleInputChange}
              required
            />
            {errors.accessDuration && (
              <p className="text-red-600 text-sm">{errors.accessDuration}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-semibold">Quantity</label>
            <input
              type="number"
              className={`w-full border p-2 rounded ${
                errors.quantity ? "border-red-500" : "border-gray-300"
              }`}
              value={form.quantity}
              name="quantity"
              onChange={handleInputChange}
            />
            {errors.quantity && (
              <p className="text-red-600 text-sm">{errors.quantity}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-semibold">Original Price</label>
            <input
              type="number"
              className={`w-full border p-2 rounded ${
                errors.originalPrice ? "border-red-500" : "border-gray-300"
              }`}
              value={form.originalPrice}
              name="originalPrice"
              onChange={handleInputChange}
            />
            {errors.originalPrice && (
              <p className="text-red-600 text-sm">{errors.originalPrice}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-semibold">Discount %</label>
            <input
              type="number"
              className={`w-full border p-2 rounded ${
                errors.discountPercent ? "border-red-500" : "border-gray-300"
              }`}
              value={form.discountPercent}
              name="discountPercent"
              onChange={handleInputChange}
            />
            {errors.discountPercent && (
              <p className="text-red-600 text-sm">{errors.discountPercent}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block mb-1 font-semibold">Description</label>
            <textarea
              className="w-full border p-2 rounded"
              value={form.description}
              name="description"
              onChange={handleInputChange}
              rows={4}
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
                  className={`flex-grow rounded border p-2 ${
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
                  className="w-20 h-16 border rounded object-cover"
                />
              )}

              <button
                disabled={loading}
                className="text-red-600 font-semibold"
                onClick={() =>
                  setImageInputs((imgs) => imgs.filter((_, i) => i !== idx))
                }
              >
                Remove
              </button>
            </div>
          ))}

          {imageInputs.length < MAX_IMAGES && (
            <button
              disabled={loading}
              onClick={() =>
                setImageInputs((imgs) => [...imgs, { type: "url", value: "" }])
              }
              className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded"
            >
              Add Image
            </button>
          )}
        </div>

        <div className="mt-6 flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:opacity-60"
          >
            {editingId ? "Update Product" : "Submit Product"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            disabled={loading}
            className="border px-6 py-2 rounded hover:bg-gray-100"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Your products table goes here */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">
          Approved Software Products
        </h2>
        {products.length === 0 ? (
          <p>No software products approved yet.</p>
        ) : (
          <table className="min-w-full table-auto border border-gray-300 text-left text-sm">
            <thead className="bg-indigo-100">
              <tr>
                <th className="px-4 py-2 border">Title</th>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Company</th>
                <th className="px-4 py-2 border">Access Duration</th>
                <th className="px-4 py-2 border">Quantity</th>
                <th className="px-4 py-2 border">Final Price</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod.id} className="hover:bg-indigo-50 border-b">
                  <td className="px-4 py-2 border">{prod.title}</td>
                  <td className="px-4 py-2 border">{prod.name}</td>
                  <td className="px-4 py-2 border">{prod.companyName}</td>
                  <td className="px-4 py-2 border">{prod.accessDuration}</td>
                  <td className="px-4 py-2 border">{prod.quantity}</td>
                  <td className="px-4 py-2 border">
                    $
                    {prod.finalPrice?.toFixed(2) ??
                      computeFinalPrice().toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
