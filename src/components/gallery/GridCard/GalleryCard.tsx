"use client";
import { motion } from "framer-motion";
import { Heart, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import NextImage from "next/image";
import UserOverlay from "./UserOverlay";

interface GalleryItem {
  id: string;
  name: string;
  image: string;
  votes: number;
  genre: string;
  game: string;
  userId?: string;
}

interface UserData {
  id: string;
  username: string;
  email: string;
}

interface GalleryCardProps {
  item: GalleryItem;
  index: number;
  onCardClick: (item: GalleryItem) => void;
  onLike: (id: string) => void;
  onDislike: (id: string) => void;
  isLiked: boolean;
  isDisliked: boolean;
  currentUserId?: string;
  getUserData: (userId: string) => UserData;
}

export default function GalleryCard({
  item,
  index,
  onCardClick,
  onLike,
  onDislike,
  isLiked,
  isDisliked,
  currentUserId,
  getUserData
}: GalleryCardProps) {
  const userData = getUserData(item.userId || 'user1');

  return (
    <div className="relative group">
      {/* User Info Overlay */}
      <UserOverlay
        userData={userData}
      />

      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.02 }}
        onClick={() => onCardClick(item)}
        className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-300 cursor-pointer relative"
      >
        {/* Genre tag - top left */}
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
            {item.genre}
          </span>
        </div>

        {/* Like/Dislike buttons - top right */}
        <div className="absolute top-3 right-3 flex gap-2 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onLike(item.id);
            }}
            className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 border border-white/20"
            disabled={!currentUserId}
          >
            <Heart
              className={`h-4 w-4 ${
                isLiked
                  ? "fill-red-500 text-red-500"
                  : "text-white"
              }`}
            />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDislike(item.id);
            }}
            className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 border border-white/20"
            disabled={!currentUserId}
          >
            <ThumbsDown className={`h-4 w-4 ${isDisliked ? "text-red-500" : "text-white"}`} />
          </Button>
        </div>

        {/* Image */}
        <div className="aspect-square overflow-hidden relative">
          <NextImage
            src={item.image}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-white font-semibold text-sm mb-2 truncate">
            {item.name}
          </h3>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-xs font-medium">
              {item.game}
            </span>
            <span className="text-gray-400 text-xs">
              {item.votes.toLocaleString()} votes
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}