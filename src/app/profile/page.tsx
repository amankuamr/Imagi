"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, orderBy, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ImageIcon, Heart, Trophy, Edit3, X, Camera, Save } from "lucide-react";

interface UserImage {
  id: string;
  title: string;
  url: string;
  uploadedAt: Date;
  likes: number;
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [userImages, setUserImages] = useState<UserImage[]>([]);
  const [stats, setStats] = useState({ totalImages: 0, totalLikes: 0 });
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Update form when modal opens
  useEffect(() => {
    if (isEditModalOpen && user) {
      setEditForm({
        displayName: user.displayName || '',
        profileImage: user.photoURL || ''
      });
    }
  }, [isEditModalOpen, user]);
  const [editForm, setEditForm] = useState({ displayName: '', profileImage: '' });
  const [canEdit, setCanEdit] = useState(false);
  const [lastEditTime, setLastEditTime] = useState<Date | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        // Check if user is admin (you can define admin emails or add a role field)
        const adminEmails = ['admin@imagi.com', 'your-admin-email@example.com']; // Add your admin emails
        const isUserAdmin = adminEmails.includes(user.email || '');
        setIsAdmin(isUserAdmin);

        // Fetch user profile data for last edit time
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          if (userData.lastProfileEdit) {
            setLastEditTime(userData.lastProfileEdit.toDate());
          }
        }

        // Check if user can edit (7 days passed or is admin)
        const now = new Date();
        const canEditProfile = isUserAdmin || !lastEditTime || (now.getTime() - lastEditTime.getTime()) > (7 * 24 * 60 * 60 * 1000);
        setCanEdit(canEditProfile);
        setIsAdmin(isUserAdmin);

        // Initialize form data
        setEditForm({
          displayName: user.displayName || '',
          profileImage: user.photoURL || ''
        });

        // Fetch user's images
        const q = query(
          collection(db, "images"),
          where("userId", "==", user.uid),
          orderBy("uploadedAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const images = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          uploadedAt: doc.data().uploadedAt.toDate()
        })) as UserImage[];

        setUserImages(images);

        // Calculate stats
        const totalLikes = images.reduce((sum, img) => sum + (img.likes || 0), 0);
        setStats({
          totalImages: images.length,
          totalLikes
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, router]);

  if (!user) return null;

  const getDaysUntilNextEdit = () => {
    if (!lastEditTime) return 0;
    const now = new Date();
    const nextEditTime = new Date(lastEditTime.getTime() + (7 * 24 * 60 * 60 * 1000));
    const diffTime = nextEditTime.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: editForm.displayName,
        photoURL: editForm.profileImage || null
      });

      // Update Firestore user document with last edit time
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        username: editForm.displayName,
        lastProfileEdit: new Date()
      });

      // Update local state to reflect changes immediately
      const now = new Date();
      setLastEditTime(now);
      setCanEdit(isAdmin); // Admins can edit again immediately, others have to wait 7 days

      setIsEditModalOpen(false);
      // The auth state listener will automatically update the user object
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Background Image */}
      <motion.div
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="fixed inset-0 z-0"
      >
        <Image
          src="/images/profile.jpg"
          alt="Profile Background"
          fill
          className="object-cover"
          priority
          quality={90}
        />
      </motion.div>

      {/* Gradient Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="fixed inset-0 bg-black/50 z-5"
      />

      {/* Profile Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="relative z-10"
      >
        {/* Header */}
        <div className="pt-20 pb-10 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-white/20">
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={user.displayName || 'Profile'}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {user.displayName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-center gap-4 mb-4">
              <h1 className="text-4xl font-bold text-white">{user.displayName || 'User'}</h1>
              <button
                onClick={() => setIsEditModalOpen(true)}
                disabled={!canEdit}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={!canEdit ? (isAdmin ? 'Admin can edit anytime' : `Can edit again in ${getDaysUntilNextEdit()} days`) : 'Edit profile'}
              >
                <Edit3 className="w-5 h-5 text-white" />
              </button>
            </div>
            <p className="text-gray-300">{user.email}</p>
            <p className="text-sm text-gray-400 mt-2 flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4" />
              Joined {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Recently'}
            </p>
            {!canEdit && (
              <p className="text-xs text-yellow-400 mt-1 text-center">
                {isAdmin ? 'Admin: Can edit anytime' : `Profile edits available in ${getDaysUntilNextEdit()} days`}
              </p>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
              <ImageIcon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.totalImages}</div>
              <div className="text-gray-300">Images Uploaded</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
              <Heart className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.totalLikes}</div>
              <div className="text-gray-300">Total Likes</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
              <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">0</div>
              <div className="text-gray-300">Achievements</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Images Grid */}
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

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsEditModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={editForm.displayName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your display name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Image URL
                  </label>
                  <input
                    type="url"
                    value={editForm.profileImage}
                    onChange={(e) => setEditForm(prev => ({ ...prev, profileImage: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter image URL or leave empty"
                  />
                  {editForm.profileImage && (
                    <div className="mt-2 flex justify-center">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300">
                        <Image
                          src={editForm.profileImage}
                          alt="Profile preview"
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-sm text-gray-500">
                  Email cannot be changed. Profile edits are limited to once every 7 days.
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>
    </div>
  );
}