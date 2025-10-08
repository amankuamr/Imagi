"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Users, Image as ImageIcon, TrendingUp, Trophy } from "lucide-react";

interface StatsData {
  totalImages: number;
  totalUsers: number;
  weeklyUploads: number;
  totalLikes: number;
}

export default function CommunityStats() {
  const [stats, setStats] = useState<StatsData>({
    totalImages: 0,
    totalUsers: 0,
    weeklyUploads: 0,
    totalLikes: 0
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

        // Calculate total likes
        let totalLikes = 0;
        imagesSnapshot.docs.forEach(doc => {
          const data = doc.data();
          totalLikes += (data.likes || 0);
        });

        setStats({
          totalImages,
          totalUsers,
          weeklyUploads,
          totalLikes
        });
      } catch (error) {
        console.error('Error fetching community stats:', error);
        // Set fallback values
        setStats({
          totalImages: 0,
          totalUsers: 0,
          weeklyUploads: 0,
          totalLikes: 0
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
      color: "from-cyan-500 to-blue-500",
      bgColor: "from-cyan-500/10 to-blue-500/10"
    },
    {
      icon: Users,
      label: "Community Members",
      value: stats.totalUsers,
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-500/10 to-pink-500/10"
    },
    {
      icon: TrendingUp,
      label: "This Week",
      value: stats.weeklyUploads,
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-500/10 to-red-500/10"
    },
    {
      icon: Trophy,
      label: "Total Likes",
      value: stats.totalLikes,
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-500/10 to-emerald-500/10"
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
          backgroundImage: `url('/images/community.jpg')`,
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/3 w-40 h-40 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Community{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Stats
            </span>
          </motion.h2>
          <motion.p
            className="text-gray-400 text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            See how our gaming community is growing and creating amazing content
          </motion.p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {statItems.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group relative"
            >
              {/* Card */}
              <div className={`relative bg-gradient-to-br ${stat.bgColor} backdrop-blur-xl rounded-2xl p-6 border border-white/10 overflow-hidden`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg`}
                    >
                      <stat.icon className="w-6 h-6 text-white" />
                    </motion.div>

                    {/* Animated particles */}
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.3
                      }}
                      className={`w-2 h-2 rounded-full bg-gradient-to-r ${stat.color}`}
                    />
                  </div>

                  <div className="space-y-1">
                    <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                    <motion.p
                      className="text-2xl md:text-3xl font-bold text-white"
                      initial={{ scale: 0.8 }}
                      whileInView={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                      viewport={{ once: true }}
                    >
                      {stat.value.toLocaleString()}
                    </motion.p>
                  </div>
                </div>

                {/* Hover Glow */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${stat.color} opacity-10 blur-xl`}
                />

                {/* Shine Effect */}
                <motion.div
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-gray-400 text-sm">
            Join our growing community and share your gaming moments! 🎮
          </p>
        </motion.div>
      </div>
    </section>
  );
}