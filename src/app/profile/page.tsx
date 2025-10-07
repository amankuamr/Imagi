"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, orderBy, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";
import { motion } from "framer-motion";
import Image from "next/image";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileGallery from "@/components/profile/ProfileGallery";
import EditProfileModal from "@/components/profile/EditProfileModal";

interface UserImage {
  id: string;
  title: string;
  url: string;
  uploadedAt: Date;
  likes: number;
}

interface EditForm {
  displayName: string;
  profileImage: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [userImages, setUserImages] = useState<UserImage[]>([]);
  const [stats, setStats] = useState({ totalImages: 0, totalLikes: 0 });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [lastEditTime, setLastEditTime] = useState<Date | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userCreatedAt, setUserCreatedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        // Check if user is admin
        const adminEmails = ['admin@imagi.com', 'your-admin-email@example.com'];
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
          if (userData.createdAt) {
            setUserCreatedAt(userData.createdAt.toDate());
          }
        }

        // Check if user can edit (7 days passed or is admin)
        const now = new Date();
        const canEditProfile = isUserAdmin || !lastEditTime || (now.getTime() - lastEditTime.getTime()) > (7 * 24 * 60 * 60 * 1000);
        setCanEdit(canEditProfile);

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
        // Loading complete
      }
    };

    fetchUserData();
  }, [user, router]);

  const getDaysUntilNextEdit = () => {
    if (!lastEditTime) return 0;
    const now = new Date();
    const nextEditTime = new Date(lastEditTime.getTime() + (7 * 24 * 60 * 60 * 1000));
    const diffTime = nextEditTime.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const handleSaveProfile = async (formData: EditForm) => {
    if (!user) return;

    try {
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: formData.displayName,
        photoURL: formData.profileImage || null
      });

      // Update Firestore user document with last edit time
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        username: formData.displayName,
        lastProfileEdit: new Date()
      });

      // Update local state
      const now = new Date();
      setLastEditTime(now);
      setCanEdit(isAdmin);

      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  if (!user) return null;


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

      {/* Animated particles/dots overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 2, delay: 0.5 }}
        className="absolute inset-0 z-20"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px, 80px 80px',
        }}
      />

      {/* Profile Content */}
      <div className="relative z-30">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <ProfileHeader
            user={user}
            canEdit={canEdit}
            isAdmin={isAdmin}
            getDaysUntilNextEdit={getDaysUntilNextEdit}
            onEditClick={() => setIsEditModalOpen(true)}
            createdAt={userCreatedAt}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="max-w-6xl mx-auto px-6"
        >
          <ProfileStats totalImages={stats.totalImages} totalLikes={stats.totalLikes} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <ProfileGallery userImages={userImages} />
        </motion.div>

        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={user}
          onSave={handleSaveProfile}
        />
      </div>

      {/* Animated scroll indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.8 }}
        className="absolute bottom-8 right-8"
      >
        <div className="flex flex-col items-center space-y-2">
          <span className="text-white/70 text-sm font-medium">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-1 h-3 bg-white/70 rounded-full mt-2"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Floating elements */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 left-20 w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-sm z-30 opacity-60"
      />

      <motion.div
        animate={{
          y: [0, 15, 0],
          rotate: [0, -3, 0]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute top-40 right-32 w-6 h-6 bg-gradient-to-r from-pink-400 to-red-400 rounded-full blur-sm z-30 opacity-50"
      />

      <motion.div
        animate={{
          y: [0, -10, 0],
          rotate: [0, 2, 0]
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute bottom-32 left-32 w-3 h-3 bg-gradient-to-r from-green-400 to-blue-400 rounded-full blur-sm z-30 opacity-70"
      />
    </div>
  );
}