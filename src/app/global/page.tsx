"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import GlobalSidebar from "@/components/global/GlobalSidebar";
import ExploreGameWorlds from "@/components/global/ExploreGameWorlds";
import TrendingThisWeek from "@/components/global/TrendingThisWeek";
import WeeklyMostLiked from "@/components/global/WeeklyMostLiked";
import PreviousWeeklyVoted from "@/components/global/PreviousWeeklyVoted";

type ViewType = "explore" | "trending" | "liked" | "voted";

function GlobalPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeView, setActiveView] = useState<ViewType>("explore");

  useEffect(() => {
    const view = searchParams.get("view") as ViewType;
    if (view && ["explore", "trending", "liked", "voted"].includes(view)) {
      setActiveView(view);
    }
  }, [searchParams]);

  const handleViewChange = (view: ViewType) => {
    setActiveView(view);
    // Update URL without causing a page reload
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("view", view);
    router.replace(`/global?${newSearchParams.toString()}`, { scroll: false });
  };


  const renderActiveView = () => {
    switch (activeView) {
      case "explore":
        return <ExploreGameWorlds />;
      case "trending":
        return <TrendingThisWeek />;
      case "liked":
        return <WeeklyMostLiked />;
      case "voted":
        return <PreviousWeeklyVoted />;
      default:
        return <ExploreGameWorlds />;
    }
  };

  return (
    <div className="relative min-h-screen flex">
      {/* Same Background as Home Page */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/hero.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-5">
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-cyan-500/8 to-blue-500/8 rounded-full blur-2xl"
        />
        <motion.div
          animate={{
            y: [0, 15, 0],
            rotate: [0, -3, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-gradient-to-r from-purple-500/6 to-pink-500/6 rounded-full blur-2xl"
        />
      </div>

      {/* Left Sidebar Navigation */}
      <GlobalSidebar activeView={activeView} onViewChange={handleViewChange} />

      {/* Main Content Area */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex-1 pt-24"
      >
        <div className="relative z-10 pr-6">
          {renderActiveView()}
        </div>
      </motion.div>
    </div>
  );
}

export default function GlobalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <GlobalPageContent />
    </Suspense>
  );
}
