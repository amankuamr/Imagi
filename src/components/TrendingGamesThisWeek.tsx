"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { collection, query, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { TrendingUp, Users, Image as ImageIcon } from "lucide-react";

interface GameTrend {
  gameId: string;
  gameName: string;
  uploadCount: number;
  growthPercent: number;
  color: string;
  icon: string;
  sampleImage?: string; // URL of a sample image for this game
}

export default function TrendingGamesThisWeek() {
  const [trendingGames, setTrendingGames] = useState<GameTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTrendingGames = async () => {
      try {
        const now = new Date();

        // Calculate current week boundaries (Sunday to Saturday)
        const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - currentDay); // Go back to Sunday
        startOfWeek.setHours(0, 0, 0, 0); // Start of Sunday

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
        endOfWeek.setHours(23, 59, 59, 999); // End of Saturday

        // Get all images and filter client-side to avoid composite index requirements
        const allImagesQuery = query(collection(db, "images"));
        const allImagesSnapshot = await getDocs(allImagesQuery);

        const allImages = allImagesSnapshot.docs.map(doc => ({
          game: doc.data().game || 'Unknown',
          uploadedAt: doc.data().uploadedAt?.toDate?.() || new Date()
        }));

        // Filter for current week (Sunday to Saturday)
        const weeklyUploads = allImages.filter(img => {
          const uploadDate = img.uploadedAt;
          return uploadDate >= startOfWeek && uploadDate <= endOfWeek;
        });

        // Count uploads per game this week
        const gameCounts: { [key: string]: number } = {};
        weeklyUploads.forEach(upload => {
          gameCounts[upload.game] = (gameCounts[upload.game] || 0) + 1;
        });

        // Calculate trending games (current week only)
        const trendingDataPromises = Object.entries(gameCounts)
          .map(async ([gameId, weeklyCount]) => {

                // Get a sample image for this game (simpler query to avoid index requirements)
                let sampleImage: string | undefined;
                try {
                  // Get all images and filter client-side to avoid composite index requirements
                  const imagesQuery = query(collection(db, "images"));
                  const imagesSnapshot = await getDocs(imagesQuery);
    
                  // Find images for this game
                  const gameImages = imagesSnapshot.docs
                    .map(doc => {
                      const data = doc.data();
                      return {
                        id: doc.id,
                        game: data.game || 'Unknown',
                        uploadedAt: data.uploadedAt,
                        url: data.url
                      };
                    })
                    .filter(img => img.game === gameId)
                    .sort((a, b) => (b.uploadedAt?.toDate?.()?.getTime?.() || 0) - (a.uploadedAt?.toDate?.()?.getTime?.() || 0));
    
                  if (gameImages.length > 0) {
                    sampleImage = gameImages[0].url;
                  } else {
                    // Try requests collection if no approved images
                    const requestsQuery = query(collection(db, "requests"));
                    const requestsSnapshot = await getDocs(requestsQuery);
    
                    const gameRequests = requestsSnapshot.docs
                      .map(doc => {
                        const data = doc.data();
                        return {
                          id: doc.id,
                          game: data.game || 'Unknown',
                          createdAt: data.createdAt,
                          url: data.url
                        };
                      })
                      .filter(req => req.game === gameId)
                      .sort((a, b) => (b.createdAt?.toDate?.()?.getTime?.() || 0) - (a.createdAt?.toDate?.()?.getTime?.() || 0));
    
                    if (gameRequests.length > 0) {
                      sampleImage = gameRequests[0].url;
                    }
                  }
                } catch (error) {
                  console.warn(`Error fetching sample image for ${gameId}:`, error);
                }

            return {
              gameId,
              gameName: getGameDisplayName(gameId),
              uploadCount: weeklyCount,
              growthPercent: 0, // No growth calculation for weekly view
              color: getGameColor(gameId),
              icon: getGameIcon(gameId),
              sampleImage
            };
          });

        const trendingData = await Promise.all(trendingDataPromises);
        const filteredData = trendingData
          .filter(game => game.uploadCount > 0)
          .sort((a, b) => b.uploadCount - a.uploadCount)
          .slice(0, 6); // Top 6 trending games

        // If no real data, show mock data for demonstration
        if (filteredData.length === 0) {
          const mockData: GameTrend[] = [
            {
              gameId: 'valorant',
              gameName: 'Valorant',
              uploadCount: 45,
              growthPercent: 120,
              color: 'from-red-500 to-orange-500',
              icon: 'VL',
              sampleImage: undefined
            },
            {
              gameId: 'fortnite',
              gameName: 'Fortnite',
              uploadCount: 38,
              growthPercent: 85,
              color: 'from-blue-500 to-purple-500',
              icon: 'FT',
              sampleImage: undefined
            },
            {
              gameId: 'apex-legends',
              gameName: 'Apex Legends',
              uploadCount: 29,
              growthPercent: 65,
              color: 'from-yellow-500 to-red-500',
              icon: 'AL',
              sampleImage: undefined
            }
          ];
          setTrendingGames(mockData);
        } else {
          setTrendingGames(filteredData);
        }
      } catch (error) {
        console.error('Error fetching trending games:', error);
        setTrendingGames([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingGames();
  }, []);

  const getGameDisplayName = (gameId: string): string => {
    const gameNames: { [key: string]: string } = {
      'valorant': 'Valorant',
      'fortnite': 'Fortnite',
      'apex-legends': 'Apex Legends',
      'cs2': 'CS2',
      'overwatch': 'Overwatch 2',
      'league-of-legends': 'League of Legends',
      'rocket-league': 'Rocket League',
      'minecraft': 'Minecraft'
    };
    return gameNames[gameId] || gameId.charAt(0).toUpperCase() + gameId.slice(1);
  };

  const getGameColor = (gameId: string): string => {
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
    return colors[gameId] || 'from-gray-500 to-gray-600';
  };

  const getGameIcon = (gameId: string): string => {
    const icons: { [key: string]: string } = {
      'valorant': 'VL',
      'fortnite': 'FT',
      'apex-legends': 'AL',
      'cs2': 'CS',
      'overwatch': 'OW',
      'league-of-legends': 'LOL',
      'rocket-league': 'RL',
      'minecraft': 'MC'
    };
    return icons[gameId] || gameId.substring(0, 2).toUpperCase();
  };

  const handleGameClick = (gameId: string) => {
    router.push(`/gallery?game=${gameId}&sort=trending`);
  };

  if (loading) {
    return (
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trending This Week
            </h2>
            <div className="flex justify-center space-x-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-32 h-32 bg-white/10 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (trendingGames.length === 0) {
    return (
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Trending This Week
          </h2>
          <p className="text-gray-400 text-lg">
            No trending games this week. Be the first to upload!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center py-20 px-6 overflow-hidden">

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Trending{" "}
            <span className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-600 bg-clip-text text-transparent font-black">
              This Week
            </span>
          </motion.h2>
          <motion.p
            className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Discover the hottest games everyone&apos;s playing and uploading screenshots for this week
          </motion.p>

          {/* Decorative Line */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            viewport={{ once: true }}
            className="w-32 h-1 bg-gradient-to-r from-orange-400 to-red-600 mx-auto mt-8 rounded-full"
          />
        </motion.div>

        {/* Trending Games Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {trendingGames.map((game, index) => (
            <motion.div
              key={game.gameId}
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{
                y: -4,
                transition: { duration: 0.2 }
              }}
              onClick={() => handleGameClick(game.gameId)}
              className="group relative cursor-pointer"
            >
              {/* Game Card */}
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl border border-white/10">
                {/* Background Image or Pattern */}
                {game.sampleImage ? (
                  <div className="absolute inset-0">
                    <img
                      src={game.sampleImage}
                      alt={`${game.gameName} screenshot`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        console.warn(`Failed to load image for ${game.gameName}:`, game.sampleImage);
                        // Hide the broken image and show fallback
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    {/* Dark overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  </div>
                ) : (
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 2px, transparent 2px)`,
                      backgroundSize: '30px 30px'
                    }}
                  />
                )}

                {/* Game Icon Overlay (only shown when no image) */}
                {!game.sampleImage && (
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${game.color} flex items-center justify-center shadow-xl border-4 border-white/20`}
                    >
                      <span className="text-2xl font-black text-white drop-shadow-lg">
                        {game.icon}
                      </span>
                    </motion.div>
                  </div>
                )}

                {/* Clean Content Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    {/* Game Name */}
                    <h3 className="text-white font-bold text-lg mb-2 truncate text-center drop-shadow-lg">
                      {game.gameName}
                    </h3>

                    {/* Simple Stats */}
                    <div className="flex items-center justify-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-cyan-300 font-semibold">
                        <ImageIcon className="w-4 h-4" />
                        <span>{game.uploadCount}</span>
                      </div>

                    </div>
                  </div>
                </div>


                {/* Trending Badge */}
                {index < 3 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    viewport={{ once: true }}
                    className="absolute top-2 right-2 w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg border border-white z-10"
                  >
                    <span className="text-white font-bold text-xs">🔥</span>
                  </motion.div>
                )}

                {/* Subtle Shine Effect */}
                <motion.div
                  initial={{ x: '-150%', opacity: 0 }}
                  whileHover={{ x: '150%', opacity: [0, 0.3, 0] }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none"
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Trending Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/gallery?sort=trending')}
            className="group relative px-8 py-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-xl border border-white/20 text-white font-semibold rounded-2xl hover:bg-gradient-to-r hover:from-orange-500/30 hover:to-red-500/30 hover:border-orange-400/50 transition-all duration-300 shadow-2xl"
          >
            <span className="flex items-center space-x-2 relative z-10">
              <TrendingUp className="w-5 h-5" />
              <span>View All Trending</span>
            </span>

            {/* Button Glow */}
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/20 to-red-500/20 blur-xl"
            />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}