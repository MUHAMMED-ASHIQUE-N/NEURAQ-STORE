import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { LogOut, ShieldX } from "lucide-react";

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
    <div className="bg-gradient-to-br from-red-50 to-orange-50 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center fade-in">
          {/* Icon */}
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center pulse-animation">
              <ShieldX className="w-10 h-10 text-red-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Access Denied
          </h1>

          {/* Error Code */}
          <div className="mb-6">
            <span className="inline-block bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">
              Error 403
            </span>
          </div>

          {/* Main Message */}
          <div className="mb-8 space-y-3">
            <p className="text-gray-600 text-base md:text-lg leading-relaxed">
              You do not have permission to access this page.
            </p>
            <p className="text-gray-500 text-sm md:text-base">
              Please log in with an account with sufficient permissions.
            </p>
          </div>
          {/* Logout button in the middle */}
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs md:text-sm text-gray-400">
              If you believe this is an error, please contact your
              administrator.
            </p>
          </div>
        </div>
        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help?
            <a
              href="#"
              className="text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
