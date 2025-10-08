"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import Hero from "@/components/Hero";
import GameCategoriesGrid from "@/components/GameCategoriesGrid";
import TrendingGamesThisWeek from "@/components/TrendingGamesThisWeek";
import QuickUploadCTA from "@/components/home/QuickUploadCTA";
import CommunityStats from "@/components/home/CommunityStats";
import RecentPlayThrough from "@/components/RecentPlayThrough";
import BestImageOfTheWeek from "@/components/BestImageOfTheWeek";
import WeeklyVoting from "@/components/WeeklyVoting";

export default function Home() {
  // Optimized scroll setup for better performance
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Scroll-based states with throttling
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showBackgroundBlur, setShowBackgroundBlur] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const windowHeight = window.innerHeight;
          const documentHeight = document.documentElement.scrollHeight;

          setShowScrollTop(scrollY > 500);

          // Show blur after hero section (assuming hero is ~100vh)
          // Hide blur near footer (last 200px)
          const heroHeight = windowHeight;
          const footerThreshold = documentHeight - windowHeight - 200;

          setShowBackgroundBlur(scrollY > heroHeight && scrollY < footerThreshold);

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Simplified parallax transforms
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -25]);

  return (
    <main className="relative">
      {/* Optimized Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 z-50 origin-left"
        style={{ scaleX, willChange: "transform" }}
      />

      {/* Optimized Scroll-to-Top Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: showScrollTop ? 1 : 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 z-40 p-4 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-xl border border-white/20 rounded-full text-white shadow-xl hover:shadow-cyan-500/25 transition-all duration-200 group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{ willChange: "transform, opacity" }}
      >
        <ChevronUp className="w-6 h-6 group-hover:-translate-y-0.5 transition-transform duration-200" />
      </motion.button>

      {/* Simplified Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-cyan-500/8 to-blue-500/8 rounded-full blur-2xl"
          style={{ y: y1, willChange: "transform" }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-gradient-to-r from-purple-500/6 to-pink-500/6 rounded-full blur-2xl"
          style={{ y: y2, willChange: "transform" }}
        />
      </div>

      {/* Sticky Background Blur Overlay */}
      <motion.div
        className="fixed inset-0 z-10 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: showBackgroundBlur ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{ willChange: "opacity" }}
      >
        <div className="absolute inset-0 bg-black/20 backdrop-blur-md" />
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
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            ease: "easeOut"
          }}
          viewport={{ once: true, margin: "-50px" }}
          style={{ willChange: "transform, opacity" }}
        >
          <GameCategoriesGrid />
        </motion.div>

        {/* Trending Games This Week */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.1,
            ease: "easeOut"
          }}
          viewport={{ once: true, margin: "-50px" }}
          style={{ willChange: "transform, opacity" }}
        >
          <TrendingGamesThisWeek />
        </motion.div>

        {/* Community Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.2,
            ease: "easeOut"
          }}
          viewport={{ once: true, margin: "-50px" }}
          style={{ willChange: "transform, opacity" }}
        >
          <CommunityStats />
        </motion.div>

        {/* Recent Play Through Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.1,
            ease: "easeOut"
          }}
          viewport={{ once: true, margin: "-50px" }}
          style={{ willChange: "transform, opacity" }}
        >
          <RecentPlayThrough />
        </motion.div>

        {/* Best Image of the Week Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 30 }}
          transition={{
            duration: 0.6,
            delay: 0.1,
            ease: "easeOut"
          }}
          viewport={{ once: true, margin: "-50px" }}
          style={{ willChange: "transform, opacity" }}
        >
          <BestImageOfTheWeek />
        </motion.div>

        {/* Weekly Voting Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.1,
            ease: "easeOut"
          }}
          viewport={{ once: true, margin: "-50px" }}
          style={{ willChange: "transform, opacity" }}
        >
          <WeeklyVoting />
        </motion.div>
      </motion.div>

      {/* Floating Quick Upload CTA */}
      <QuickUploadCTA />
    </main>
  );
}
