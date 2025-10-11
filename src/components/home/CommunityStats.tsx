"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Users, Image as ImageIcon, TrendingUp, Trophy, Heart, Target, Award, BarChart3 } from "lucide-react";

interface StatsData {
  totalImages: number;
  totalUsers: number;
  weeklyUploads: number;
  totalLikes: number;
  averageLikesPerImage: number;
  mostActiveGame: string;
  topUploader: string;
  growthRate: number;
}

export default function CommunityStats() {
  const [stats, setStats] = useState<StatsData>({
    totalImages: 0,
    totalUsers: 0,
    weeklyUploads: 0,
    totalLikes: 0,
    averageLikesPerImage: 0,
    mostActiveGame: '',
    topUploader: '',
    growthRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total images (approved images)
        const imagesQuery = query(collection(db, "images"));
        const imagesSnapshot = await getDocs(imagesQuery);
        const totalImages = imagesSnapshot.size;

        // Get total users
        const usersQuery = query(collection(db, "users"));
        const usersSnapshot = await getDocs(usersQuery);
        const totalUsers = usersSnapshot.size;

        // Get weekly uploads
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const weeklyQuery = query(
          collection(db, "images"),
          where("uploadedAt", ">=", oneWeekAgo)
        );
        const weeklySnapshot = await getDocs(weeklyQuery);
        const weeklyUploads = weeklySnapshot.size;

        // Calculate total likes and additional stats
        let totalLikes = 0;
        const gameCounts: Record<string, number> = {};
        const uploaderCounts: Record<string, number> = {};

        imagesSnapshot.docs.forEach(doc => {
          const data = doc.data();
          totalLikes += (data.likes || 0);

          // Count uploads per game
          if (data.game) {
            gameCounts[data.game] = (gameCounts[data.game] || 0) + 1;
          }

          // Count uploads per user
          if (data.uploadedBy) {
            uploaderCounts[data.uploadedBy] = (uploaderCounts[data.uploadedBy] || 0) + 1;
          }
        });

        // Calculate additional stats
        const averageLikesPerImage = totalImages > 0 ? Math.round((totalLikes / totalImages) * 10) / 10 : 0;
        const mostActiveGame = Object.entries(gameCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';
        const topUploader = Object.entries(uploaderCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

        // Calculate growth rate (simplified - weekly uploads vs total)
        const growthRate = totalImages > 0 ? Math.round((weeklyUploads / totalImages) * 100) : 0;

        setStats({
          totalImages,
          totalUsers,
          weeklyUploads,
          totalLikes,
          averageLikesPerImage,
          mostActiveGame,
          topUploader,
          growthRate
        });
      } catch (error) {
        console.error('Error fetching community stats:', error);
        // Set fallback values
        setStats({
          totalImages: 0,
          totalUsers: 0,
          weeklyUploads: 0,
          totalLikes: 0,
          averageLikesPerImage: 0,
          mostActiveGame: 'N/A',
          topUploader: 'N/A',
          growthRate: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statItems = [
    {
      icon: ImageIcon,
      label: "Total Images",
      value: stats.totalImages,
      subtitle: "Screenshots shared",
      color: "from-cyan-500 to-blue-500",
      bgColor: "from-cyan-500/10 to-blue-500/10",
      trend: "+12%"
    },
    {
      icon: Users,
      label: "Community Members",
      value: stats.totalUsers,
      subtitle: "Active gamers",
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-500/10 to-pink-500/10",
      trend: "+8%"
    },
    {
      icon: Heart,
      label: "Average Likes",
      value: stats.averageLikesPerImage,
      subtitle: "Per image",
      color: "from-red-500 to-pink-500",
      bgColor: "from-red-500/10 to-pink-500/10",
      trend: "+15%"
    },
    {
      icon: Target,
      label: "Most Active Game",
      value: stats.mostActiveGame,
      subtitle: "Top category",
      color: "from-orange-500 to-yellow-500",
      bgColor: "from-orange-500/10 to-yellow-500/10",
      trend: "Hot"
    },
    {
      icon: Award,
      label: "Top Uploader",
      value: stats.topUploader,
      subtitle: "Most active member",
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-500/10 to-emerald-500/10",
      trend: "⭐"
    },
    {
      icon: BarChart3,
      label: "Growth Rate",
      value: `${stats.growthRate}%`,
      subtitle: "Weekly activity",
      color: "from-blue-500 to-indigo-500",
      bgColor: "from-blue-500/10 to-indigo-500/10",
      trend: "↗️"
    },
    {
      icon: TrendingUp,
      label: "This Week",
      value: stats.weeklyUploads,
      subtitle: "New uploads",
      color: "from-indigo-500 to-purple-500",
      bgColor: "from-indigo-500/10 to-purple-500/10",
      trend: "+25%"
    },
    {
      icon: Trophy,
      label: "Total Likes",
      value: stats.totalLikes,
      subtitle: "Community love",
      color: "from-emerald-500 to-teal-500",
      bgColor: "from-emerald-500/10 to-teal-500/10",
      trend: "+18%"
    }
  ];

  if (loading) {
    return (
      <section className="relative py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-white/10 rounded animate-pulse mb-2"></div>
                    <div className="h-6 bg-white/10 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-16 px-6 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/images/comdet.jpg')`,
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Optimized Background Effects */}
      <div className="absolute inset-0">
        {/* Reduced floating orbs - only 2 instead of 3 */}
        <motion.div
          animate={{
            y: [0, -15, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-28 h-28 bg-gradient-to-r from-cyan-500/6 to-blue-500/6 rounded-full blur-2xl"
          style={{ willChange: 'transform' }}
        />
        <motion.div
          animate={{
            y: [0, 12, 0],
            scale: [1, 0.95, 1]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-2xl"
          style={{ willChange: 'transform' }}
        />

        {/* Simplified overlay for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/30"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Enhanced Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            viewport={{ once: true }}
            className="inline-block p-3 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-xl border border-white/20 mb-6"
            style={{ willChange: 'transform, opacity' }}
          >
            <BarChart3 className="w-8 h-8 text-cyan-400" />
          </motion.div>

          <motion.h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Community{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent font-black">
              Insights
            </span>
          </motion.h2>

          <motion.p
            className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Dive deep into our gaming community's growth, discover trending games, and see who's leading the pack in sharing epic moments
          </motion.p>

          {/* Decorative elements */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            viewport={{ once: true }}
            className="w-32 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 mx-auto rounded-full"
          />
        </motion.div>

        {/* Unified Stats Grid with Background Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl"
          style={{ willChange: 'transform, opacity' }}
        >
          {/* Grid Background with Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('/images/community.jpg')`,
            }}
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/60"></div>

          {/* Grid Lines */}
          <div className="absolute inset-0">
            {/* Vertical lines */}
            <div className="absolute left-1/4 top-0 bottom-0 w-px bg-white/30"></div>
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/30"></div>
            <div className="absolute left-3/4 top-0 bottom-0 w-px bg-white/30"></div>
            {/* Horizontal lines */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white/30"></div>
          </div>

          {/* Stats Content Grid */}
          <div className="relative z-10 grid grid-cols-4 grid-rows-2 gap-0 min-h-[400px] md:min-h-[500px]">
            {statItems.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1 + 0.5,
                  ease: "easeOut"
                }}
                viewport={{ once: true }}
                className="group relative p-4 md:p-6 flex flex-col justify-between hover:bg-black/20 transition-colors duration-300"
                style={{ willChange: 'transform, opacity' }}
              >
                {/* Trend Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 + 0.7 }}
                  viewport={{ once: true }}
                  className="absolute top-3 right-3 z-20"
                >
                  <span className={`text-xs font-bold px-2 py-1 rounded-full bg-black/60 text-white backdrop-blur-sm border border-white/30`}>
                    {stat.trend}
                  </span>
                </motion.div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-4">
                    <motion.div
                      whileHover={{ rotate: 180, scale: 1.1 }}
                      transition={{ duration: 0.4 }}
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg backdrop-blur-sm`}
                      style={{ willChange: 'transform' }}
                    >
                      <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </motion.div>

                    {/* Animated particles */}
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 0.8, 0.3]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        delay: index * 0.4,
                        ease: "easeInOut"
                      }}
                      className={`w-2 h-2 rounded-full bg-gradient-to-r ${stat.color} shadow-lg`}
                      style={{ willChange: 'transform, opacity' }}
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-white text-sm md:text-base font-bold leading-tight">{stat.label}</h3>
                    <p className="text-gray-300 text-xs md:text-sm opacity-90">{stat.subtitle}</p>
                    {stat.label === "Top Uploader" ? (
                      <div className="text-center">
                        <motion.p
                          className="text-lg md:text-xl lg:text-2xl font-bold text-white truncate"
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, delay: index * 0.1 + 0.8 }}
                          viewport={{ once: true }}
                          style={{ willChange: 'transform, opacity' }}
                          title={stat.value.toString()}
                        >
                          {stat.value.toString().split('@')[0] || stat.value.toString()}
                        </motion.p>
                        <motion.p
                          className="text-xs md:text-sm text-gray-300 truncate mt-1"
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          transition={{ duration: 0.5, delay: index * 0.1 + 0.9 }}
                          viewport={{ once: true }}
                          title={stat.value.toString()}
                        >
                          {stat.value.toString()}
                        </motion.p>
                      </div>
                    ) : (
                      <motion.p
                        className="text-2xl md:text-3xl lg:text-4xl font-black text-white truncate"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 + 0.8 }}
                        viewport={{ once: true }}
                        style={{ willChange: 'transform, opacity' }}
                        title={stat.value.toString()}
                      >
                        {typeof stat.value === 'number' && stat.value > 999
                          ? `${(stat.value / 1000).toFixed(1)}K`
                          : stat.value.toString()
                        }
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Hover effect overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 0.1 }}
                  transition={{ duration: 0.3 }}
                  className={`absolute inset-0 bg-gradient-to-r ${stat.color}`}
                  style={{ willChange: 'opacity' }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Optimized Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12"
          style={{ willChange: 'transform, opacity' }}
        >
          <div className="inline-block bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-3">
            <p className="text-white text-base font-semibold mb-1">
              🚀 Ready to be part of the action?
            </p>
            <p className="text-gray-300 text-sm">
              Join our thriving gaming community and start sharing your epic moments today!
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}