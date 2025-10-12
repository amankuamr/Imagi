"use client";
import { useState } from "react";
import Link from "next/link";
import { Users, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ProfileDropdown from "./navbar/ProfileDropdown";
import UsersPanel from "./sidebar/UsersPanel";

export default function Navbar() {
  const [isUsersPanelOpen, setIsUsersPanelOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        {/* Mobile Layout */}
        <div className="flex justify-between items-center md:hidden relative">
          {/* Left: Logo */}
          <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-poppins)] tracking-tight">
            GameGallery
          </h1>

          {/* Right: Mobile Menu Button - Absolutely positioned */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="absolute top-4 right-6 text-white hover:text-purple-400 transition-colors duration-200 p-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 shadow-lg z-60"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex justify-between items-center">
          {/* Left: Logo */}
          <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-poppins)] tracking-tight">
            GameGallery
          </h1>

          {/* Center: Navigation Links */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <div className="flex gap-8 px-8 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
              <Link
                href="/"
                className="text-white hover:text-purple-400 transition-colors duration-200 font-medium font-[family-name:var(--font-inter)] tracking-wide"
              >
                Home
              </Link>
              <Link
                href="/gallery"
                className="text-white hover:text-purple-400 transition-colors duration-200 font-medium font-[family-name:var(--font-inter)] tracking-wide"
              >
                Gallery
              </Link>
              <Link
                href="/upload"
                className="text-white hover:text-purple-400 transition-colors duration-200 font-medium font-[family-name:var(--font-inter)] tracking-wide"
              >
                Upload
              </Link>
            </div>
          </div>

          {/* Right: User Menu */}
          <div className="flex gap-4 px-4 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
            <ProfileDropdown user={user} logout={logout} />
            <button
              onClick={() => setIsUsersPanelOpen(true)}
              className="text-white hover:text-purple-400 transition-colors duration-200"
              aria-label="Users"
            >
              <Users size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Sliding from Top */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-md border-b border-white/10 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{ paddingTop: '80px' }} // Account for navbar height
      >
        <div className="px-6 py-6 space-y-6">
          {/* Navigation Links */}
          <div className="space-y-4">
            <Link
              href="/"
              className="block text-white hover:text-purple-400 transition-colors duration-200 font-medium font-[family-name:var(--font-inter)] tracking-wide text-lg py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/gallery"
              className="block text-white hover:text-purple-400 transition-colors duration-200 font-medium font-[family-name:var(--font-inter)] tracking-wide text-lg py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Gallery
            </Link>
            <Link
              href="/upload"
              className="block text-white hover:text-purple-400 transition-colors duration-200 font-medium font-[family-name:var(--font-inter)] tracking-wide text-lg py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Upload
            </Link>
          </div>

          {/* User Menu Section */}
          <div className="border-t border-white/10 pt-6">
            <div className="flex items-center justify-between">
              <ProfileDropdown user={user} logout={logout} />
              <button
                onClick={() => {
                  setIsUsersPanelOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="text-white hover:text-purple-400 transition-colors duration-200 p-2"
                aria-label="Users"
              >
                <Users size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <UsersPanel
        isOpen={isUsersPanelOpen}
        onClose={() => setIsUsersPanelOpen(false)}
      />
    </>
  );
}
