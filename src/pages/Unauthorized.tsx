import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

export default function Unauthorized() {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      alert("Failed to logout: " + (error as Error).message);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 flex flex-col items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-red-600 mb-4 text-center">
          Unauthorized
        </h1>
        <p className="text-gray-700 mb-8 text-center text-base md:text-lg">
          You do not have permission to access this page.
          <br />
          Please log in with an account with sufficient permissions.
        </p>
        {/* Logout button in the middle */}
        <button
          onClick={handleLogout}
          className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded px-5 py-2 shadow transition mb-2"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
