"use client";
import { useState } from "react";
import { User, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface ProfileDropdownProps {
  user: any; // Replace with proper Firebase user type if available
  logout: () => Promise<void>;
}

export default function ProfileDropdown({ user, logout }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
      setIsOpen(false);
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
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-white hover:text-purple-400 transition-colors duration-200"
        aria-label="Profile"
      >
        <User size={20} />
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-1"
        >
          <ChevronDown size={16} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full mt-2 right-0 w-64 rounded-2xl bg-white border border-gray-200 shadow-lg overflow-hidden z-60"

          >
            {user ? (
              <div className="py-2">
                {/* Authenticated User Menu */}
                <div className="px-4 py-3 text-sm font-medium text-black border-b border-gray-200 mb-2">
                  {getFirstName(user.displayName)}
                </div>
                <button
                  className="w-full flex items-center px-4 py-3 text-black hover:bg-gray-100 transition-colors duration-200 text-left"
                  onClick={() => {
                    router.push('/profile');
                    setIsOpen(false);
                  }}
                >
                  <User className="mr-3 h-4 w-4" />
                  Profile
                </button>
                <button
                  className="w-full flex items-center px-4 py-3 text-black hover:bg-gray-100 transition-colors duration-200 text-left"
                  onClick={() => {
                    router.push('/contributions');
                    setIsOpen(false);
                  }}
                >
                  <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Contributions
                </button>
                <button
                  className="w-full flex items-center px-4 py-3 text-black hover:bg-gray-100 transition-colors duration-200 text-left"
                  onClick={() => {
                    router.push('/votes');
                    setIsOpen(false);
                  }}
                >
                  <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  Votes
                </button>
                <div className="border-t border-gray-200 my-2"></div>
                <button
                  className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200 text-left"
                  onClick={handleLogout}
                >
                  <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            ) : (
              <div className="py-2">
                {/* Unauthenticated User Menu */}
                <button
                  className="w-full flex items-center px-4 py-3 text-black hover:bg-gray-100 transition-colors duration-200 text-left"
                  onClick={() => {
                    router.push('/login');
                    setIsOpen(false);
                  }}
                >
                  <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </button>
                <button
                  className="w-full flex items-center px-4 py-3 text-black hover:bg-gray-100 transition-colors duration-200 text-left"
                  onClick={() => {
                    router.push('/signup');
                    setIsOpen(false);
                  }}
                >
                  <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Sign Up
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
