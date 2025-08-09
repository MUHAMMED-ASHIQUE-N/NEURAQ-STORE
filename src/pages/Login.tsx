import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { auth, firestore } from "../firebase";
import { LogIn, XCircle } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Get user role from Firestore
      const userDoc = await getDoc(doc(firestore, "users", user.uid));
      if (!userDoc.exists()) {
        throw new Error("User record not found in database");
      }
      const role = userDoc.data().role;

      // Determine redirect path by role
      let redirectPath = "/unauthorized";
      switch (role) {
        case "main-admin":
          redirectPath = "/admin/dashboard";
          break;
        case "amazon-semi-admin":
          redirectPath = "/admin/amazon-products";
          break;
        case "local-semi-admin":
          redirectPath = "/admin/local-products";
          break;
        case "software-semi-admin":
          redirectPath = "/admin/software-products";
          break;
        default:
          redirectPath = "/unauthorized";
          break;
      }

      navigate(redirectPath);
    } catch (error: any) {
      setError(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setEmail("");
    setPassword("");
    setError("");
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg py-8 px-6 md:px-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-2">
          Login
        </h2>
        <p className="text-gray-600 text-center mb-6 text-sm md:text-base">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
        {error && (
          <div className="mb-4 p-3 text-red-700 bg-red-100 border border-red-200 rounded text-center text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm md:text-base font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
            />
          </div>
          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm md:text-base font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              disabled={loading}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col md:flex-row md:space-x-3 space-y-3 md:space-y-0 mt-4">
            {/* Submit/Login button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded shadow transition disabled:opacity-50"
            >
              <LogIn size={20} />
              {loading ? "Logging in..." : "Login"}
            </button>

            {/* Cancel/Reset button */}
            <button
              type="button"
              onClick={handleCancel}
              className="w-full flex items-center justify-center gap-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded shadow transition"
            >
              <XCircle size={20} />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
