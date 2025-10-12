"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { TrendingUp, Image as ImageIcon } from "lucide-react";
import NextImage from "next/image";

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
        // Get all images from the database
        const imagesQuery = query(collection(db, "images"));
        const imagesSnapshot = await getDocs(imagesQuery);

        // Count uploads per game
        const gameCounts: { [key: string]: number } = {};
        imagesSnapshot.docs.forEach(doc => {
          const game = doc.data().game || 'Unknown';
          gameCounts[game] = (gameCounts[game] || 0) + 1;
        });

        // Get latest image for each game
        const trendingDataPromises = Object.entries(gameCounts)
          .map(async ([gameId, uploadCount]) => {
            let latestImage: string | undefined;

            try {
              // Find the latest image for this game
              const gameImages = imagesSnapshot.docs
                .filter(doc => doc.data().game === gameId)
                .sort((a, b) => {
                  const aTime = a.data().uploadedAt?.toDate?.()?.getTime?.() || 0;
                  const bTime = b.data().uploadedAt?.toDate?.()?.getTime?.() || 0;
                  return bTime - aTime; // Most recent first
                });

              if (gameImages.length > 0) {
                latestImage = gameImages[0].data().url;
              }
            } catch (error) {
              console.warn(`Error fetching latest image for ${gameId}:`, error);
            }

            return {
              gameId,
              gameName: getGameDisplayName(gameId),
              uploadCount,
              growthPercent: 0,
              color: getGameColor(gameId),
              icon: getGameIcon(gameId),
              sampleImage: latestImage
            };
          });

        const trendingData = await Promise.all(trendingDataPromises);
        const filteredData = trendingData
          .filter(game => game.uploadCount > 0)
          .sort((a, b) => b.uploadCount - a.uploadCount)
          .slice(0, 6);

        // If no data, show mock data
        if (filteredData.length === 0) {
          const mockData: GameTrend[] = [
            {
              gameId: 'valorant',
              gameName: 'Valorant',
              uploadCount: 12,
              growthPercent: 0,
              color: 'from-red-500 to-orange-500',
              icon: 'VL',
              sampleImage: '/images/hero.jpg' // Use placeholder image
            },
            {
              gameId: 'fortnite',
              gameName: 'Fortnite',
              uploadCount: 8,
              growthPercent: 0,
              color: 'from-blue-500 to-purple-500',
              icon: 'FT',
              sampleImage: '/images/community.jpg' // Use placeholder image
            },
            {
              gameId: 'apex-legends',
              gameName: 'Apex Legends',
              uploadCount: 6,
              growthPercent: 0,
              color: 'from-yellow-500 to-red-500',
              icon: 'AL',
              sampleImage: '/images/comdet.jpg' // Use placeholder image
            }
          ];
          setTrendingGames(mockData);
        } else {
          setTrendingGames(filteredData);
        }
      } catch (error) {
        console.error('Error fetching trending games:', error);
        // Fallback to mock data on error
        const mockData: GameTrend[] = [
          {
            gameId: 'valorant',
            gameName: 'Valorant',
            uploadCount: 12,
            growthPercent: 0,
            color: 'from-red-500 to-orange-500',
            icon: 'VL',
            sampleImage: '/images/hero.jpg'
          },
          {
            gameId: 'fortnite',
            gameName: 'Fortnite',
            uploadCount: 8,
            growthPercent: 0,
            color: 'from-blue-500 to-purple-500',
            icon: 'FT',
            sampleImage: '/images/community.jpg'
          }
        ];
        setTrendingGames(mockData);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
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
              {/* Game Card - Full Image Preview */}
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
                {/* Full Card Background Image */}
                {game.sampleImage ? (
                  <NextImage
                    src={game.sampleImage}
                    alt={`${game.gameName} latest screenshot`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  /* Fallback gradient background when no image */
                  <div className={`w-full h-full bg-gradient-to-br ${game.color} flex items-center justify-center`}>
                    <span className="text-4xl font-black text-white drop-shadow-lg">
                      {game.icon}
                    </span>
                  </div>
                )}

                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  {/* Game Name */}
                  <h3 className="text-white font-bold text-lg mb-2 truncate drop-shadow-lg">
                    {game.gameName}
                  </h3>

                  {/* Stats */}
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1 text-cyan-300 font-semibold bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">
                      <ImageIcon className="w-4 h-4" />
                      <span>{game.uploadCount}</span>
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
                    className="absolute top-3 right-3 w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white z-10"
                  >
                    <span className="text-white font-bold text-sm">🔥</span>
                  </motion.div>
                )}

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
            onClick={() => router.push('/global?view=trending')}
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