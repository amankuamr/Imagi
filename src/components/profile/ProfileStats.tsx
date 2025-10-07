import { motion } from "framer-motion";
import { ImageIcon, Heart, Trophy } from "lucide-react";

interface ProfileStatsProps {
  totalImages: number;
  totalLikes: number;
}

export default function ProfileStats({ totalImages, totalLikes }: ProfileStatsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
    >
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
        <ImageIcon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
        <div className="text-2xl font-bold text-white">{totalImages}</div>
        <div className="text-gray-300">Images Uploaded</div>
      </div>
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
        <Heart className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <div className="text-2xl font-bold text-white">{totalLikes}</div>
        <div className="text-gray-300">Total Likes</div>
      </div>
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
        <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
        <div className="text-2xl font-bold text-white">0</div>
        <div className="text-gray-300">Achievements</div>
      </div>
    </motion.div>
  );
}