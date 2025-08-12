import React from "react";

export default function Navbar() {
  return (
    <nav className="fixed w-full bg-white border-gray-700 shadow-md px-4 py-3 flex items-center justify-center md:justify-start">
      <span
        className="
          text-xl font-bold tracking-widest text-indigo-700
          md:text-2xl md:ml-2
        "
      >
        Neuraq Store
      </span>
    </nav>
  );
}
