import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { ImageIcon, Heart } from "lucide-react";

interface UserImage {
  id: string;
  title: string;
  url: string;
  uploadedAt: Date;
  likes: number;
}

interface ProfileGalleryProps {
  userImages: UserImage[];
}

export default function ProfileGallery({ userImages }: ProfileGalleryProps) {
  const router = useRouter();

  return (
    <div className="max-w-6xl mx-auto px-6 pb-20">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold text-white mb-8"
      >
        Your Gallery
      </motion.h2>

      {userImages.length === 0 ? (
        <div className="text-center py-20">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No images yet</h3>
          <p className="text-gray-400 mb-6">Start sharing your gaming moments!</p>
          <button
            onClick={() => router.push('/upload')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Upload First Image
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer border border-white/20 hover:border-white/40 transition-all"
            >
              <Image
                src={image.url}
                alt={image.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                quality={100}
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="font-semibold text-sm mb-1 truncate">{image.title}</h3>
                <div className="flex items-center justify-between text-xs text-gray-300">
                  <span>{image.uploadedAt.toLocaleDateString()}</span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {image.likes || 0}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}