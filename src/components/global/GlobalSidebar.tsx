"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Map, TrendingUp, Heart, Trophy } from "lucide-react";

type ViewType = "explore" | "trending" | "liked" | "voted";

interface NavigationItem {
  id: ViewType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface GlobalSidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const navigationItems: NavigationItem[] = [
  {
    id: "explore",
    label: "Explore Game Worlds",
    description: "Discover all available games",
    icon: Map,
    color: "text-blue-400"
  },
  {
    id: "trending",
    label: "Trending This Week",
    description: "Most popular games this week",
    icon: TrendingUp,
    color: "text-orange-400"
  },
  {
    id: "liked",
    label: "Weekly Most Liked",
    description: "Top liked images this week",
    icon: Heart,
    color: "text-red-400"
  },
  {
    id: "voted",
    label: "Previous Weekly Voted",
    description: "Past weekly voting winners",
    icon: Trophy,
    color: "text-yellow-400"
  }
];

export default function GlobalSidebar({ activeView, onViewChange }: GlobalSidebarProps) {
  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="sticky top-20 ml-4 w-64 bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl z-20 h-[calc(100vh-6rem)]"
    >
      <div className="p-6 h-full flex flex-col">
        <nav className="flex-1 space-y-2 overflow-y-auto">
          {navigationItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <motion.button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-left transition-all duration-200 group ${
                  activeView === item.id
                    ? "bg-white/10 border border-white/20 text-white shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-white/5 hover:shadow-md"
                }`}
              >
                <IconComponent
                  className={`w-5 h-5 ${item.color} group-hover:scale-110 transition-transform duration-200`}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5 truncate">{item.description}</div>
                </div>
              </motion.button>
            );
          })}
        </nav>

        {/* Decorative bottom element */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex justify-center">
            <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}