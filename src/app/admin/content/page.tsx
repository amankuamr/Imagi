"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Edit, Eye, Search, Upload } from "lucide-react";

interface ImageData {
  id: string;
  url: string;
  game: string;
  genre: string;
  uploadedAt: Date;
  uploadedBy?: string; // Make optional
  userId?: string; // Add userId for fetching username
  likes: number;
  dislikes: number;
  likedBy: string[];
  dislikedBy: string[];
}

function HomeTab({ games }: { games: string[] }) {
  const [gameLogos, setGameLogos] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    fetchGameLogos();
  }, []);

  const fetchGameLogos = async () => {
    try {
      const configDoc = await getDoc(doc(db, 'config', 'settings'));
      if (configDoc.exists()) {
        const data = configDoc.data();
        setGameLogos(data.gameLogos || {});
      }
    } catch (error) {
      console.error('Error fetching game logos:', error);
    }
  };

  const handleLogoUpload = async (game: string, file: File) => {
    setUploading(game);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/logo-upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const { url } = await response.json();

      // Update config
      const configDoc = await getDoc(doc(db, 'config', 'settings'));
      const currentData = configDoc.exists() ? configDoc.data() : {};
      const updatedLogos = { ...currentData.gameLogos, [game]: url };

      await updateDoc(doc(db, 'config', 'settings'), {
        ...currentData,
        gameLogos: updatedLogos,
      });

      setGameLogos(updatedLogos);
      alert('Logo updated successfully');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload logo');
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Manage Game Logos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <div key={game} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">{game}</h3>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                {gameLogos[game] ? (
                  <Image src={gameLogos[game]} alt={game} width={64} height={64} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-gray-400">
                    {game.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={(el) => { fileInputRefs.current[game] = el; }}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload(game, file);
                  }}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRefs.current[game]?.click()}
                  variant="outline"
                  size="sm"
                  className="w-full bg-cyan-600/20 border-cyan-600/50 text-cyan-400 hover:bg-cyan-600/30"
                  disabled={uploading === game}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading === game ? 'Uploading...' : 'Change Logo'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminContent() {
  const [activeTab, setActiveTab] = useState<"products" | "home">("products");
  const [images, setImages] = useState<ImageData[]>([]);
  const [filteredImages, setFilteredImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [gameFilter, setGameFilter] = useState("all");
  const [genreFilter, setGenreFilter] = useState("all");
  const [editingImage, setEditingImage] = useState<ImageData | null>(null);
  const [editForm, setEditForm] = useState({ game: "", genre: "" });
  const [availableGames, setAvailableGames] = useState<string[]>([]);
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [showFullImage, setShowFullImage] = useState<string | null>(null);

  useEffect(() => {
    fetchImages();
    fetchConfig();
  }, []);

  const filterImages = useCallback(() => {
    let filtered = images;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(img =>
        (img.game || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (img.genre || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (img.uploadedBy || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Game filter
    if (gameFilter !== "all") {
      filtered = filtered.filter(img => img.game === gameFilter);
    }

    // Genre filter
    if (genreFilter !== "all") {
      filtered = filtered.filter(img => img.genre === genreFilter);
    }

    setFilteredImages(filtered);
  }, [images, searchQuery, gameFilter, genreFilter]);

  useEffect(() => {
    filterImages();
  }, [filterImages]);

  const fetchImages = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "images"));
      const imagesData = await Promise.all(
        querySnapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();

          // Fetch username if we have userId but no uploadedBy
          let uploadedBy = data.uploadedBy;
          if (!uploadedBy && data.userId) {
            try {
              const userDoc = await getDoc(doc(db, 'users', data.userId));
              if (userDoc.exists()) {
                uploadedBy = userDoc.data().username || userDoc.data().email || 'Unknown User';
              }
            } catch (error) {
              console.error('Error fetching user for image:', docSnap.id, error);
            }
          }

          return {
            id: docSnap.id,
            url: data.url || '',
            game: data.game || 'Unknown',
            genre: data.genre || 'Unknown',
            uploadedAt: data.uploadedAt?.toDate?.() || new Date(),
            uploadedBy: uploadedBy || 'Unknown User',
            userId: data.userId || '',
            likes: data.likes || 0,
            dislikes: data.dislikes || 0,
            likedBy: data.likedBy || [],
            dislikedBy: data.dislikedBy || [],
          } as ImageData;
        })
      );

      // Sort by newest first
      imagesData.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

      setImages(imagesData);
    } catch (error) {
      console.error('Error fetching images:', error);
      alert("Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const configDoc = await getDocs(collection(db, 'config'));
      if (!configDoc.empty) {
        const configData = configDoc.docs[0].data();
        setAvailableGames(configData.games || []);
        setAvailableGenres(configData.genres || []);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };


  const handleEdit = (image: ImageData) => {
    setEditingImage(image);
    setEditForm({ game: image.game, genre: image.genre });
  };

  const handleSaveEdit = async () => {
    if (!editingImage) return;

    try {
      await updateDoc(doc(db, "images", editingImage.id), {
        game: editForm.game,
        genre: editForm.genre
      });

      // Update local state
      setImages(images.map(img =>
        img.id === editingImage.id
          ? { ...img, game: editForm.game, genre: editForm.genre }
          : img
      ));

      setEditingImage(null);
      alert("Image updated successfully");
    } catch (error) {
      console.error('Error updating image:', error);
      alert("Failed to update image");
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      // Get image data first to know which service it uses
      const imageDoc = await getDoc(doc(db, "images", imageId));
      if (!imageDoc.exists()) {
        alert("Image not found");
        return;
      }

      const imageData = imageDoc.data();
      const path = imageData.path || imageData.public_id;

      if (!path) {
        alert("Cannot determine storage location for this image");
        return;
      }

      // Delete from storage service
      const deleteRes = await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: imageData.path,
          public_id: imageData.public_id,
          doc_id: imageId
        }),
      });

      if (!deleteRes.ok) {
        const errorData = await deleteRes.json();
        alert(`Storage deletion failed: ${errorData.details || errorData.error}`);
        return;
      }

      // Delete from Firestore
      await deleteDoc(doc(db, "images", imageId));

      // Update local state
      setImages(images.filter(img => img.id !== imageId));

      alert("Image deleted successfully from storage and database");
    } catch (error) {
      console.error('Error deleting image:', error);
      alert("Failed to delete image");
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-white">Loading content...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Content Management</h1>
        <div className="text-sm text-gray-400">
          Total Images: {images.length}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-800 p-1 rounded-lg border border-gray-700">
        <button
          onClick={() => setActiveTab("products")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "products"
              ? "bg-cyan-600 text-white"
              : "text-gray-400 hover:text-white hover:bg-gray-700"
          }`}
        >
          Edit/Delete Products
        </button>
        <button
          onClick={() => setActiveTab("home")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "home"
              ? "bg-cyan-600 text-white"
              : "text-gray-400 hover:text-white hover:bg-gray-700"
          }`}
        >
          Home
        </button>
      </div>

      {activeTab === "products" && (
        <>
          {/* Filters */}
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by game, genre, or uploader..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-700 text-white border-gray-600"
                />
              </div>

              <select
                value={gameFilter}
                onChange={(e) => setGameFilter(e.target.value)}
                className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
              >
                <option value="all">All Games</option>
                {availableGames.map(game => (
                  <option key={game} value={game}>{game}</option>
                ))}
              </select>

              <select
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
                className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
              >
                <option value="all">All Genres</option>
                {availableGenres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>

              <Button
                onClick={() => {
                  setSearchQuery("");
                  setGameFilter("all");
                  setGenreFilter("all");
                }}
                variant="outline"
                className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
              >
                Clear Filters
              </Button>
            </div>
          </div>

      {/* Full Image Modal */}
      {showFullImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowFullImage(null)}>
          <div className="max-w-4xl max-h-[80vh] relative">
            <Image
              src={showFullImage}
              alt="Full size"
              fill
              className="object-contain"
            />
            <button
              onClick={() => setShowFullImage(null)}
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 max-w-md w-full">
            <h3 className="text-lg font-bold text-white mb-4">Edit Image Details</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Game</label>
                <select
                  value={editForm.game}
                  onChange={(e) => setEditForm({...editForm, game: e.target.value})}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                >
                  {availableGames.map(game => (
                    <option key={game} value={game}>{game}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Genre</label>
                <select
                  value={editForm.genre}
                  onChange={(e) => setEditForm({...editForm, genre: e.target.value})}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                >
                  {availableGenres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveEdit} className="flex-1">
                  Save Changes
                </Button>
                <Button
                  onClick={() => setEditingImage(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

          {/* Images Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages.map((image) => (
              <div key={image.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                {/* Image */}
                <div className="aspect-square relative">
                  <Image
                    src={image.url}
                    alt={`${image.game} screenshot`}
                    fill
                    className="object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <Button
                      onClick={() => setShowFullImage(image.url)}
                      variant="secondary"
                      size="sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Full
                    </Button>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4">
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Game:</span>
                      <span className="text-sm font-medium text-white">{image.game}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Genre:</span>
                      <span className="text-sm font-medium text-white">{image.genre}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Uploaded:</span>
                      <span className="text-sm font-medium text-white">
                        {image.uploadedAt.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Uploader:</span>
                      <span className="text-sm font-medium text-white truncate ml-2">
                        {image.uploadedBy || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Votes:</span>
                      <span className="text-sm font-medium text-white">
                        👍 {image.likes || 0} / 👎 {image.dislikes || 0}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(image)}
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-blue-600/20 border-blue-600/50 text-blue-400 hover:bg-blue-600/30"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>

                    <Button
                      onClick={() => handleDelete(image.id)}
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-red-600/20 border-red-600/50 text-red-400 hover:bg-red-600/30"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredImages.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">
                {images.length === 0 ? "No images found." : "No images match your filters."}
              </p>
            </div>
          )}
        </>
      )}

      {activeTab === "home" && (
        <HomeTab games={availableGames} />
      )}
    </div>
  );
}