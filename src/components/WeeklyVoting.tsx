"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, limit, updateDoc, doc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import ImagePopup from "@/components/ImagePopup";

interface WeeklyImage {
    id: string;
    title: string;
    url: string;
    public_id: string;
    uploadedAt: Date;
    likes: number;
    dislikes: number;
    likedBy?: string[];
    dislikedBy?: string[];
}

export default function WeeklyVoting() {
    const [images, setImages] = useState<WeeklyImage[]>([]);
    const [selectedImage, setSelectedImage] = useState<WeeklyImage | null>(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [votingStates, setVotingStates] = useState<{ [key: string]: boolean }>({});
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const { user } = useAuth();

    useEffect(() => {
        const fetchWeeklyImages = async () => {
            const q = query(
                collection(db, "images"),
                orderBy("uploadedAt", "desc"),
                limit(6)
            );

            const querySnapshot = await getDocs(q);
            const imagesData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                uploadedAt: doc.data().uploadedAt.toDate()
            })) as WeeklyImage[];

            setImages(imagesData);
        };

        fetchWeeklyImages();
    }, []);

    const handleVote = async (imageId: string, voteType: 'like' | 'dislike') => {
        if (!user) return;

        try {
            setVotingStates(prev => ({ ...prev, [imageId]: true }));

            const imageRef = doc(db, "images", imageId);
            const currentImage = images.find(img => img.id === imageId);

            if (!currentImage) return;

            // Check if user already voted
            const hasLiked = currentImage.likedBy?.includes(user.uid);
            const hasDisliked = currentImage.dislikedBy?.includes(user.uid);

            let updateData: any = {};

            if (voteType === 'like') {
                if (hasLiked) {
                    // Remove like
                    updateData = {
                        likes: increment(-1),
                        likedBy: (currentImage.likedBy || []).filter(id => id !== user.uid)
                    };
                } else {
                    // Add like, remove dislike if exists
                    updateData = {
                        likes: increment(1),
                        likedBy: [...(currentImage.likedBy || []), user.uid]
                    };
                    if (hasDisliked) {
                        updateData.dislikes = increment(-1);
                        updateData.dislikedBy = (currentImage.dislikedBy || []).filter(id => id !== user.uid);
                    }
                }
            } else {
                if (hasDisliked) {
                    // Remove dislike
                    updateData = {
                        dislikes: increment(-1),
                        dislikedBy: (currentImage.dislikedBy || []).filter(id => id !== user.uid)
                    };
                } else {
                    // Add dislike, remove like if exists
                    updateData = {
                        dislikes: increment(1),
                        dislikedBy: [...(currentImage.dislikedBy || []), user.uid]
                    };
                    if (hasLiked) {
                        updateData.likes = increment(-1);
                        updateData.likedBy = (currentImage.likedBy || []).filter(id => id !== user.uid);
                    }
                }
            }

            await updateDoc(imageRef, updateData);

            // Update local state
            setImages(prev => prev.map(img => {
                if (img.id === imageId) {
                    return {
                        ...img,
                        likes: voteType === 'like'
                            ? (hasLiked ? img.likes - 1 : img.likes + 1)
                            : (hasDisliked ? img.likes : hasLiked ? img.likes - 1 : img.likes),
                        dislikes: voteType === 'dislike'
                            ? (hasDisliked ? img.dislikes - 1 : img.dislikes + 1)
                            : (hasLiked ? img.dislikes : hasDisliked ? img.dislikes - 1 : img.dislikes),
                        likedBy: updateData.likedBy || img.likedBy,
                        dislikedBy: updateData.dislikedBy || img.dislikedBy
                    };
                }
                return img;
            }));

            setVotingStates(prev => ({ ...prev, [imageId]: false }));
        } catch (error) {
            console.error("Error voting:", error);
            setVotingStates(prev => ({ ...prev, [imageId]: false }));
        }
    };

    const hasUserLiked = (image: WeeklyImage) => {
        return user && image.likedBy?.includes(user.uid);
    };

    const hasUserDisliked = (image: WeeklyImage) => {
        return user && image.dislikedBy?.includes(user.uid);
    };

    if (!user) {
        return (
            <section className="relative min-h-screen flex items-center justify-center py-20 px-6">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Weekly Voting</h2>
                    <p className="text-gray-300 mb-6">Please sign in to vote for your favorite images this week!</p>
                    <div className="space-x-4">
                        <a
                            href="/login"
                            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            Sign In
                        </a>
                        <a
                            href="/signup"
                            className="inline-block px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors"
                        >
                            Sign Up
                        </a>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="relative min-h-screen flex items-center justify-center py-20 px-6">
            {/* Blur Background with Transparency - matching other sections */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-md"></div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto w-full">
                {/* Section Header - matching style */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                        Vote for{" "}
                        <span className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                            Best of the Week
                        </span>
                    </h2>
                    <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
                        Cast your vote for the most impressive gaming screenshots posted this week
                    </p>
                </motion.div>

                {/* Images Grid - matching RecentPlayThrough grid style */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {images.map((image, index) => (
                        <motion.div
                            key={image.id}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            viewport={{ once: true }}
                            className="group relative aspect-[4/5] rounded-3xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-white/30 transition-all duration-300"
                        >
                            {/* Game Image */}
                            <div className="absolute inset-0">
                                <motion.div
                                    className="w-full h-full"
                                >
                                    <img
                                        src={image.url}
                                        alt={image.title}
                                        className="w-full h-full object-cover"
                                    />
                                </motion.div>
                            </div>

                            {/* Dark Overlay - appears on hover */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileHover={{ opacity: 1 }}
                                transition={{ duration: 0.4 }}
                                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
                            />

                            {/* Game Title - appears on hover */}
                            <motion.div
                                animate={{
                                    opacity: hoveredIndex === index ? 1 : 0,
                                    y: hoveredIndex === index ? 0 : 20
                                }}
                                transition={{ duration: 0.4, delay: hoveredIndex === index ? 0.1 : 0 }}
                                className="absolute top-6 left-6 right-6 z-20"
                            >
                                <h3 className="text-2xl md:text-3xl font-bold text-white drop-shadow-2xl">
                                    {image.title}
                                </h3>
                            </motion.div>

                            {/* Vote Section - Bottom Center */}
                            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-4">
                                {/* Like Button */}
                                <motion.button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!votingStates[image.id]) {
                                            handleVote(image.id, 'like');
                                        }
                                    }}
                                    disabled={votingStates[image.id]}
                                    className={`p-3 rounded-full backdrop-blur-lg border-2 shadow-lg transition-all duration-300 ${hasUserLiked(image)
                                            ? 'bg-green-500/30 text-green-300 border-green-400/60 shadow-green-500/30'
                                            : 'bg-white/10 text-white border-white/30 hover:bg-white/20 hover:border-white/50'
                                        }`}
                                >
                                    <ThumbsUp className="w-6 h-6" fill={hasUserLiked(image) ? "currentColor" : "none"} />
                                </motion.button>

                                {/* Like Count */}
                                <motion.span
                                    key={`likes-${image.id}`}
                                    initial={{ scale: 1 }}
                                    animate={{ scale: [1, 1.3, 1] }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    className="text-white font-bold text-lg min-w-[2rem] text-center"
                                >
                                    {image.likes}
                                </motion.span>

                                {/* Dislike Button */}
                                <motion.button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!votingStates[image.id]) {
                                            handleVote(image.id, 'dislike');
                                        }
                                    }}
                                    disabled={votingStates[image.id]}
                                    className={`p-3 rounded-full backdrop-blur-lg border-2 shadow-lg transition-all duration-300 ${hasUserDisliked(image)
                                            ? 'bg-red-500/30 text-red-300 border-red-400/60 shadow-red-500/30'
                                            : 'bg-white/10 text-white border-white/30 hover:bg-white/20 hover:border-white/50'
                                        }`}
                                >
                                    <ThumbsDown className="w-6 h-6" fill={hasUserDisliked(image) ? "currentColor" : "none"} />
                                </motion.button>

                                {/* Dislike Count */}
                                <motion.span
                                    key={`dislikes-${image.id}`}
                                    initial={{ scale: 1 }}
                                    animate={{ scale: [1, 1.3, 1] }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    className="text-white font-bold text-lg min-w-[2rem] text-center"
                                >
                                    {image.dislikes}
                                </motion.span>
                            </div>

                            {/* Simple border effect on hover */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileHover={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="absolute inset-0 rounded-3xl border-2 border-white/50 pointer-events-none"
                            />
                        </motion.div>
                    ))}

          
                </div>

                {images.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg">No images uploaded yet. Be the first to share!</p>
                    </div>
                )}

                {/* View All Button - matching other sections */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mt-16"
                >
                    <motion.button
                        whileHover={{ scale: 1.05, rotateX: 5 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative px-10 py-5 bg-white/5 backdrop-blur-xl border border-white/20 text-white font-bold text-lg rounded-2xl hover:bg-white/10 hover:border-white/30 transition-all duration-500 shadow-2xl"
                    >
                        <span className="flex items-center space-x-3">
                            <span>View All Weekly Images</span>
                            <motion.svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                whileHover={{ x: 8, rotate: 15 }}
                                transition={{ duration: 0.3 }}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </motion.svg>
                        </span>

                        {/* Button Glow Effect */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl"
                        />
                    </motion.button>
                </motion.div>
            </div>

            {/* Enhanced Floating Gaming Elements - matching RecentPlayThrough */}
            <motion.div
                animate={{
                    y: [0, -25, 0],
                    rotate: [0, 15, 0],
                    scale: [1, 1.2, 1]
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-20 left-10 w-10 h-10 bg-gradient-to-r from-blue-500/40 to-purple-500/40 rounded-2xl blur-sm opacity-70"
            />

            <motion.div
                animate={{
                    y: [0, 20, 0],
                    rotate: [0, -10, 0],
                    scale: [1, 0.8, 1]
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 3
                }}
                className="absolute bottom-20 right-10 w-8 h-8 bg-gradient-to-r from-pink-500/40 to-red-500/40 rounded-full blur-sm opacity-60"
            />

            <motion.div
                animate={{
                    y: [0, -15, 0],
                    rotate: [0, 8, 0],
                    scale: [1, 1.1, 1]
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                }}
                className="absolute top-1/2 right-20 w-6 h-6 bg-gradient-to-r from-green-500/40 to-blue-500/40 rounded-lg blur-sm opacity-50"
            />

            <ImagePopup
                isOpen={isPopupOpen}
                onClose={() => setIsPopupOpen(false)}
                imageUrl={selectedImage?.url || '/placeholder-image.jpg'}
                name={selectedImage?.title || ''}
                resolutions={[
                    { label: 'HD (1920x1080)', url: '/downloads/hd-image.jpg' },
                    { label: '4K (3840x2160)', url: '/downloads/4k-image.jpg' },
                    { label: 'Original', url: '/downloads/original-image.jpg' }
                ]}
            />
        </section>
    );
}
