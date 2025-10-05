"use client";
import { useEffect, useState } from "react";
import { ShoppingCart, User } from "lucide-react";

export default function Navbar() {
  // Track mount to trigger appear animation
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-4">
      {/* Left: Logo with appear animation */}
      <h1
        className={[
          "text-2xl font-bold text-white-400 font-[family-name:var(--font-poppins)] tracking-tight",
          "transition-all duration-500 ease-out will-change-transform",
          mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-2 scale-95"
        ].join(" ")}
      >
        GameGallery
      </h1>

      {/* Center: Navigation Links with appear animation */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <div
          className={[
            "flex gap-8 px-8 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg",
            "transition-all duration-500 ease-out will-change-transform",
            mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-2 scale-95"
          ].join(" ")}
        >
          <a
            href="/"
            className="text-white hover:text-purple-400 transition-colors duration-200 font-medium font-[family-name:var(--font-inter)] tracking-wide"
          >
            Home
          </a>
          <a
            href="/gallery"
            className="text-white hover:text-purple-400 transition-colors duration-200 font-medium font-[family-name:var(--font-inter)] tracking-wide"
          >
            Gallery
          </a>
          <a
            href="/upload"
            className="text-white hover:text-purple-400 transition-colors duration-200 font-medium font-[family-name:var(--font-inter)] tracking-wide"
          >
            Upload
          </a>
        </div>
      </div>

      {/* Right: Icons pill with appear animation */}
      <div
        className={[
          "flex gap-4 px-4 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg",
          "transition-all duration-500 ease-out will-change-transform",
          mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-2 scale-95"
        ].join(" ")}
      >
        <button className="text-white hover:text-purple-400 transition-colors duration-200" aria-label="User">
          <User size={20} />
        </button>
        <button className="text-white hover:text-purple-400 transition-colors duration-200" aria-label="Cart">
          <ShoppingCart size={20} />
        </button>
      </div>
    </nav>
  );
}