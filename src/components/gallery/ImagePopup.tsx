"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import NextImage from "next/image";
import { X, Heart, ThumbsDown, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface GalleryItem {
  id: string;
  name: string;
  image: string;
  votes: number;
}

interface ImagePopupProps {
  item: GalleryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onLike: (id: string) => void;
  onDislike: (id: string) => void;
  isLiked: boolean;
  isDisliked: boolean;
}

const resolutions = [
  { name: "Desktop (16:9)", ratio: 16 / 9, width: 1920, height: 1080 },
  { name: "Mobile (9:16)", ratio: 9 / 16, width: 1080, height: 1920 },
  { name: "Tablet (4:3)", ratio: 4 / 3, width: 1024, height: 768 },
  { name: "Square (1:1)", ratio: 1, width: 1000, height: 1000 },
];

export default function ImagePopup({ item, isOpen, onClose, onLike, onDislike, isLiked, isDisliked }: ImagePopupProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedResolution, setSelectedResolution] = useState<typeof resolutions[0] | null>(null);

  const cropImage = useCallback((resolution: typeof resolutions[0]) => {
    const canvas = canvasRef.current;
    if (!canvas || !item) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Calculate crop dimensions
      const imgRatio = img.width / img.height;
      let cropWidth, cropHeight, offsetX = 0, offsetY = 0;

      if (imgRatio > resolution.ratio) {
        // Image is wider, crop width
        cropHeight = img.height;
        cropWidth = cropHeight * resolution.ratio;
        offsetX = (img.width - cropWidth) / 2;
      } else {
        // Image is taller, crop height
        cropWidth = img.width;
        cropHeight = cropWidth / resolution.ratio;
        offsetY = (img.height - cropHeight) / 2;
      }

      // Set canvas size
      canvas.width = resolution.width;
      canvas.height = resolution.height;

      // Draw cropped image
      ctx.drawImage(
        img,
        offsetX, offsetY, cropWidth, cropHeight,
        0, 0, resolution.width, resolution.height
      );
    };
    img.src = item.image;
  }, [item]);

  useEffect(() => {
    if (selectedResolution && item) {
      cropImage(selectedResolution);
    }
  }, [selectedResolution, item, cropImage]);

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${item?.name}_${selectedResolution?.name.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  if (!item) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-5xl w-full max-h-[90vh] bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
            >
              <X size={24} />
            </button>

            {/* Like/Dislike buttons - top left */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <Button
                onClick={() => onLike(item.id)}
                variant="ghost"
                className={`h-10 w-10 p-0 bg-black/50 border border-white/20 ${
                  isLiked
                    ? "text-red-500 hover:text-red-600"
                    : "text-white hover:text-gray-300"
                }`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
              </Button>
              <Button
                onClick={() => onDislike(item.id)}
                variant="ghost"
                className={`h-10 w-10 p-0 bg-black/50 border border-white/20 ${
                  isDisliked
                    ? "text-red-500 hover:text-red-600"
                    : "text-white hover:text-gray-300"
                }`}
              >
                <ThumbsDown className="h-5 w-5" />
              </Button>
            </div>

            {/* Scrollable content */}
            <div className="max-h-[85vh] overflow-y-auto pt-16">
              {/* Image */}
              <div className="p-6 relative">
                <NextImage
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-contain rounded-lg"
                />
              </div>

              {/* Two-column layout */}
              <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column - Resolutions */}
                <div>
                  <h3 className="text-white text-lg font-semibold mb-3">Download Resolution:</h3>
                  <div className="flex flex-col gap-3">
                    {resolutions.map((res) => (
                      <Button
                        key={res.name}
                        onClick={() => setSelectedResolution(res)}
                        variant={selectedResolution?.name === res.name ? "default" : "outline"}
                        className={`justify-start ${
                          selectedResolution?.name === res.name
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                        }`}
                      >
                        {res.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Right column - Preview and Download */}
                <div className="flex flex-col items-center justify-center">
                  {selectedResolution ? (
                    <>
                      <canvas
                        ref={canvasRef}
                        className="border border-white/20 rounded mb-4 max-w-full"
                        style={{ maxWidth: '300px', maxHeight: '300px' }}
                      />
                      <Button
                        onClick={downloadImage}
                        className="bg-green-600 hover:bg-green-700 text-white w-full max-w-xs"
                      >
                        <Download size={16} className="mr-2" />
                        Download
                      </Button>
                    </>
                  ) : (
                    <div className="text-white/60 text-center py-8">
                      Select a resolution to preview
                    </div>
                  )}
                </div>
              </div>

              {/* Votes at bottom */}
              <div className="px-6 pb-6 border-t border-white/20 pt-4 text-center">
                <div className="text-white text-lg font-semibold">
                  {item.votes.toLocaleString()} votes
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
