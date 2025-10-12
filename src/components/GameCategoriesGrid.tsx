"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

interface GameCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  uploadCount: number;
  trending?: boolean;
}

// Static game data with icons and colors for known games
const GAME_DATA: Record<string, Omit<GameCategory, 'id' | 'uploadCount'>> = {
  "valorant": {
    name: "Valorant",
    icon: "/game-icons/valorant.png",
    color: "from-red-500 to-orange-500",
    trending: true
  },
  "fortnite": {
    name: "Fortnite",
    icon: "/game-icons/fortnite.png",
    color: "from-blue-500 to-purple-500"
  },
  "apex-legends": {
    name: "Apex Legends",
    icon: "/game-icons/apex.png",
    color: "from-yellow-500 to-red-500",
    trending: true
  },
  "cs2": {
    name: "CS2",
    icon: "/game-icons/cs2.png",
    color: "from-orange-500 to-yellow-500"
  },
  "overwatch": {
    name: "Overwatch 2",
    icon: "/game-icons/overwatch.png",
    color: "from-cyan-500 to-blue-500"
  },
  "league-of-legends": {
    name: "League of Legends",
    icon: "/game-icons/lol.png",
    color: "from-purple-500 to-pink-500"
  },
  "rocket-league": {
    name: "Rocket League",
    icon: "/game-icons/rocket-league.png",
    color: "from-blue-600 to-cyan-500"
  },
  "minecraft": {
    name: "Minecraft",
    icon: "/game-icons/minecraft.png",
    color: "from-green-500 to-emerald-500"
  }
};

// Default colors for unknown games
const DEFAULT_COLORS = [
  "from-cyan-500 to-blue-500",
  "from-purple-500 to-pink-500",
  "from-green-500 to-emerald-500",
  "from-yellow-500 to-orange-500",
  "from-red-500 to-pink-500",
  "from-blue-500 to-indigo-500",
  "from-indigo-500 to-purple-500",
  "from-pink-500 to-rose-500"
];

