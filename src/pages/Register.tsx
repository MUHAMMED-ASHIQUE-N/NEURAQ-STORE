import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { auth, firestore } from "../firebase";
import { UserPlus } from "lucide-react"; // lucide-react icon

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== passwordConfirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 2. Save user data in Firestore with role "user"
      await setDoc(doc(firestore, "users", user.uid), {
        email: user.email,
        role: "user", // <-- ensure role is exactly "user"
        createdAt: new Date().toISOString(),
      });

      // 3. Redirect after successful registration
      navigate("/login");
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        setError(
          "This email address is already registered. Please log in instead."
        );
      } else {
        setError("Registration failed: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg py-8 px-6 md:px-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-2">
          Create an Account
        </h2>
        <p className="text-gray-600 text-center mb-6 text-sm md:text-base">
          Join as a user. Already registered?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
        {error && (
          <div className="mb-4 p-3 text-red-700 bg-red-100 border border-red-200 rounded text-center text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleRegister} className="space-y-4">
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
              autoComplete="email"
              value={email}
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
            />
          </div>
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
          <div>
            <label
              htmlFor="passwordConfirm"
              className="block text-sm md:text-base font-medium text-gray-700 mb-1"
            >
              Confirm Password
            </label>
            <input
              id="passwordConfirm"
              type="password"
              required
              value={passwordConfirm}
              disabled={loading}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="w-full border rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded shadow transition disabled:opacity-50"
          >
            <UserPlus size={20} />
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
