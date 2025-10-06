"use client";
import { useState, useEffect } from "react";
import GalleryHeroCarousel from "@/components/gallery/GalleryHeroCarousel";
import GalleryGridSection from "@/components/gallery/GalleryGridSection";
import { motion, AnimatePresence } from "framer-motion";
import GalleryPreloader from "@/components/loading/GalleryPreloader";

export default function GalleryPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isLoading && <GalleryPreloader />}
      </AnimatePresence>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.8 }}
        className="relative min-h-screen"
      >
        <div
          style={{
            backgroundImage: 'url(/images/herogallery.jpg)',
            backgroundSize: 'cover',
            filter: 'blur(6px)',
          }}
          className="fixed -inset-10 -z-10"
        ></div>
        <GalleryHeroCarousel />
        <GalleryGridSection />
      </motion.div>
    </>
  );
}