export default function GameCategoriesGrid() {
  const [games, setGames] = useState<GameCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchGameStats = async () => {
      try {
        // Fetch all images to count uploads per game
        const imagesQuery = collection(db, "images");
        const imagesSnapshot = await getDocs(imagesQuery);

        // Count uploads per game and track recent uploads (last 1 hour)
        const gameCounts: Record<string, number> = {};
        const recentUploads: Record<string, number> = {};
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago

        imagesSnapshot.forEach((doc) => {
          const data = doc.data();
          const game = data.game;
          const uploadedAt = data.uploadedAt?.toDate?.();

          if (game) {
            // Count total uploads
            gameCounts[game] = (gameCounts[game] || 0) + 1;

            // Count recent uploads (within last hour)
            if (uploadedAt && uploadedAt >= oneHourAgo) {
              recentUploads[game] = (recentUploads[game] || 0) + 1;
            }
          }
        });

        // Fetch configured games list and logos
        const configDoc = await getDoc(doc(db, 'config', 'settings'));
        const configuredGames: string[] = configDoc.exists() ? configDoc.data()?.games || [] : [];
        const gameLogos: Record<string, string> = configDoc.exists() ? configDoc.data()?.gameLogos || {} : {};

        // Create game objects with upload counts, sorted by count descending
        const gamesWithStats: GameCategory[] = Object.entries(gameCounts)
          .map(([gameId, uploadCount], index) => {
            const gameData = GAME_DATA[gameId.toLowerCase().replace(/\s+/g, '-')] || GAME_DATA[gameId];
            const recentCount = recentUploads[gameId] || 0;
            const isTrending = recentCount >= 5; // Trending if >= 5 uploads in last hour
            const customLogo = gameLogos[gameId];

            if (gameData) {
              // Known game with icon data, but override with custom logo if available
              return {
                id: gameId,
                ...gameData,
                icon: customLogo || gameData.icon,
                uploadCount,
                trending: isTrending
              };
            } else {
              // Unknown game - use configured name or gameId, with custom logo or fallback styling
              const gameName = configuredGames.find((g: string) => g.toLowerCase().replace(/\s+/g, '-') === gameId.toLowerCase().replace(/\s+/g, '-')) || gameId;
              const colorIndex = index % DEFAULT_COLORS.length;

              return {
                id: gameId,
                name: gameName,
                icon: customLogo || "", // Use custom logo or initials
                color: DEFAULT_COLORS[colorIndex],
                uploadCount,
                trending: isTrending
              };
            }
          })
          .sort((a, b) => b.uploadCount - a.uploadCount); // Sort by upload count descending

        setGames(gamesWithStats);
      } catch (error) {
        console.error('Error fetching game stats:', error);
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGameStats();
  }, []);

  const handleGameClick = (gameId: string) => {
    // Navigate to game-specific gallery
    router.push(`/gallery?game=${gameId}`);
  };

  if (loading) {
    return (
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Game Categories
            </h2>
            <div className="flex justify-center space-x-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-24 h-24 bg-white/10 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center py-20 px-6 overflow-hidden">
      {/* Optimized Background Particles - Reduced from 12 to 6 */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 6 + i * 2,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "linear"
            }}
            className="absolute w-1.5 h-1.5 bg-gradient-to-r from-blue-400/40 to-purple-400/40 rounded-full blur-sm"
            style={{
              left: `${20 + (i * 12)}%`,
              top: `${25 + (i * 10)}%`,
              willChange: 'transform, opacity'
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        {/* Enhanced Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Explore{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent font-black">
              Game Worlds
            </span>
          </motion.h2>
          <motion.p
            className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Discover amazing screenshots from your favorite games and join the community of gamers sharing their epic moments
          </motion.p>

          {/* Decorative Line */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            viewport={{ once: true }}
            className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-purple-600 mx-auto mt-8 rounded-full"
          />
        </motion.div>

        {/* Enhanced Games Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 50, scale: 0.8, rotateY: -15 }}
              whileInView={{ opacity: 1, y: 0, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.8, delay: index * 0.15, ease: "easeOut" }}
              viewport={{ once: true }}
              whileHover={{
                y: -8,
                scale: 1.05
              }}
              onClick={() => handleGameClick(game.id)}
              className="group relative cursor-pointer transform-gpu"
              style={{
                perspective: '1000px',
                willChange: 'transform'
              }}
            >
              {/* Game Card with Enhanced Effects */}
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl border border-white/10">
                {/* Custom Logo Background */}
                {game.icon && (
                  <img
                    src={game.icon}
                    alt={game.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}

                {/* Static Background Pattern - Removed animation for performance */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 2px, transparent 2px),
                                    radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px, 60px 60px'
                  }}
                />

                {/* Fallback Icon for games without custom logo */}
                {!game.icon && (
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                      className={`w-24 h-24 rounded-3xl bg-gradient-to-r ${game.color} flex items-center justify-center shadow-2xl border-4 border-white/30 relative overflow-hidden`}
                    >
                      {/* Inner Glow */}
                      <div className={`absolute inset-2 rounded-2xl bg-gradient-to-r ${game.color} opacity-50 blur-sm`}></div>

                      <span className="text-4xl font-black text-white drop-shadow-2xl relative z-10">
                        {game.name.split(' ')[0].charAt(0)}
                        {game.name.split(' ')[1]?.charAt(0) || ''}
                      </span>

                      {/* Icon Shine Effect */}
                      <motion.div
                        initial={{ x: '-100%', opacity: 0 }}
                        whileHover={{ x: '100%', opacity: [0, 0.8, 0] }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-3xl"
                      />
                    </motion.div>
                  </div>
                )}

                {/* Enhanced Content Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <motion.h3
                      className="text-white font-bold text-xl mb-2 truncate drop-shadow-lg"
                      whileHover={{ scale: 1.05 }}
                    >
                      {game.name}
                    </motion.h3>
                    <div className="flex items-center justify-between">
                      <motion.span
                        className="text-cyan-300 font-semibold text-sm bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm border border-cyan-300/30"
                        whileHover={{ scale: 1.05 }}
                      >
                        {game.uploadCount} {game.uploadCount === 1 ? 'upload' : 'uploads'}
                      </motion.span>
                      {game.trending && (
                        <motion.span
                          className="text-orange-400 font-bold flex items-center gap-1 bg-orange-500/20 px-3 py-1 rounded-full backdrop-blur-sm border border-orange-400/50"
                          whileHover={{ scale: 1.1 }}
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          🔥 Trending
                        </motion.span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Advanced Hover Effects */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className={`absolute inset-0 rounded-3xl border-2 shadow-2xl bg-gradient-to-r ${game.color} opacity-30 blur-xl`}
                />

                {/* Multi-layer Glow Effect */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ opacity: 1, scale: 1.2 }}
                  transition={{ duration: 0.6 }}
                  className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${game.color} opacity-10 blur-2xl`}
                />

                {/* Shine Effect */}
                <motion.div
                  initial={{ x: '-150%', opacity: 0 }}
                  whileHover={{ x: '150%', opacity: [0, 1, 0] }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none"
                />

                {/* 3D Depth Effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced View All Games Button */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{
              scale: 1.08,
              rotateX: 5,
              z: 20
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/global?view=explore')}
            className="group relative px-10 py-5 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 backdrop-blur-xl border border-white/20 text-white font-bold text-lg rounded-3xl hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-purple-500/20 hover:border-cyan-400/50 transition-all duration-500 shadow-2xl overflow-hidden"
            style={{ willChange: 'transform' }}
          >
            {/* Static Background Pattern */}
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage: `radial-gradient(circle at 30% 40%, rgba(255,255,255,0.2) 1px, transparent 1px),
                                radial-gradient(circle at 70% 60%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '30px 30px, 50px 50px'
              }}
            />

            <span className="flex items-center space-x-3 relative z-10">
              <span>Explore All Game Worlds</span>
              <motion.div
                whileHover={{ x: 8, rotate: 15 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                {/* Arrow Glow */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute inset-0 bg-cyan-400/50 blur-sm rounded-full"
                />
              </motion.div>
            </span>

            {/* Optimized Single Glow Effect */}
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/25 to-purple-500/25 blur-xl"
            />

            {/* Shine Effect */}
            <motion.div
              initial={{ x: '-100%', opacity: 0 }}
              whileHover={{ x: '100%', opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-3xl"
            />
          </motion.button>
        </motion.div>
      </div>

      {/* Optimized Floating Elements - Reduced complexity */}
      <motion.div
        animate={{
          y: [0, -15, 0]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 left-20 w-6 h-6 bg-gradient-to-r from-cyan-500/40 to-blue-500/40 rounded-2xl blur-sm opacity-60"
        style={{ willChange: 'transform' }}
      />

      <motion.div
        animate={{
          y: [0, 12, 0]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute top-40 right-32 w-5 h-5 bg-gradient-to-r from-purple-500/40 to-pink-500/40 rounded-full blur-sm opacity-50"
        style={{ willChange: 'transform' }}
      />

      <motion.div
        animate={{
          y: [0, -10, 0]
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute bottom-32 left-32 w-4 h-4 bg-gradient-to-r from-green-500/40 to-cyan-500/40 rounded-lg blur-sm opacity-55"
        style={{ willChange: 'transform' }}
      />
    </section>
  );
}