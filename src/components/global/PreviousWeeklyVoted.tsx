"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Trophy, Award, Calendar, TrendingUp, Crown } from "lucide-react";
import ImagePopup from "@/components/ImagePopup";

interface VotedImage {
  id: string;
  title: string;
  url: string;
  votes: number;
  game: string;
  uploadedBy: string;
  uploadedAt: Date;
  weekOf: string; // Week identifier (e.g., "2024-W42")
}

interface WeeklyWinner {
  week: string;
  winner: VotedImage;
  runnersUp: VotedImage[];
  totalVotes: number;
}

export default function PreviousWeeklyVoted() {
  const [weeklyWinners, setWeeklyWinners] = useState<WeeklyWinner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<VotedImage | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    const fetchPreviousWinners = async () => {
      try {
        // For now, we'll simulate previous weekly winners with mock data
        // In a real implementation, you'd have a separate collection for weekly winners
        const mockWinners: WeeklyWinner[] = [
          {
            week: "2024-W42",
            winner: {
              id: '1',
              title: 'Legendary Valorant Ace',
              url: '/images/hero.jpg',
              votes: 342,
              game: 'Valorant',
              uploadedBy: 'AceMaster',
              uploadedAt: new Date('2024-10-14'),
              weekOf: '2024-W42'
            },
            runnersUp: [
              {
                id: '2',
                title: 'Epic Fortnite Build',
                url: '/images/community.jpg',
                votes: 298,
                game: 'Fortnite',
                uploadedBy: 'BuildKing',
                uploadedAt: new Date('2024-10-12'),
                weekOf: '2024-W42'
              },
              {
                id: '3',
                title: 'Apex Squad Victory',
                url: '/images/comdet.jpg',
                votes: 267,
                game: 'Apex Legends',
                uploadedBy: 'SquadLeader',
                uploadedAt: new Date('2024-10-13'),
                weekOf: '2024-W42'
              }
            ],
            totalVotes: 907
          },
          {
            week: "2024-W41",
            winner: {
              id: '4',
              title: 'CS2 Tactical Masterclass',
              url: '/images/hero.jpg',
              votes: 315,
              game: 'CS2',
              uploadedBy: 'TacticalPro',
              uploadedAt: new Date('2024-10-07'),
              weekOf: '2024-W41'
            },
            runnersUp: [
              {
                id: '5',
                title: 'Overwatch Team Coordination',
                url: '/images/community.jpg',
                votes: 289,
                game: 'Overwatch 2',
                uploadedBy: 'TeamPlayer',
                uploadedAt: new Date('2024-10-05'),
                weekOf: '2024-W41'
              }
            ],
            totalVotes: 604
          }
        ];

        setWeeklyWinners(mockWinners);
      } catch (error) {
        console.error('Error fetching previous winners:', error);
        setWeeklyWinners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPreviousWinners();
  }, []);

  const handleImageClick = (image: VotedImage) => {
    setSelectedImage(image);
    setIsPopupOpen(true);
  };

  const formatWeekDate = (weekString: string) => {
    // Convert week string like "2024-W42" to readable date
    const [year, week] = weekString.split('-W').map(Number);
    const firstDayOfYear = new Date(year, 0, 1);
    const daysToAdd = (week - 1) * 7;
    const weekStart = new Date(firstDayOfYear.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

    // Adjust to Monday of that week
    const monday = new Date(weekStart);
    monday.setDate(weekStart.getDate() - weekStart.getDay() + 1);

    return monday.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGameColor = (game: string): string => {
    const colors: { [key: string]: string } = {
      'valorant': 'from-red-500 to-orange-500',
      'fortnite': 'from-blue-500 to-purple-500',
      'apex-legends': 'from-yellow-500 to-red-500',
      'cs2': 'from-orange-500 to-yellow-500',
      'overwatch': 'from-cyan-500 to-blue-500',
      'league-of-legends': 'from-purple-500 to-pink-500',
      'rocket-league': 'from-blue-600 to-cyan-500',
      'minecraft': 'from-green-500 to-emerald-500'
    };
    return colors[game.toLowerCase()] || 'from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading previous winners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent font-black">
              Previous Weekly Winners
            </span>
          </motion.h1>
          <motion.p
            className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Celebrating the community&apos;s top-voted gaming screenshots from previous weeks
          </motion.p>
        </motion.div>

        {/* Weekly Winners */}
        <div className="space-y-12">
          {weeklyWinners.map((weekData, weekIndex) => (
            <motion.div
              key={weekData.week}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: weekIndex * 0.2 }}
              className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden"
            >
              {/* Week Header */}
              <div className="p-6 md:p-8 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Week of {formatWeekDate(weekData.week)}</h2>
                      <p className="text-gray-400">Total Votes: {weekData.totalVotes}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-yellow-400">{weekData.winner.votes}</div>
                    <div className="text-sm text-gray-400">Winner Votes</div>
                  </div>
                </div>
              </div>

              {/* Winner Section */}
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <Crown className="w-8 h-8 text-yellow-400" />
                  <h3 className="text-xl font-bold text-white">🏆 Weekly Champion</h3>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  onClick={() => handleImageClick(weekData.winner)}
                  className="relative cursor-pointer group mb-8"
                >
                  <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl border-2 border-yellow-400/50">
                    <img
                      src={weekData.winner.url}
                      alt={weekData.winner.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Winner Badge */}
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2 rounded-full border-2 border-white shadow-lg">
                      <span className="text-white font-bold flex items-center gap-2">
                        <Trophy className="w-4 h-4" />
                        WINNER
                      </span>
                    </div>

                    {/* Vote Count */}
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full border border-white/20">
                      <span className="text-white font-bold flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {weekData.winner.votes} votes
                      </span>
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h4 className="text-white font-bold text-2xl mb-2 drop-shadow-lg">
                          {weekData.winner.title}
                        </h4>
                        <div className="flex items-center justify-between">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getGameColor(weekData.winner.game)} text-white`}>
                            {weekData.winner.game}
                          </span>
                          <span className="text-gray-300 text-sm">
                            by {weekData.winner.uploadedBy}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Runners Up */}
                {weekData.runnersUp.length > 0 && (
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <Award className="w-8 h-8 text-gray-400" />
                      <h3 className="text-xl font-bold text-white">🥈 Runners Up</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {weekData.runnersUp.map((runner, index) => (
                        <motion.div
                          key={runner.id}
                          initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                          onClick={() => handleImageClick(runner)}
                          className="relative cursor-pointer group"
                        >
                          <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-xl border border-white/10">
                            <img
                              src={runner.url}
                              alt={runner.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                            />

                            {/* Position Badge */}
                            <div className="absolute top-3 left-3 w-8 h-8 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center border-2 border-white">
                              <span className="text-white font-bold text-sm">#{index + 2}</span>
                            </div>

                            {/* Vote Count */}
                            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full border border-white/20">
                              <span className="text-white font-semibold text-sm">{runner.votes}</span>
                            </div>

                            {/* Content Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent">
                              <div className="absolute bottom-0 left-0 right-0 p-4">
                                <h5 className="text-white font-semibold text-lg mb-1 truncate drop-shadow-lg">
                                  {runner.title}
                                </h5>
                                <div className="flex items-center justify-between">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getGameColor(runner.game)} text-white`}>
                                    {runner.game}
                                  </span>
                                  <span className="text-gray-300 text-xs truncate ml-2">
                                    {runner.uploadedBy}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {weeklyWinners.length === 0 && (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No previous winners found.</p>
            <p className="text-gray-500 text-sm mt-2">Weekly voting winners will appear here.</p>
          </div>
        )}

        {/* Image Popup */}
        {selectedImage && (
          <ImagePopup
            isOpen={isPopupOpen}
            onClose={() => setIsPopupOpen(false)}
            imageUrl={selectedImage.url}
            name={selectedImage.title}
            resolutions={[
              { label: 'HD (1920x1080)', url: '/downloads/hd-image.jpg' },
              { label: '4K (3840x2160)', url: '/downloads/4k-image.jpg' },
              { label: 'Original', url: '/downloads/original-image.jpg' }
            ]}
          />
        )}
      </div>
    </div>
  );
}
