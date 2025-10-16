"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import FilterDropdown from "./FilterDropdown";
import ImagePopup from "./ImagePopup";
import GalleryCard from "./GridCard/GalleryCard";
import { collection, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

interface GalleryItem {
  id: string;
  name: string;
  image: string;
  votes: number;
  genre: string;
  game: string;
  userId?: string;
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
  userId?: string;
}

interface UserData {
  id: string;
  username: string;
  email: string;
}

interface ConfigData {
  genres: string[];
  games: string[];
}

export default function GalleryGridSection() {
  const [images, setImages] = useState<FirebaseImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(8);
  const [selectedGame, setSelectedGame] = useState("All Games");
  const [selectedGenre, setSelectedGenre] = useState("All Genres");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [config, setConfig] = useState<ConfigData>({ genres: [], games: [] });
  const [users, setUsers] = useState<Record<string, UserData>>({});
  const { user } = useAuth();

  useEffect(() => {
    fetchImages();
    fetchConfig();
    fetchUsers();
  }, []);

  const fetchImages = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'images'));
      const imgs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirebaseImage[];

      // Filter out incomplete entries and duplicates
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filteredImages = imgs.filter((img: any) => {
        // Must have URL to be valid
        if (!img.url) return false;

        // Must have at least a title or be a valid upload
        if (!img.title && !img.name) return false;

        return true;
      });

      setImages(filteredImages);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const docRef = doc(db, 'config', 'settings');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setConfig(docSnap.data() as ConfigData);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersData: Record<string, UserData> = {};
      querySnapshot.docs.forEach(doc => {
        usersData[doc.id] = {
          id: doc.id,
          username: doc.data().username || 'Unknown User',
          email: doc.data().email || 'unknown@example.com'
        };
      });
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const getUserData = (userId: string): UserData => {
    console.log('Getting user data for:', userId, 'Available users:', Object.keys(users));

    // Handle admin uploads
    if (userId === 'admin') {
      return { id: 'admin', username: 'Admin', email: 'admin@imagi.com' };
    }

    const userData = users[userId];
    console.log('Found user data:', userData);
    return userData || { id: userId, username: 'Unknown User', email: 'unknown@example.com' };
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const visibleItems = filteredImages.slice(0, visibleCount).map((img: any, index: number) => ({
    id: img.id,
    name: img.title || img.name || `Screenshot ${index + 1}`,
    image: img.url || '',
    votes: img.likes || 0,
    genre: img.genre || 'General',
    game: img.game || 'Various',
    userId: img.userId,
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
              options={["All Games", ...config.games]}
              selected={selectedGame}
              onSelect={setSelectedGame}
              placeholder="Select Game"
            />
            <FilterDropdown
              options={["All Genres", ...config.genres]}
              selected={selectedGenre}
              onSelect={setSelectedGenre}
              placeholder="Select Genre"
            />
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          {visibleItems.map((item, index) => (
            <GalleryCard
              key={item.id}
              item={item}
              index={index}
              onCardClick={(selectedItem) => {
                setSelectedItem(selectedItem);
                setPopupOpen(true);
              }}
              onLike={toggleLike}
              onDislike={toggleDislike}
              isLiked={getIsLiked(item.id)}
              isDisliked={getIsDisliked(item.id)}
              currentUserId={user?.uid}
              getUserData={getUserData}
            />
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
