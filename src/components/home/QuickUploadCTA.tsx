"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Upload } from "lucide-react";

export default function QuickUploadCTA() {
  const { user } = useAuth();
  const router = useRouter();

  // Only show for logged-in users
  if (!user) return null;

  const handleUploadClick = () => {
    router.push('/upload');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: 1.5, // Delay to appear after Hero loads
        ease: "easeOut"
      }}
      className="fixed bottom-8 left-8 z-40"
    >
      <motion.button
        whileHover={{
          scale: 1.05,
          boxShadow: "0 20px 40px rgba(0, 255, 255, 0.3)"
        }}
        whileTap={{ scale: 0.95 }}
        onClick={handleUploadClick}
        className="group relative flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-xl border border-white/20 rounded-2xl text-white font-bold text-lg shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 overflow-hidden"
      >
        {/* Animated background */}
        <motion.div
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        />

        {/* Sparkle effects */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-1 -left-1 w-3 h-3 bg-cyan-400 rounded-full blur-sm"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
          className="absolute -bottom-1 -right-1 w-2 h-2 bg-purple-400 rounded-full blur-sm"
        />

        {/* Content */}
        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <Upload className="w-6 h-6" />
        </motion.div>

        <span className="relative z-10 hidden sm:inline">Upload Screenshot</span>

        {/* Shine effect */}
        <motion.div
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
        />

        {/* Pulse ring */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 rounded-2xl border-2 border-cyan-400/30"
        />
      </motion.button>

    </motion.div>
  );
}