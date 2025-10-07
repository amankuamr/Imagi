import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, User as UserIcon } from "lucide-react";

interface EditForm {
  displayName: string;
  profileImage: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSave: (formData: EditForm) => Promise<void>;
}

export default function EditProfileModal({ isOpen, onClose, user, onSave }: EditProfileModalProps) {
  const [formData, setFormData] = useState<EditForm>({
    displayName: '',
    profileImage: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Avatar options - these would typically come from the server
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

  const getSelectedAvatar = () => {
    return avatarOptions.find(avatar => avatar.id === formData.profileImage);
  };

  // Update form when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        displayName: user.displayName || '',
        profileImage: user.photoURL || ''
      });
    }
  }, [isOpen, user]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
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
                onClick={onClose}
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
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
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
                  value={formData.profileImage}
                  onChange={(e) => setFormData(prev => ({ ...prev, profileImage: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter image URL or leave empty"
                />
                {(formData.profileImage && !getSelectedAvatar()) && (
                  <div className="mt-2 flex justify-center">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300">
                      <Image
                        src={formData.profileImage}
                        alt="Profile preview"
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                  </div>
                )}

                {getSelectedAvatar() && (
                  <div className="mt-2 flex justify-center">
                    <div className={`w-16 h-16 rounded-full border-2 border-gray-300 bg-gradient-to-br ${getSelectedAvatar()?.color} flex items-center justify-center`}>
                      <span className="text-2xl">{getSelectedAvatar()?.emoji}</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Or Choose from Avatar Collection
                </label>
                <div className="grid grid-cols-6 gap-3 max-h-40 overflow-y-auto">
                  {avatarOptions.map((avatar) => (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, profileImage: avatar.id }))}
                      className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatar.color} flex items-center justify-center text-white text-lg hover:scale-110 transition-transform border-2 ${
                        formData.profileImage === avatar.id ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300'
                      }`}
                    >
                      {avatar.emoji}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Select an avatar or use a custom image URL above
                </p>
              </div>

              <div className="text-sm text-gray-500">
                Email cannot be changed. Profile edits are limited to once every 7 days.
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}