"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ImagePopup from "@/components/ImagePopup";

interface BestImage {
  id: string;
  title: string;
  imageUrl: string;
  rank: number;
  createdAt: Date;
}

export default function BestImageOfTheWeek() {
  const [images, setImages] = useState<BestImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<BestImage | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    const fetchBestImages = async () => {
      const q = query(collection(db, "bestImages"), orderBy("rank"));
      const querySnapshot = await getDocs(q);
      const imagesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })) as BestImage[];
      setImages(imagesData.slice(0, 3)); // Ensure only top 3
    };
    fetchBestImages();
  }, []);

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return "from-yellow-400 to-yellow-600";
      case 2: return "from-gray-300 to-gray-500";
      case 3: return "from-orange-400 to-orange-600";
      default: return "from-blue-400 to-blue-600";
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return "🏅";
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center py-20 px-6">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30 backdrop-blur-sm"></div>
      
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
            Best Image of the{" "}
            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Week
            </span>
          </h2>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
            Celebrating the most stunning gaming screenshots from our community
          </p>
        </motion.div>

        {/* Podium Layout */}
        <div className="flex justify-center items-end gap-8 mb-16">
          {images.map((image, index) => {
            const isFirst = image.rank === 1;
            const isSecond = image.rank === 2;
            const isThird = image.rank === 3;
            
            return (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.05 }}
                onClick={() => {
                  setSelectedImage(image);
                  setIsPopupOpen(true);
                }}
                className={`relative group cursor-pointer ${
                  isFirst ? 'order-2' : isSecond ? 'order-1' : 'order-3'
                }`}
              >
                {/* Podium Base */}
                <div className={`w-80 h-${isFirst ? '96' : isSecond ? '80' : '72'} bg-gradient-to-t ${getRankColor(image.rank)} rounded-t-3xl mb-4 shadow-2xl`}>
                  <div className="w-full h-full bg-black/20 rounded-t-3xl backdrop-blur-sm"></div>
                </div>

                {/* Image Container */}
                <div className="relative w-80 aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="w-full h-full"
                  >
                    <div className="w-full h-full bg-gradient-to-br from-purple-600/30 to-pink-600/30 flex items-center justify-center">
                      <span className="text-white/30 text-lg font-medium">Best Image</span>
                    </div>
                  </motion.div>

                  {/* Rank Badge */}
                  <div className="absolute top-4 right-4 z-20">
                    <motion.div
                      initial={{ scale: 1 }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                      className={`px-4 py-2 rounded-full text-2xl backdrop-blur-lg border-2 shadow-lg ${
                        image.rank === 1 ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50 shadow-yellow-500/20' :
                        image.rank === 2 ? 'bg-gray-500/20 text-gray-300 border-gray-400/50 shadow-gray-500/20' :
                        'bg-orange-500/20 text-orange-300 border-orange-400/50 shadow-orange-500/20'
                      }`}
                    >
                      {getRankIcon(image.rank)}
                    </motion.div>
                  </div>

                  {/* Title Overlay */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute bottom-6 left-6 right-6 z-20"
                  >
                    <h3 className="text-xl md:text-2xl font-bold text-white drop-shadow-2xl">
                      {image.title}
                    </h3>
                    <p className="text-white/80 text-sm mt-1">
                      #{image.rank} Place
                    </p>
                  </motion.div>

                  {/* Glow Effect */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className={`absolute inset-0 rounded-3xl border-2 shadow-2xl ${
                      image.rank === 1 ? 'border-yellow-400/50 shadow-yellow-500/20' :
                      image.rank === 2 ? 'border-gray-400/50 shadow-gray-500/20' :
                      'border-orange-400/50 shadow-orange-500/20'
                    }`}
                  />

                  {/* Shine Effect */}
                  <motion.div
                    initial={{ x: '-100%', opacity: 0 }}
                    whileHover={{ x: '100%', opacity: [0, 1, 0] }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* View Gallery Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-10 py-5 bg-white/5 backdrop-blur-xl border border-white/20 text-white font-bold text-lg rounded-2xl hover:bg-white/10 hover:border-white/30 transition-all duration-500 shadow-2xl"
          >
            <span className="flex items-center space-x-3">
              <span>View Full Gallery</span>
              <motion.svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                whileHover={{ x: 8 }}
                transition={{ duration: 0.3 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </motion.svg>
            </span>
            
            {/* Button Glow */}
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 blur-xl"
            />
          </motion.button>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, 0]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 right-20 w-8 h-8 bg-gradient-to-r from-yellow-500/40 to-orange-500/40 rounded-2xl blur-sm opacity-60"
      />

      <ImagePopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        imageUrl={selectedImage?.imageUrl || '/placeholder-image.jpg'}
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
