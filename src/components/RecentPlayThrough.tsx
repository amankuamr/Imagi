"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ImagePopup from "@/components/ImagePopup";

interface ImageData {
  id: string;
  title: string;
  url: string;
  public_id: string;
  uploadedAt: Date;
}

export default function RecentPlayThrough() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      const q = query(collection(db, "images"), orderBy("uploadedAt", "desc"), limit(6));
      const querySnapshot = await getDocs(q);
      const imagesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        uploadedAt: doc.data().uploadedAt.toDate()
      })) as ImageData[];
      setImages(imagesData);
    };
    fetchImages();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center py-20 px-6">
      {/* Blur Background with Transparency */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-md"></div>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Recent{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Play Through
            </span>
          </h2>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
            Your latest gaming adventures and achievements
          </p>
        </motion.div>

        {/* Gaming Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -15, rotateY: 5 }}
              onClick={() => {
                setSelectedImage(image);
                setIsPopupOpen(true);
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}

              className="group relative aspect-[4/5] rounded-3xl overflow-hidden cursor-pointer"
            >
              {/* Game Image */}
              <div className="absolute inset-0">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="w-full h-full"
                >
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </div>

              {/* Dark Overlay - appears on hover */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
              />

              {/* Status Badge - always visible */}
              <div className="absolute top-4 right-4 z-20">
                <motion.span
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                  className="px-4 py-2 rounded-full text-sm font-bold backdrop-blur-lg border-2 bg-green-500/20 text-green-300 border-green-400/50 shadow-lg shadow-green-500/20"
                >
                  New
                </motion.span>
              </div>

              {/* Game Title - appears on hover */}
              <motion.div
                animate={{
                  opacity: hoveredIndex === index ? 1 : 0,
                  y: hoveredIndex === index ? 0 : 20
                }}
                transition={{ duration: 0.4, delay: hoveredIndex === index ? 0.1 : 0 }}

                className="absolute bottom-6 left-6 right-6 z-20"
              >
                <h3 className="text-2xl md:text-3xl font-bold text-white drop-shadow-2xl">
                  {image.title}
                </h3>
              </motion.div>

              {/* Glowing Border Effect */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 rounded-3xl border-2 border-green-400/50 shadow-2xl shadow-green-500/20"
              />

              {/* Particle Effect on Hover */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileHover={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 pointer-events-none"
              >
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    whileHover={{ 
                      opacity: [0, 1, 0], 
                      scale: [0, 1, 0],
                      x: [0, Math.random() * 100 - 50],
                      y: [0, Math.random() * 100 - 50]
                    }}
                    transition={{ 
                      duration: 2, 
                      delay: i * 0.1,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                    className="absolute w-2 h-2 rounded-full bg-green-400 blur-sm"
                    style={{
                      left: `${20 + (i * 15)}%`,
                      top: `${30 + (i * 10)}%`,
                    }}
                  />
                ))}
              </motion.div>

              {/* Shine Effect */}
              <motion.div
                initial={{ x: '-100%', opacity: 0 }}
                whileHover={{ x: '100%', opacity: [0, 1, 0] }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none"
              />

              {/* 3D Depth Effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05, rotateX: 5 }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-10 py-5 bg-white/5 backdrop-blur-xl border border-white/20 text-white font-bold text-lg rounded-2xl hover:bg-white/10 hover:border-white/30 transition-all duration-500 shadow-2xl"
          >
            <span className="flex items-center space-x-3">
              <span>Explore All Games</span>
              <motion.svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                whileHover={{ x: 8, rotate: 15 }}
                transition={{ duration: 0.3 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </motion.svg>
            </span>
            
            {/* Button Glow Effect */}
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl"
            />
          </motion.button>
        </motion.div>
      </div>

      {/* Enhanced Floating Gaming Elements */}
      <motion.div
        animate={{
          y: [0, -25, 0],
          rotate: [0, 15, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 left-10 w-10 h-10 bg-gradient-to-r from-blue-500/40 to-purple-500/40 rounded-2xl blur-sm opacity-70"
      />

      <motion.div
        animate={{
          y: [0, 20, 0],
          rotate: [0, -10, 0],
          scale: [1, 0.8, 1]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3
        }}
        className="absolute bottom-20 right-10 w-8 h-8 bg-gradient-to-r from-pink-500/40 to-red-500/40 rounded-full blur-sm opacity-60"
      />

      <motion.div
        animate={{
          y: [0, -15, 0],
          rotate: [0, 8, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute top-1/2 right-20 w-6 h-6 bg-gradient-to-r from-green-500/40 to-blue-500/40 rounded-lg blur-sm opacity-50"
      />

      <ImagePopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        imageUrl={selectedImage?.url || '/placeholder-image.jpg'}
        name={selectedImage?.title || ''}
        resolutions={[
          { label: 'HD (1920x1080)', url: '/downloads/hd-image.jpg' },
          { label: '4K (3840x2160)', url: '/downloads/4k-image.jpg' },
          { label: 'Original', url: '/downloads/original-image.jpg' }
        ]}
      />
    </section>
  );
}
