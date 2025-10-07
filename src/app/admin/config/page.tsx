"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

interface ConfigData {
  genres: string[];
  games: string[];
}

export default function AdminConfig() {
  const [config, setConfig] = useState<ConfigData>({ genres: [], games: [] });
  const [newGenre, setNewGenre] = useState('');
  const [newGame, setNewGame] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const docRef = doc(db, 'config', 'settings');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setConfig(docSnap.data() as ConfigData);
      } else {
        // Initialize with default values
        const defaultConfig = {
          genres: ["Action", "RPG", "Adventure", "Strategy", "Simulation"],
          games: ["Cyberpunk 2077", "The Witcher 3", "Elden Ring", "GTA V", "Minecraft"]
        };
        await setDoc(docRef, defaultConfig);
        setConfig(defaultConfig);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setLoading(false);
    }
  };

  const addGenre = async () => {
    if (!newGenre.trim()) return;
    const updatedGenres = [...config.genres, newGenre.trim()];
    try {
      await updateDoc(doc(db, 'config', 'settings'), { genres: updatedGenres });
      setConfig({ ...config, genres: updatedGenres });
      setNewGenre('');
    } catch (error) {
      console.error('Error adding genre:', error);
    }
  };

  const addGame = async () => {
    if (!newGame.trim()) return;
    const updatedGames = [...config.games, newGame.trim()];
    try {
      await updateDoc(doc(db, 'config', 'settings'), { games: updatedGames });
      setConfig({ ...config, games: updatedGames });
      setNewGame('');
    } catch (error) {
      console.error('Error adding game:', error);
    }
  };

  const removeGenre = async (genre: string) => {
    const updatedGenres = config.genres.filter(g => g !== genre);
    try {
      await updateDoc(doc(db, 'config', 'settings'), { genres: updatedGenres });
      setConfig({ ...config, genres: updatedGenres });
    } catch (error) {
      console.error('Error removing genre:', error);
    }
  };

  const removeGame = async (game: string) => {
    const updatedGames = config.games.filter(g => g !== game);
    try {
      await updateDoc(doc(db, 'config', 'settings'), { games: updatedGames });
      setConfig({ ...config, games: updatedGames });
    } catch (error) {
      console.error('Error removing game:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-white">Loading config...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-white mb-6">Configuration</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Genres Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-white">Manage Genres</h2>
          
          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              value={newGenre}
              onChange={(e) => setNewGenre(e.target.value)}
              placeholder="New genre"
              className="bg-gray-700 text-white border-gray-600"
            />
            <Button onClick={addGenre} className="bg-blue-600 hover:bg-blue-700">
              Add
            </Button>
          </div>

          <div className="space-y-2">
            {config.genres.map((genre) => (
              <div key={genre} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                <span className="text-white">{genre}</span>
                <Button
                  onClick={() => removeGenre(genre)}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Games Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-white">Manage Games</h2>
          
          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              value={newGame}
              onChange={(e) => setNewGame(e.target.value)}
              placeholder="New game"
              className="bg-gray-700 text-white border-gray-600"
            />
            <Button onClick={addGame} className="bg-blue-600 hover:bg-blue-700">
              Add
            </Button>
          </div>

          <div className="space-y-2">
            {config.games.map((game) => (
              <div key={game} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                <span className="text-white">{game}</span>
                <Button
                  onClick={() => removeGame(game)}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
