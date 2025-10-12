"use client";

interface UserData {
  id: string;
  username: string;
  email: string;
}

interface UserOverlayProps {
  userData: UserData;
}

export default function UserOverlay({ userData }: UserOverlayProps) {
  return (
    <div className="absolute -top-20 left-0 right-0 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0 translate-y-1 pointer-events-none group-hover:pointer-events-auto">
      <div className="bg-gradient-to-r from-black/95 via-gray-900/95 to-black/95 backdrop-blur-xl border border-white/20 rounded-xl mx-2 px-4 py-3 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* User Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-xs">
                {userData.username.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">
                {userData.username}
              </p>
              <p className="text-white/70 text-xs truncate">
                {userData.email}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}