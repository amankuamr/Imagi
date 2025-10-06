"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import FilterDropdown from "./FilterDropdown";
import ImagePopup from "./ImagePopup";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

interface GalleryItem {
  id: string;
  name: string;
  image: string;
  votes: number;
  genre: string;
  game: string;
}

interface FirebaseImage {
  id: string;
  title?: string;
  url?: string;
  genre?: string;
  game?: string;
  likes?: number;
  dislikes?: number;
  likedBy?: string[];
  dislikedBy?: string[];
}

export default function GalleryGridSection() {
  const [images, setImages] = useState<FirebaseImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(8);
  const [selectedGame, setSelectedGame] = useState("All Games");
  const [selectedGenre, setSelectedGenre] = useState("All Genres");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'images'));
      const imgs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirebaseImage[];
      setImages(imgs);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = images.filter(img => {
    if (selectedGame !== 'All Games' && img.game !== selectedGame) return false;
    if (selectedGenre !== 'All Genres' && img.genre !== selectedGenre) return false;
    return true;
  });

  const toggleLike = async (id: string) => {
    if (!user) return;

    const img = images.find(i => i.id === id);
    if (!img) return;

    const likedBy = img.likedBy || [];
    const dislikedBy = img.dislikedBy || [];
    const isLiked = likedBy.includes(user.uid);
    const isDisliked = dislikedBy.includes(user.uid);

    try {
      if (isLiked) {
        // Unlike
        const newLikedBy = likedBy.filter(uid => uid !== user.uid);
        const newLikes = (img.likes || 0) - 1;
        await updateDoc(doc(db, 'images', id), { likedBy: newLikedBy, likes: newLikes });
        setImages(prev => prev.map(i => i.id === id ? { ...i, likedBy: newLikedBy, likes: newLikes } : i));
      } else {
        // Like
        const newLikedBy = [...likedBy, user.uid];
        const newLikes = (img.likes || 0) + 1;
        let newDislikedBy = dislikedBy;
        let newDislikes = img.dislikes || 0;
        if (isDisliked) {
          newDislikedBy = dislikedBy.filter(uid => uid !== user.uid);
          newDislikes -= 1;
        }
        await updateDoc(doc(db, 'images', id), { likedBy: newLikedBy, likes: newLikes, dislikedBy: newDislikedBy, dislikes: newDislikes });
        setImages(prev => prev.map(i => i.id === id ? { ...i, likedBy: newLikedBy, likes: newLikes, dislikedBy: newDislikedBy, dislikes: newDislikes } : i));
      }
    } catch (error) {
      console.error('Error updating vote:', error);
    }
  };

  const toggleDislike = async (id: string) => {
    if (!user) return;

    const img = images.find(i => i.id === id);
    if (!img) return;

    const likedBy = img.likedBy || [];
    const dislikedBy = img.dislikedBy || [];
    const isLiked = likedBy.includes(user.uid);
    const isDisliked = dislikedBy.includes(user.uid);

    try {
      if (isDisliked) {
        // Undislike
        const newDislikedBy = dislikedBy.filter(uid => uid !== user.uid);
        const newDislikes = (img.dislikes || 0) - 1;
        await updateDoc(doc(db, 'images', id), { dislikedBy: newDislikedBy, dislikes: newDislikes });
        setImages(prev => prev.map(i => i.id === id ? { ...i, dislikedBy: newDislikedBy, dislikes: newDislikes } : i));
      } else {
        // Dislike
        const newDislikedBy = [...dislikedBy, user.uid];
        const newDislikes = (img.dislikes || 0) + 1;
        let newLikedBy = likedBy;
        let newLikes = img.likes || 0;
        if (isLiked) {
          newLikedBy = likedBy.filter(uid => uid !== user.uid);
          newLikes -= 1;
        }
        await updateDoc(doc(db, 'images', id), { likedBy: newLikedBy, likes: newLikes, dislikedBy: newDislikedBy, dislikes: newDislikes });
        setImages(prev => prev.map(i => i.id === id ? { ...i, likedBy: newLikedBy, likes: newLikes, dislikedBy: newDislikedBy, dislikes: newDislikes } : i));
      }
    } catch (error) {
      console.error('Error updating vote:', error);
    }
  };

  const loadMore = () => {
    setVisibleCount(prev => prev + 16);
  };

  const visibleItems = filteredImages.slice(0, visibleCount).map((img, index) => ({
    id: img.id,
    name: img.title || `Screenshot ${index + 1}`,
    image: img.url || '',
    votes: img.likes || 0,
    genre: img.genre || 'Unknown',
    game: img.game || 'Unknown',
  }));

  const getIsLiked = (id: string) => {
    if (!user) return false;
    const img = images.find(i => i.id === id);
    return (img?.likedBy || []).includes(user.uid);
  };

  const getIsDisliked = (id: string) => {
    if (!user) return false;
    const img = images.find(i => i.id === id);
    return (img?.dislikedBy || []).includes(user.uid);
  };

  if (loading) {
    return <div className="text-center py-16 text-white">Loading gallery...</div>;
  }

  return (
    <section className="py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Collection and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex justify-between items-center mb-12"
        >
          <h2 className="text-3xl font-bold text-white">
            Collection
          </h2>

          <div className="flex gap-4">
            <FilterDropdown
              options={["All Games", "Cyberpunk 2077", "The Witcher 3", "Elden Ring", "GTA V", "Minecraft"]}
              selected={selectedGame}
              onSelect={setSelectedGame}
              placeholder="Select Game"
            />
            <FilterDropdown
              options={["All Genres", "Action", "RPG", "Adventure", "Strategy", "Simulation"]}
              selected={selectedGenre}
              onSelect={setSelectedGenre}
              placeholder="Select Genre"
            />
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          {visibleItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                setSelectedItem(item);
                setPopupOpen(true);
              }}
              className="group relative bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-300 cursor-pointer"
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
                    toggleLike(item.id);
                  }}
                  className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 border border-white/20"
                  disabled={!user}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      getIsLiked(item.id)
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
                    toggleDislike(item.id);
                  }}
                  className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 border border-white/20"
                  disabled={!user}
                >
                  <ThumbsDown className={`h-4 w-4 ${getIsDisliked(item.id) ? "text-red-500" : "text-white"}`} />
                </Button>
              </div>

              {/* Image */}
              <div className="aspect-square overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
          ))}
        </div>

        {/* Load More Button */}
        {visibleCount < filteredImages.length && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Button
              onClick={loadMore}
              variant="default"
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-8"
            >
              Load More
            </Button>
          </motion.div>
        )}

        {/* Image Popup */}
        <ImagePopup
          item={selectedItem}
          isOpen={popupOpen}
          onClose={() => setPopupOpen(false)}
          onLike={toggleLike}
          onDislike={toggleDislike}
          isLiked={selectedItem ? getIsLiked(selectedItem.id) : false}
          isDisliked={selectedItem ? getIsDisliked(selectedItem.id) : false}
        />
      </div>
    </section>
  );
}
