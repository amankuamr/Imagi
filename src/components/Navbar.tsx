"use client";
import { useEffect, useState } from "react";
import { ShoppingCart, User, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get user's first name
  const getFirstName = (displayName: string | null) => {
    if (!displayName) return 'User';
    return displayName.split(' ')[0];
  };

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

      {/* Right: User Menu or Auth Links */}
      <div
        className={[
          "flex gap-4 px-4 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg",
          "transition-all duration-500 ease-out will-change-transform",
          mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-2 scale-95"
        ].join(" ")}
      >
        {/* Profile Dropdown - Always visible */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger className="flex items-center text-white hover:text-purple-400 transition-colors duration-200" aria-label="Profile">
            <User size={20} />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            {user ? (
              <>
                {/* Authenticated User Menu */}
                <div className="px-2 py-1.5 text-sm font-medium text-gray-900 border-b border-gray-200 mb-1">
                  {getFirstName(user.displayName)}
                </div>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => router.push('/profile')}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => router.push('/contributions')}
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Contributions
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => router.push('/votes')}
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  Votes
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={handleLogout}
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </DropdownMenuItem>
              </>
            ) : (
              <>
                {/* Unauthenticated User Menu */}
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => router.push('/login')}
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => router.push('/signup')}
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Sign Up
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <button className="text-white hover:text-purple-400 transition-colors duration-200" aria-label="Cart">
          <ShoppingCart size={20} />
        </button>
      </div>
    </nav>
  );
}
