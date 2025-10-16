"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { collection, getDocs, doc, updateDoc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

interface ImageData {
  id: string;
  title?: string;
  genre?: string;
  game?: string;
  url?: string;
  path?: string; // GitHub file path
  public_id?: string; // Legacy Cloudinary support
  uploadedAt?: Timestamp;
  uploadedBy?: string; // Uploader email/name
  userId?: string; // Uploader user ID
}

interface ConfigData {
  genres: string[];
  games: string[];
}

export default function AdminPage() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadGenre, setUploadGenre] = useState('');
  const [uploadGame, setUploadGame] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadService, setUploadService] = useState<'github' | 'cloudinary'>('github');
  const [editing, setEditing] = useState<ImageData | null>(null);
  const [editName, setEditName] = useState('');
  const [editGenre, setEditGenre] = useState('');
  const [editGame, setEditGame] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [games, setGames] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchImages();
    fetchConfig();
  }, []);

  const fetchImages = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'images'));
      const imgs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter out entries without required data and remove obvious duplicates
      const seenIds = new Set();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const uniqueImages = imgs.filter((img: any) => {
        // Skip entries without URLs or titles
        if (!img.url || !img.title) return false;

        // Remove duplicates by ID
        if (seenIds.has(img.id)) return false;
        seenIds.add(img.id);

        return true;
      });

      setImages(uniqueImages);
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
        const data = docSnap.data() as ConfigData;
        setGenres(data.genres);
        setGames(data.games);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadName || !uploadGenre || !uploadGame || !user) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', uploadFile);
      formData.append('name', uploadName);
      formData.append('genre', uploadGenre);
      formData.append('game', uploadGame);
      formData.append('userId', user.uid);
      formData.append('userEmail', user.email || '');
      formData.append('service', uploadService); // Add service selection

      // Choose API endpoint based on service
      const apiEndpoint = uploadService === 'github' ? '/api/github-upload' : '/api/admin-upload';

      const res = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        alert(`Image uploaded successfully to ${uploadService === 'github' ? 'GitHub' : 'Cloudinary'}!`);
        setUploadName('');
        setUploadGenre('');
        setUploadGame('');
        setUploadFile(null);
        fetchImages(); // Refresh list
      } else {
        const errorData = await res.json();
        alert(`Upload failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const startEdit = (img: ImageData) => {
    setEditing(img);
    setEditName(img.title || '');
    setEditGenre(img.genre || '');
    setEditGame(img.game || '');
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    try {
      await updateDoc(doc(db, 'images', editing.id), {
        title: editName,
        genre: editGenre,
        game: editGame,
      });
      alert('Image updated successfully!');
      setEditing(null);
      fetchImages();
    } catch {
      alert('Error updating image');
    }
  };

  const handleDelete = async (path: string, doc_id: string) => {
    console.log('Admin panel delete called with:', { path, doc_id });

    if (!confirm('Are you sure you want to delete this image? This will remove it from both the gallery and GitHub repository.')) return;

    try {
      console.log('Sending delete request to API...');
      const res = await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, doc_id }),
      });

      console.log('Delete API response status:', res.status);

      if (res.ok) {
        alert('Image deleted successfully from GitHub and gallery!');
        fetchImages(); // Refresh list
      } else {
        const errorData = await res.json();
        alert(`Delete failed: ${errorData.details || errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error deleting image');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-white mb-6">Add/Edit Products</h1>
      
      {/* Upload Form */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-8 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-white">Upload New Image</h2>
        <form onSubmit={handleUpload}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Image Name</label>
              <input
                type="text"
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                placeholder="Enter image name"
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Genre</label>
              <select
                value={uploadGenre}
                onChange={(e) => setUploadGenre(e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Genre</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Game</label>
              <select
                value={uploadGame}
                onChange={(e) => setUploadGame(e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Game</option>
                {games.map((game) => (
                  <option key={game} value={game}>{game}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Upload Service</label>
              <select
                value={uploadService}
                onChange={(e) => setUploadService(e.target.value as 'github' | 'cloudinary')}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="github">GitHub LFS (Free - 100GB)</option>
                <option value="cloudinary">Cloudinary (Paid)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Image File</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="w-full md:w-auto bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-600 transition-colors"
          >
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
        </form>
      </div>

      {/* Edit Form */}
      {editing && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-white">Edit Image</h2>
          <form onSubmit={handleEdit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Image Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Genre</label>
                <select
                  value={editGenre}
                  onChange={(e) => setEditGenre(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {genres.map((genre) => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Game</label>
                <select
                  value={editGame}
                  onChange={(e) => setEditGame(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {games.map((game) => (
                    <option key={game} value={game}>{game}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 transition-colors"
              >
                Update
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="bg-gray-600 text-white py-2 px-6 rounded-md hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Images List */}
      <h2 className="text-2xl font-semibold mb-4 text-white">Uploaded Images</h2>
      {loading ? (
        <p className="text-gray-400">Loading images...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((img) => (
            <div key={img.id} className="bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-700 relative">
              {img.url && <Image src={img.url} alt={img.title || ''} fill className="object-cover" />}
              <div className="p-4">
                {img.title && <h3 className="text-lg font-semibold text-white mb-2">{img.title}</h3>}
                {img.genre && <p className="text-sm text-blue-400 mb-1">Genre: {img.genre}</p>}
                {img.game && <p className="text-sm text-purple-400 mb-1">Game: {img.game}</p>}
                {img.uploadedBy && <p className="text-sm text-green-400 mb-1">Uploader: {img.uploadedBy}</p>}
                {img.uploadedAt && <p className="text-sm text-gray-400 mb-4">
                  Uploaded: {img.uploadedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                </p>}
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(img)}
                    className="flex-1 bg-yellow-600 text-white py-2 px-3 rounded-md hover:bg-yellow-700 transition-colors text-sm"
                  >
                    Edit
                  </button>
                  {(img.path || img.public_id) && (
                    <button
                      onClick={() => handleDelete(img.path || img.public_id!, img.id)}
                      className="flex-1 bg-red-600 text-white py-2 px-3 rounded-md hover:bg-red-700 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {images.length === 0 && !loading && (
        <p className="text-center text-gray-400 mt-10">No images uploaded yet.</p>
      )}
    </div>
  );
}
