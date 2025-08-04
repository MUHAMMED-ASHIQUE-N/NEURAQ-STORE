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

const MAX_IMAGES = 5;
const PRODUCT_CATEGORIES = [
  "Electronics",
  "Clothing",
  "Food & Beverages",
  "Furniture",
  "Books",
  "Accessories",
  "Other",
];

type ImageInput = {
  type: "url" | "upload";
  value: string;
  file?: File; // Local file for preview
};

export default function LocalProducts() {
  const { user } = useUser();

  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: "",
    name: "",
    description: "",
    quantity: 0,
    originalPrice: 0,
    discountPercent: 0,
    buyingLink: "",
    companyName: "",
    productCategory: PRODUCT_CATEGORIES[0],
    moreInfoLink: "",
  });

  const [imageInputs, setImageInputs] = useState<ImageInput[]>([
    { type: "url", value: "" },
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Load approved products
  useEffect(() => {
    const q = query(
      collection(firestore, "localProducts"),
      where("approved", "==", true)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods: any[] = [];
      snapshot.forEach((doc) => prods.push({ id: doc.id, ...doc.data() }));
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
    idx?: number
  ) {
    const { name, value } = e.target;
    if (name === "images" && typeof idx === "number") {
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
      setImageInputs((imgs) => [...imgs, { type: "url", value: "" }]);
    }
  }

  function removeImageInput(idx: number) {
    setImageInputs((imgs) => imgs.filter((_, i) => i !== idx));
  }

  async function uploadImageToServer(file: File): Promise<string> {
    // Upload image file to your backend API that uploads to Cloudflare Images
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("http://localhost:4000/api/upload", {
      // Adjust your backend endpoint accordingly
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Image upload failed");
    }
    const data = await response.json();
    return data.url; // Assuming backend returns { url: '...' }
  }

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

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.name.trim()) errs.name = "Name is required";
    if (form.quantity < 0) errs.quantity = "Quantity cannot be negative";
    if (form.originalPrice < 0)
      errs.originalPrice = "Original price must be non-negative";
    if (form.discountPercent < 0 || form.discountPercent > 100)
      errs.discountPercent = "Discount % must be between 0 and 100";
    if (form.buyingLink && !isValidUrl(form.buyingLink))
      errs.buyingLink = "Invalid Buying Link URL";
    if (form.moreInfoLink && !isValidUrl(form.moreInfoLink))
      errs.moreInfoLink = "Invalid External Info URL";

    imageInputs.forEach((img, i) => {
      if (
        img.type === "url" &&
        img.value.trim() &&
        !isValidUrl(img.value.trim())
      ) {
        errs[`image_${i}`] = "Invalid image URL";
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
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
        const ref = doc(firestore, "localProducts", editingId);
        await updateDoc(ref, {
          ...form,
          images: filteredImages,
          finalPrice,
          modifiedBy: user.email,
          updatedAt: timestamp,
          approved: false, // mark as pending approval on edit
          rejected: false,
        });
      } else {
        await addDoc(collection(firestore, "localProducts"), {
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
      alert("Error submitting product: " + (error as Error).message);
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
      buyingLink: "",
      companyName: "",
      productCategory: PRODUCT_CATEGORIES[0],
      moreInfoLink: "",
    });
    setImageInputs([{ type: "url", value: "" }]);
    setErrors({});
    setEditingId(null);
  }

  type ImageInputType = "url" | "upload"; // upload is placeholder to later handle Cloudflare upload

  interface ImageInput {
    type: ImageInputType;
    value: string; // image URL or local file placeholder
    file?: File; // For local upload, can store the file temporarily (optional for now)
  }
  function handleImageInputTypeChange(idx: number, newType: ImageInputType) {
    setImageInputs((inputs) =>
      inputs.map((input, i) =>
        i === idx
          ? { type: newType, value: "" } // clear previous value/file on type change
          : input
      )
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white shadow rounded">
      <h1 className="text-xl font-semibold mb-4">Add Local Product</h1>
      {message && <div className="mb-4 text-green-700">{message}</div>}
      <form onSubmit={handleSubmit} noValidate>
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
        </div>
        {/* Images Section */}
        <div className="mt-4">
          <label className="block font-semibold mb-2">
            Product Images (up to {MAX_IMAGES})
          </label>
          {imageInputs.map((input, idx) => (
            <div key={idx} className="flex items-center space-x-2 mb-3">
              <select
                value={input.type}
                onChange={(e) =>
                  handleImageInputTypeChange(
                    idx,
                    e.target.value as "url" | "upload"
                  )
                }
                disabled={loading}
                className="border rounded px-2 py-1"
              >
                <option value="url">Add via URL</option>
                <option value="upload">Upload File</option>
              </select>
              {input.type === "url" ? (
                <input
                  type="url"
                  placeholder="Image URL"
                  value={input.value}
                  onChange={(e) => handleInputChange(e, idx)}
                  name="images"
                  className="flex-grow border rounded px-3 py-2"
                />
              ) : (
                <input
                  type="file"
                  accept="image/*"
                  disabled={loading}
                  onChange={async (e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      await handleFileChange(e, idx);
                    }
                  }}
                  className="flex-grow"
                />
              )}
              {input.value && (
                <img
                  src={input.value}
                  alt="img preview"
                  className="w-16 h-12 object-cover rounded border"
                />
              )}
              {imageInputs.length > 1 && (
                <button
                  onClick={() => removeImageInput(idx)}
                  disabled={loading}
                  className="text-red-600 hover:text-red-800 font-semibold"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {imageInputs.length < MAX_IMAGES && (
            <button
              onClick={addImageInput}
              disabled={loading}
              className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
            >
              Add Image
            </button>
          )}
        </div>

        <div className="mt-6 space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded"
          >
            {editingId ? "Update Product" : "Add Product"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            disabled={loading}
            className="border border-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-100"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Add your product list table/code below, if desired */}
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
