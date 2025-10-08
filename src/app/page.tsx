"use client";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import Hero from "@/components/Hero";
import GameCategoriesGrid from "@/components/GameCategoriesGrid";
import TrendingGamesThisWeek from "@/components/TrendingGamesThisWeek";
import RecentPlayThrough from "@/components/RecentPlayThrough";
import BestImageOfTheWeek from "@/components/BestImageOfTheWeek";
import WeeklyVoting from "@/components/WeeklyVoting";

export default function Home() {
  // Framer Motion fluid scroll setup
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Scroll-to-top functionality
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Parallax transform for background elements
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <main className="relative">
      {/* Enhanced Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 z-50 origin-left shadow-lg"
        style={{ scaleX }}
      />

      {/* Scroll-to-Top Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: showScrollTop ? 1 : 0,
          scale: showScrollTop ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 z-40 p-4 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-xl border border-white/20 rounded-full text-white shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <ChevronUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform duration-300" />
      </motion.button>

      {/* Parallax Background Elements */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ y: y1 }}
      >
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-gradient-to-r from-purple-500/8 to-pink-500/8 rounded-full blur-3xl" />
      </motion.div>

      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ y: y2 }}
      >
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-r from-green-500/6 to-cyan-500/6 rounded-full blur-2xl" />
        <div className="absolute top-3/4 right-1/3 w-28 h-28 bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-full blur-2xl" />
      </motion.div>

      {/* Fixed Hero Section */}
      <Hero />

      {/* Scrollable Content with Enhanced Fluid Transitions */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {/* Game Categories Grid */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 1,
            ease: [0.25, 0.46, 0.45, 0.94],
            staggerChildren: 0.1
          }}
          viewport={{ once: true, margin: "-150px" }}
        >
          <GameCategoriesGrid />
        </motion.div>

        {/* Trending Games This Week */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 1,
            delay: 0.2,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          viewport={{ once: true, margin: "-150px" }}
        >
          <TrendingGamesThisWeek />
        </motion.div>

        {/* Recent Play Through Section */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 1,
            delay: 0.1,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          viewport={{ once: true, margin: "-150px" }}
        >
          <RecentPlayThrough />
        </motion.div>

        {/* Best Image of the Week Section */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 1,
            delay: 0.1,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          viewport={{ once: true, margin: "-150px" }}
        >
          <BestImageOfTheWeek />
        </motion.div>

        {/* Weekly Voting Section */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 1,
            delay: 0.1,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          viewport={{ once: true, margin: "-150px" }}
        >
          <WeeklyVoting />
        </motion.div>
      </motion.div>
    </main>
  );
}
