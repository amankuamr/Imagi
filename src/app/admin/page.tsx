"use client";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Stats {
  totalImages: number;
  totalLikes: number;
  totalDislikes: number;
  totalUsers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalImages: 0,
    totalLikes: 0,
    totalDislikes: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'images'));
      let totalLikes = 0;
      let totalDislikes = 0;
      const userSet = new Set<string>();

      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        totalLikes += data.likes || 0;
        totalDislikes += data.dislikes || 0;
        (data.likedBy || []).forEach((uid: string) => userSet.add(uid));
        (data.dislikedBy || []).forEach((uid: string) => userSet.add(uid));
      });

      setStats({
        totalImages: querySnapshot.size,
        totalLikes,
        totalDislikes,
        totalUsers: userSet.size,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-white">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-2">Total Images</h3>
          <p className="text-3xl font-bold text-blue-400">{stats.totalImages}</p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-2">Total Likes</h3>
          <p className="text-3xl font-bold text-green-400">{stats.totalLikes}</p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-2">Total Dislikes</h3>
          <p className="text-3xl font-bold text-red-400">{stats.totalDislikes}</p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-2">Active Users</h3>
          <p className="text-3xl font-bold text-purple-400">{stats.totalUsers}</p>
        </div>
      </div>
    </div>
  );
}
