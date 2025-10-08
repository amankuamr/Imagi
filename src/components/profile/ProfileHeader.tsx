import { User } from "firebase/auth";
import Image from "next/image";
import { motion } from "framer-motion";
import { Edit3 } from "lucide-react";

interface ProfileUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
}

interface ProfileHeaderProps {
  user: User | ProfileUser;
  canEdit: boolean;
  isAdmin: boolean;
  getDaysUntilNextEdit: () => number;
  onEditClick: () => void;
  createdAt?: Date | null;
}

const avatarOptions = [
  { id: 'avatar-1', color: 'from-blue-500 to-blue-600', emoji: '🎮' },
  { id: 'avatar-2', color: 'from-purple-500 to-purple-600', emoji: '🚀' },
  { id: 'avatar-3', color: 'from-green-500 to-green-600', emoji: '⚡' },
  { id: 'avatar-4', color: 'from-red-500 to-red-600', emoji: '🔥' },
  { id: 'avatar-5', color: 'from-yellow-500 to-yellow-600', emoji: '⭐' },
  { id: 'avatar-6', color: 'from-pink-500 to-pink-600', emoji: '🌟' },
  { id: 'avatar-7', color: 'from-indigo-500 to-indigo-600', emoji: '🎯' },
  { id: 'avatar-8', color: 'from-teal-500 to-teal-600', emoji: '🎪' },
  { id: 'avatar-9', color: 'from-orange-500 to-orange-600', emoji: '🎨' },
  { id: 'avatar-10', color: 'from-cyan-500 to-cyan-600', emoji: '🎭' },
  { id: 'avatar-11', color: 'from-rose-500 to-rose-600', emoji: '🎪' },
  { id: 'avatar-12', color: 'from-emerald-500 to-emerald-600', emoji: '🎯' },
];

const getAvatarById = (avatarId: string) => {
  return avatarOptions.find(avatar => avatar.id === avatarId);
};

export default function ProfileHeader({
  user,
  canEdit,
  isAdmin,
  getDaysUntilNextEdit,
  onEditClick,
  createdAt
}: ProfileHeaderProps) {
  const selectedAvatar = user.photoURL ? getAvatarById(user.photoURL) : null;
  const hasPhotoURL = user.photoURL && typeof user.photoURL === 'string';
  return (
    <div className="relative pt-20 pb-10 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-white/20">
            {selectedAvatar ? (
              <div className={`w-full h-full bg-gradient-to-br ${selectedAvatar.color} flex items-center justify-center`}>
                <span className="text-4xl">{selectedAvatar.emoji}</span>
              </div>
            ) : hasPhotoURL ? (
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
              onClick={onEditClick}
              disabled={!canEdit}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={!canEdit ? (isAdmin ? 'Admin can edit anytime' : `Can edit again in ${getDaysUntilNextEdit()} days`) : 'Edit profile'}
            >
              <Edit3 className="w-5 h-5 text-white" />
            </button>
          </div>
          <p className="text-gray-300">{user.email}</p>
          <p className="text-sm text-gray-400 mt-2 flex items-center justify-center gap-2">
            <span>📅</span>
            Joined {createdAt ? createdAt.toLocaleDateString() : 'Recently'}
          </p>
          {!canEdit && (
            <p className="text-xs text-yellow-400 mt-1 text-center">
              {isAdmin ? 'Admin: Can edit anytime' : `Profile edits available in ${getDaysUntilNextEdit()} days`}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}