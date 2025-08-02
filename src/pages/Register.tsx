import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { auth, firestore } from "../firebase";

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

      // 2. Save user data in Firestore with default role "basic-user"
      await setDoc(doc(firestore, "users", user.uid), {
        email: user.email,
        role: "basic-user", // default role assigned automatically
        createdAt: new Date().toISOString(),
      });

      // 3. Redirect after successful registration
      navigate("/login"); // or /admin/dashboard if you want auto-login
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form
        className="bg-white p-6 rounded shadow-md w-full max-w-md"
        onSubmit={handleRegister}
      >
        <h2 className="text-xl font-bold mb-4 text-center">Register</h2>

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
          className="w-full mb-4 p-2 border rounded"
          minLength={6}
          autoComplete="new-password"
        />

        <label className="block mb-2 font-medium">Confirm Password</label>
        <input
          type="password"
          value={passwordConfirm}
          required
          onChange={(e) => setPasswordConfirm(e.target.value)}
          className="w-full mb-6 p-2 border rounded"
          minLength={6}
          autoComplete="new-password"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}
