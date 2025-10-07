"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

interface FirebaseUser {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  followers?: string[];
  following?: string[];
}

interface UsersPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UsersPanel({ isOpen, onClose }: UsersPanelProps) {
  const [users, setUsers] = useState<FirebaseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users from Firebase...');
      const querySnapshot = await getDocs(collection(db, 'users'));
      console.log('Query snapshot:', querySnapshot);
      console.log('Number of documents:', querySnapshot.size);

      const usersData = querySnapshot.docs.map(doc => {
        console.log('User doc:', doc.id, doc.data());
        return {
          id: doc.id,
          ...doc.data()
        };
      }) as FirebaseUser[];

      console.log('Users data:', usersData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const handleFollow = (userId: string) => {
    setFollowing(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-96 bg-gray-900/95 backdrop-blur-xl border-l border-white/20 z-50 shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Registered Users</h2>
                <button
                  onClick={onClose}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={16} />
                <Input
                  type="text"
                  placeholder="Search users by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-purple-400"
                />
              </div>
            </div>

            {/* Users Grid */}
            <div className="p-6 overflow-y-auto h-full pb-24">
              {loading ? (
                <div className="text-center text-white/60 py-8">
                  Loading users...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center text-white/60 py-8">
                  No users found matching {"\""}{searchQuery}{"\""}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {filteredUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {user.username.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>

                      {/* Name */}
                      <div className="w-full">
                        <p className="text-white font-medium text-sm truncate">{user.username}</p>
                        <p className="text-white/60 text-xs truncate leading-tight break-all">{user.email}</p>
                      </div>

                      {/* Follow Button */}
                      <Button
                        onClick={() => handleFollow(user.id)}
                        variant={following.has(user.id) ? "secondary" : "default"}
                        size="sm"
                        className="w-full text-xs"
                        disabled={currentUser?.uid === user.id}
                      >
                        <UserPlus size={14} className="mr-1" />
                        {following.has(user.id) ? "Following" : "Follow"}
                      </Button>
                    </div>
                  </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}