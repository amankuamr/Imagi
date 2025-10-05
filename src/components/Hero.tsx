"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="fixed inset-0 h-screen flex flex-col justify-center items-start text-left px-6 md:px-12 lg:px-20 z-0 overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <motion.div
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
        <Image
          src="/images/hero.jpg"
          alt="Hero Background"
          fill
          className="object-cover"
          priority
          quality={90}
        />
      </motion.div>

      {/* Gradient Overlay for better text readability */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80 z-10"
      />

      {/* Animated particles/dots overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 2, delay: 0.5 }}
        className="absolute inset-0 z-20"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px, 80px 80px',
        }}
      />

      {/* Content */}
      <div className="relative z-30 max-w-4xl">
        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-2xl leading-tight"
        >
          <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent font-serif italic tracking-wider">
            IMAGI
          </span>
          <br />
          <span className="text-3xl md:text-4xl lg:text-5xl font-light">
            Game Gallery Platform
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-gray-200 text-lg md:text-xl max-w-2xl leading-relaxed drop-shadow-lg mb-8"
        >
          Transform your gaming memories into stunning visual stories. Upload, organize, and showcase your favorite game screenshots.
        </motion.p>

        {/* Feature Highlights - Reduced to 3 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="flex flex-wrap gap-4 mb-10 text-sm md:text-base"
        >
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-white font-medium">Cloud Storage</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span className="text-white font-medium">Social Sharing</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
            <span className="text-white font-medium">HD Quality</span>
          </div>
        </motion.div>

        {/* Call to Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="flex flex-col sm:flex-row gap-4 mb-16"
        >
          <button className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-2xl">
            <span className="relative z-10">Start Your Gallery</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </button>

          <button className="group px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-full hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm">
            <span className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              <span>Watch Demo</span>
            </span>
          </button>
        </motion.div>
      </div>

      {/* Animated scroll indicator - moved to bottom right */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.8 }}
        className="absolute bottom-8 right-8"
      >
        <div className="flex flex-col items-center space-y-2">
          <span className="text-white/70 text-sm font-medium">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-1 h-3 bg-white/70 rounded-full mt-2"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Simplified Floating elements */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 left-20 w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-sm z-20 opacity-60"
      />

      <motion.div
        animate={{
          y: [0, 15, 0],
          rotate: [0, -3, 0]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute top-40 right-32 w-6 h-6 bg-gradient-to-r from-pink-400 to-red-400 rounded-full blur-sm z-20 opacity-50"
      />

      <motion.div
        animate={{
          y: [0, -10, 0],
          rotate: [0, 2, 0]
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute bottom-32 left-32 w-3 h-3 bg-gradient-to-r from-green-400 to-blue-400 rounded-full blur-sm z-20 opacity-70"
      />
    </section>
  );
}