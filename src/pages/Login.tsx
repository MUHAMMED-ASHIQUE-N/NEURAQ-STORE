import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth, firestore } from "../firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Authenticate user with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 2. Fetch user role from Firestore
      const userDocRef = doc(firestore, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        setError("User profile not found.");
        setLoading(false);
        return;
      }

      const userData = userSnap.data();
      const role = userData.role || "basic-user";

      // 3. Determine redirect path based on role
      let redirectPath = "/login"; // fallback

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
          // Could redirect to a "No access" or "Unauthorized" page or show an error
          redirectPath = "/unauthorized";
          break;
      }

      // 4. Redirect user to role-based page
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      setError(err.message || "Failed to login");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-xl font-bold mb-4 text-center">Login</h2>

        {error && <div className="text-red-600 mb-4 text-center">{error}</div>}

        <label className="block mb-2 font-medium">Email</label>
        <input
          type="email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          autoComplete="username"
        />

        <label className="block mb-2 font-medium">Password</label>
        <input
          type="password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 p-2 border rounded"
          autoComplete="current-password"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="mt-4 text-center text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-indigo-600 hover:underline">
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
}
