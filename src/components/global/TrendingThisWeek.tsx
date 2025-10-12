"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { TrendingUp, Trophy, Award, Star, BarChart3, Calendar, Users } from "lucide-react";
import NextImage from "next/image";

interface TrendingGame {
  gameId: string;
  gameName: string;
  uploadCount: number;
  growthPercent: number;
  color: string;
  icon: string;
  sampleImage?: string;
  rank: number;
}

interface TrendingStats {
  totalGames: number;
  totalUploads: number;
  topGame: string;
  averageUploads: number;
}

export default function TrendingThisWeek() {
  const [trendingGames, setTrendingGames] = useState<TrendingGame[]>([]);
  const [stats, setStats] = useState<TrendingStats>({
    totalGames: 0,
    totalUploads: 0,
    topGame: '',
    averageUploads: 0
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTrendingData = async () => {
      try {
        // Get all images from the database
        const imagesQuery = query(collection(db, "images"));
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
          if (gameImages[game].length < 1) { // Keep only first image
            gameImages[game].push(data.url);
          }
        });

        // Convert to trending data and sort
        const trendingData: TrendingGame[] = Object.entries(gameCounts)
          .map(([gameId, uploadCount], index) => ({
            gameId,
            gameName: getGameDisplayName(gameId),
            uploadCount,
            growthPercent: Math.floor(Math.random() * 200) + 50, // Mock growth data
            color: getGameColor(gameId),
            icon: getGameIcon(gameId),
            sampleImage: gameImages[gameId]?.[0],
            rank: index + 1
          }))
          .sort((a, b) => b.uploadCount - a.uploadCount)
          .slice(0, 10); // Top 10

        // Calculate stats
        const totalUploads = trendingData.reduce((sum, game) => sum + game.uploadCount, 0);
        const statsData: TrendingStats = {
          totalGames: trendingData.length,
          totalUploads,
          topGame: trendingData[0]?.gameName || '',
          averageUploads: Math.round(totalUploads / trendingData.length)
        };

        // If no real data, show mock data
        if (trendingData.length === 0) {
          const mockData: TrendingGame[] = [
            {
              gameId: 'valorant',
              gameName: 'Valorant',
              uploadCount: 45,
              growthPercent: 120,
              color: 'from-red-500 to-orange-500',
              icon: 'VL',
              sampleImage: '/images/hero.jpg',
              rank: 1
            },
            {
              gameId: 'fortnite',
              gameName: 'Fortnite',
              uploadCount: 38,
              growthPercent: 85,
              color: 'from-blue-500 to-purple-500',
              icon: 'FT',
              sampleImage: '/images/community.jpg',
              rank: 2
            },
            {
              gameId: 'apex-legends',
              gameName: 'Apex Legends',
              uploadCount: 29,
              growthPercent: 65,
              color: 'from-yellow-500 to-red-500',
              icon: 'AL',
              sampleImage: '/images/comdet.jpg',
              rank: 3
            }
          ];
          setTrendingGames(mockData);
          setStats({
            totalGames: 3,
            totalUploads: 112,
            topGame: 'Valorant',
            averageUploads: 37
          });
        } else {
          setTrendingGames(trendingData);
          setStats(statsData);
        }
      } catch (error) {
        console.error('Error fetching trending data:', error);
        // Fallback mock data
        const mockData: TrendingGame[] = [
          {
            gameId: 'valorant',
            gameName: 'Valorant',
            uploadCount: 45,
            growthPercent: 120,
            color: 'from-red-500 to-orange-500',
            icon: 'VL',
            sampleImage: '/images/hero.jpg',
            rank: 1
          }
        ];
        setTrendingGames(mockData);
        setStats({
          totalGames: 1,
          totalUploads: 45,
          topGame: 'Valorant',
          averageUploads: 45
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingData();
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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Award className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Star className="w-6 h-6 text-orange-400" />;
      default:
        return <span className="text-2xl font-bold text-gray-400">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-500/20 to-yellow-600/20 border-yellow-400/30';
      case 2:
        return 'from-gray-500/20 to-gray-600/20 border-gray-400/30';
      case 3:
        return 'from-orange-500/20 to-orange-600/20 border-orange-400/30';
      default:
        return 'from-white/5 to-white/10 border-white/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading trending data...</p>
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
            <span className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-600 bg-clip-text text-transparent font-black">
              Trending This Week
            </span>
          </motion.h1>
          <motion.p
            className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Detailed analytics and rankings of the most popular games this week
          </motion.p>
        </motion.div>

        {/* Stats Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-cyan-300 text-sm font-medium">Total Games</p>
                <p className="text-white text-2xl font-bold">{stats.totalGames}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-xl rounded-2xl p-6 border border-green-400/20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-green-300 text-sm font-medium">Total Uploads</p>
                <p className="text-white text-2xl font-bold">{stats.totalUploads}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-2xl p-6 border border-purple-400/20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-purple-300 text-sm font-medium">Top Game</p>
                <p className="text-white text-lg font-bold truncate">{stats.topGame}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-xl rounded-2xl p-6 border border-orange-400/20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-orange-300 text-sm font-medium">Avg Uploads</p>
                <p className="text-white text-2xl font-bold">{stats.averageUploads}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trending Leaderboard */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden"
        >
          <div className="p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-cyan-400" />
              Weekly Rankings
            </h2>

            <div className="space-y-4">
              {trendingGames.map((game, index) => (
                <motion.div
                  key={game.gameId}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  onClick={() => handleGameClick(game.gameId)}
                  className={`relative p-4 md:p-6 rounded-2xl border backdrop-blur-sm cursor-pointer transition-all duration-300 hover:scale-[1.02] ${getRankColor(game.rank)}`}
                >
                  <div className="flex items-center space-x-4 md:space-x-6">
                    {/* Rank */}
                    <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
                      {getRankIcon(game.rank)}
                    </div>

                    {/* Game Image/Icon */}
                    <div className="flex-shrink-0">
                      {game.sampleImage ? (
                        <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden border border-white/20">
                          <NextImage
                            src={game.sampleImage}
                            alt={game.gameName}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl bg-gradient-to-r ${game.color} flex items-center justify-center border border-white/20`}>
                          <span className="text-lg md:text-xl font-black text-white">
                            {game.icon}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Game Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-lg md:text-xl truncate mb-1">
                        {game.gameName}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-300">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          {game.uploadCount} uploads
                        </span>
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          game.growthPercent > 100 ? 'bg-green-500/20 text-green-300' :
                          game.growthPercent > 50 ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          +{game.growthPercent}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="hidden md:block flex-shrink-0 w-32">
                      <div className="bg-white/10 rounded-full h-2 mb-1">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(game.uploadCount / stats.totalUploads) * 100}%` }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                          className={`h-2 rounded-full bg-gradient-to-r ${game.color}`}
                        />
                      </div>
                      <p className="text-xs text-gray-400 text-center">
                        {Math.round((game.uploadCount / stats.totalUploads) * 100)}%
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
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
              <span>Explore All Trending Games</span>
            </span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}