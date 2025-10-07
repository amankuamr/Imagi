"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import GalleryHeroCarousel from "@/components/gallery/GalleryHeroCarousel";
import GalleryGridSection from "@/components/gallery/GalleryGridSection";

export default function GalleryPage() {
  return (
    <div className="relative">
      {/* Background Image */}
      <motion.div
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="fixed inset-0 z-0"
      >
        <Image
          src="/images/herogallery.jpg"
          alt="Gallery Hero Background"
          fill
          className="object-cover"
          priority
          quality={90}
        />
      </motion.div>

      {/* Gradient Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="fixed inset-0 bg-black/50 z-5"
      />

      {/* Gallery Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="relative z-10"
      >
        <GalleryHeroCarousel />
        <GalleryGridSection />
      </motion.div>
    </div>
  );
}
