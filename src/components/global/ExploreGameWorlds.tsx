"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { TrendingUp, Users, Image as ImageIcon } from "lucide-react";

interface GameWorld {
  gameId: string;
  gameName: string;
  uploadCount: number;
  color: string;
  icon: string;
  sampleImage?: string;
  trending?: boolean;
}

export default function ExploreGameWorlds() {
  const [games, setGames] = useState<GameWorld[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAllGames = async () => {
      try {
        // Get all images to count uploads per game
        const imagesQuery = collection(db, "images");
        const imagesSnapshot = await getDocs(imagesQuery);

        // Count uploads per game
        const gameCounts: { [key: string]: number } = {};
        const gameImages: { [key: string]: string[] } = {};

        imagesSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const game = data.game || 'Unknown';

          gameCounts[game] = (gameCounts[game] || 0) + 1;

          // Store image URLs for each game
          if (!gameImages[game]) {
            gameImages[game] = [];
          }
          if (gameImages[game].length < 3) { // Keep only first 3 images
            gameImages[game].push(data.url);
          }
        });

        // Convert to game world data
        const gameWorlds: GameWorld[] = Object.entries(gameCounts)
          .map(([gameId, uploadCount]) => ({
            gameId,
            gameName: getGameDisplayName(gameId),
            uploadCount,
            color: getGameColor(gameId),
            icon: getGameIcon(gameId),
            sampleImage: gameImages[gameId]?.[0], // Use first image as sample
            trending: uploadCount >= 10 // Mark as trending if 10+ uploads
          }))
          .sort((a, b) => b.uploadCount - a.uploadCount);

        // If no real data, show mock data
        if (gameWorlds.length === 0) {
          const mockData: GameWorld[] = [
            {
              gameId: 'valorant',
              gameName: 'Valorant',
              uploadCount: 45,
              color: 'from-red-500 to-orange-500',
              icon: 'VL',
              sampleImage: '/images/hero.jpg',
              trending: true
            },
            {
              gameId: 'fortnite',
              gameName: 'Fortnite',
              uploadCount: 38,
              color: 'from-blue-500 to-purple-500',
              icon: 'FT',
              sampleImage: '/images/community.jpg',
              trending: true
            },
            {
              gameId: 'apex-legends',
              gameName: 'Apex Legends',
              uploadCount: 29,
              color: 'from-yellow-500 to-red-500',
              icon: 'AL',
              sampleImage: '/images/comdet.jpg',
              trending: false
            }
          ];
          setGames(mockData);
        } else {
          setGames(gameWorlds);
        }
      } catch (error) {
        console.error('Error fetching games:', error);
        // Fallback mock data
        const mockData: GameWorld[] = [
          {
            gameId: 'valorant',
            gameName: 'Valorant',
            uploadCount: 45,
            color: 'from-red-500 to-orange-500',
            icon: 'VL',
            sampleImage: '/images/hero.jpg',
            trending: true
          }
        ];
        setGames(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchAllGames();
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
    router.push(`/gallery?game=${gameId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading game worlds...</p>
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
            Explore{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent font-black">
              Game Worlds
            </span>
          </motion.h1>
          <motion.p
            className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Discover all the gaming universes available on our platform. Click on any game to explore its gallery.
          </motion.p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Games</p>
                <p className="text-white text-2xl font-bold">{games.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Screenshots</p>
                <p className="text-white text-2xl font-bold">
                  {games.reduce((sum, game) => sum + game.uploadCount, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Trending Games</p>
                <p className="text-white text-2xl font-bold">
                  {games.filter(game => game.trending).length}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Games Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
        >
          {games.map((game, index) => (
            <motion.div
              key={game.gameId}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => handleGameClick(game.gameId)}
              className="group relative cursor-pointer"
            >
              {/* Game Card */}
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl">
                {/* Background Image or Pattern */}
                {game.sampleImage ? (
                  <img
                    src={game.sampleImage}
                    alt={`${game.gameName} screenshot`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 2px, transparent 2px)`,
                      backgroundSize: '30px 30px'
                    }}
                  />
                )}

                {/* Content Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    {/* Game Name */}
                    <h3 className="text-white font-bold text-lg mb-2 truncate text-center drop-shadow-lg">
                      {game.gameName}
                    </h3>

                    {/* Stats */}
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <div className="flex items-center gap-1 text-cyan-300 font-semibold bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">
                        <ImageIcon className="w-4 h-4" />
                        <span>{game.uploadCount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trending Badge */}
                {game.trending && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
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
        </motion.div>

        {games.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No games found. Check back later!</p>
          </div>
        )}
      </div>
    </div>
  );
}