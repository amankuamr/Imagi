"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, limit, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ImagePopup from "@/components/ImagePopup";
import { ThumbsUp, ThumbsDown, User } from "lucide-react";

interface BestImage {
  id: string;
  title: string;
  url: string;
  likes: number;
  dislikes: number;
  uploadedAt: Date;
  rank: number;
  userId: string;
  posterName?: string; // Will be fetched
}

export default function BestImageOfTheWeek() {
  const [images, setImages] = useState<BestImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<BestImage | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    const fetchBestImages = async () => {
      try {
        // Fetch images ordered by likes (most liked first), limit to 3
        const q = query(collection(db, "images"), orderBy("likes", "desc"), limit(3));
        const querySnapshot = await getDocs(q);

        const imagesData = querySnapshot.docs.map((doc, index) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || 'Untitled',
            url: data.url || '',
            likes: data.likes || 0,
            dislikes: data.dislikes || 0,
            uploadedAt: data.uploadedAt?.toDate() || new Date(),
            rank: index + 1, // Assign ranks 1, 2, 3 based on position
            userId: data.userId || '',
            posterName: undefined // Will be fetched below
          };
        }) as BestImage[];

        // Fetch poster names for each image
        const imagesWithPosters = await Promise.all(
          imagesData.map(async (image) => {
            if (image.userId) {
              try {
                const userDoc = await getDoc(doc(db, 'users', image.userId));
                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  return {
                    ...image,
                    posterName: userData.username || userData.email?.split('@')[0] || 'Anonymous'
                  };
                }
              } catch (error) {
                console.warn('Error fetching user data for image:', image.id, error);
              }
            }
            return {
              ...image,
              posterName: 'Anonymous'
            };
          })
        );

        // Ensure we have at least 3 images for the podium, fill with empty if needed
        const podiumImages = [...imagesWithPosters];
        while (podiumImages.length < 3) {
          podiumImages.push({
            id: `placeholder-${podiumImages.length}`,
            title: 'Coming Soon',
            url: '/placeholder-image.jpg',
            likes: 0,
            dislikes: 0,
            uploadedAt: new Date(),
            rank: podiumImages.length + 1,
            userId: '',
            posterName: 'Anonymous'
          });
        }

        setImages(podiumImages.slice(0, 3));
      } catch (error) {
        console.error('Error fetching best images:', error);
        setImages([]);
      }
    };
    fetchBestImages();
  }, []);


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
        <div className="flex justify-center items-end gap-6 mb-16">
          {images.map((image, index) => {
            const isFirst = image.rank === 1;
            const isSecond = image.rank === 2;

            // Size variations: 1st place bigger, others smaller
            const containerWidth = isFirst ? 'w-80' : 'w-72';

            return (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: isFirst ? 1.08 : 1.03 }}
                onClick={() => {
                  setSelectedImage(image);
                  setIsPopupOpen(true);
                }}
                className={`relative group cursor-pointer hover-trigger ${
                  isFirst ? 'order-2' : isSecond ? 'order-1' : 'order-3'
                }`}
              >
                {/* Image Container */}
                <div className={`relative ${containerWidth} aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl`}>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="w-full h-full"
                  >
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-image.jpg';
                      }}
                    />
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

                {/* Image Info Below */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                  viewport={{ once: true }}
                  className={`${containerWidth} mt-4 text-center`}
                >
                  <h4 className="text-white font-semibold text-lg mb-2 truncate">
                    {image.title}
                  </h4>

                  <div className="flex items-center justify-center gap-6 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="w-4 h-4 text-green-400" />
                      <span className="font-medium">{image.likes}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ThumbsDown className="w-4 h-4 text-red-400" />
                      <span className="font-medium">{image.dislikes}</span>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mt-2 flex items-center justify-center gap-1">
                    <User className="w-3 h-3" />
                    <span>by <span className="text-blue-400 font-medium">{image.posterName || 'Anonymous'}</span></span>
                  </p>
                </motion.div>
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
