"use client";
import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminPage() {
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      await addDoc(collection(db, "games"), {
        name: name,
        createdAt: new Date()
      });
      setName("");
      alert("Game added successfully!");
    } catch (error) {
      console.error("Error adding game: ", error);
      alert("Error adding game");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Add New Game</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Game Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Add Game
          </button>
        </form>
      </div>
    </div>
  );
}
