"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { collection, query, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Heart, TrendingUp, Award, ThumbsUp, Calendar, Users } from "lucide-react";
import ImagePopup from "@/components/ImagePopup";

interface LikedImage {
  id: string;
  title: string;
  url: string;
  likes: number;
  game: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export default function WeeklyMostLiked() {
  const [images, setImages] = useState<LikedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<LikedImage | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    const fetchWeeklyLikedImages = async () => {
      try {
        // Get images ordered by likes (top liked this week)
        const imagesQuery = query(
          collection(db, "images"),
          orderBy("likes", "desc"),
          limit(12)
        );

        const imagesSnapshot = await getDocs(imagesQuery);
        const likedImages: LikedImage[] = imagesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          uploadedAt: doc.data().uploadedAt?.toDate?.() || new Date()
        })) as LikedImage[];

        // If no real data, show mock data
        if (likedImages.length === 0) {
          const mockData: LikedImage[] = [
            {
              id: '1',
              title: 'Epic Valorant Clutch',
              url: '/images/hero.jpg',
              likes: 245,
              game: 'Valorant',
              uploadedBy: 'ProGamer123',
              uploadedAt: new Date()
            },
            {
              id: '2',
              title: 'Fortnite Victory Royale',
              url: '/images/community.jpg',
              likes: 189,
              game: 'Fortnite',
              uploadedBy: 'BuildMaster',
              uploadedAt: new Date()
            },
            {
              id: '3',
              title: 'Apex Legends Squad Wipe',
              url: '/images/comdet.jpg',
              likes: 156,
              game: 'Apex Legends',
              uploadedBy: 'WraithMain',
              uploadedAt: new Date()
            }
          ];
          setImages(mockData);
        } else {
          setImages(likedImages);
        }
      } catch (error) {
        console.error('Error fetching liked images:', error);
        // Fallback mock data
        const mockData: LikedImage[] = [
          {
            id: '1',
            title: 'Epic Valorant Clutch',
            url: '/images/hero.jpg',
            likes: 245,
            game: 'Valorant',
            uploadedBy: 'ProGamer123',
            uploadedAt: new Date()
          }
        ];
        setImages(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyLikedImages();
  }, []);

  const handleImageClick = (image: LikedImage) => {
    setSelectedImage(image);
    setIsPopupOpen(true);
  };

  const getGameColor = (game: string): string => {
    const colors: { [key: string]: string } = {
      'valorant': 'from-red-500 to-orange-500',
      'fortnite': 'from-blue-500 to-purple-500',
      'apex-legends': 'from-yellow-500 to-red-500',
      'cs2': 'from-orange-500 to-yellow-500',
      'overwatch': 'from-cyan-500 to-blue-500',
      'league-of-legends': 'from-purple-500 to-pink-500',
      'rocket-league': 'from-blue-600 to-cyan-500',
      'minecraft': 'from-green-500 to-emerald-500'
    };
    return colors[game.toLowerCase()] || 'from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading most liked images...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-pink-400 via-red-500 to-purple-600 bg-clip-text text-transparent font-black">
              Weekly Most Liked
            </span>
          </motion.h1>
          <motion.p
            className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            The most beloved gaming screenshots this week, ranked by community love
          </motion.p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-gradient-to-r from-pink-500/10 to-red-500/10 backdrop-blur-xl rounded-2xl p-6 border border-pink-400/20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-pink-300 text-sm font-medium">Total Likes</p>
                <p className="text-white text-2xl font-bold">
                  {images.reduce((sum, img) => sum + img.likes, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-2xl p-6 border border-purple-400/20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-purple-300 text-sm font-medium">Top Likes</p>
                <p className="text-white text-2xl font-bold">{images[0]?.likes || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 backdrop-blur-xl rounded-2xl p-6 border border-red-400/20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-red-300 text-sm font-medium">Images Shown</p>
                <p className="text-white text-2xl font-bold">{images.length}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Images Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => handleImageClick(image)}
              className="group relative cursor-pointer"
            >
              {/* Image Card */}
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                {/* Background Image */}
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />

                {/* Dark overlay for text */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  {/* Likes Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                    <Heart className="w-4 h-4 text-red-400 fill-red-400" />
                    <span className="text-white font-bold text-sm">{image.likes}</span>
                  </div>

                  {/* Rank Badge for Top 3 */}
                  {index < 3 && (
                    <div className="absolute top-3 left-3 w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                      <span className="text-white font-bold text-sm">#{index + 1}</span>
                    </div>
                  )}

                  {/* Title and Info */}
                  <div className="space-y-2">
                    <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 drop-shadow-lg">
                      {image.title}
                    </h3>

                    <div className="flex items-center justify-between text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getGameColor(image.game)} text-white`}>
                        {image.game}
                      </span>
                      <span className="text-gray-300 text-xs">
                        by {image.uploadedBy}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hover overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 bg-black/20 pointer-events-none"
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {images.length === 0 && (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No liked images found this week.</p>
          </div>
        )}

        {/* Image Popup */}
        {selectedImage && (
          <ImagePopup
            isOpen={isPopupOpen}
            onClose={() => setIsPopupOpen(false)}
            imageUrl={selectedImage.url}
            name={selectedImage.title}
            resolutions={[
              { label: 'HD (1920x1080)', url: '/downloads/hd-image.jpg' },
              { label: '4K (3840x2160)', url: '/downloads/4k-image.jpg' },
              { label: 'Original', url: '/downloads/original-image.jpg' }
            ]}
          />
        )}
      </div>
    </div>
  );
}