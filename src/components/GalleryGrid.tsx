"use client";
import { useState, useEffect } from "react";
import ImageCard from "./ImageCard";

const defaultImages = [
  { src: "/images/game1.jpg", title: "Game One" },
  { src: "/images/game2.jpg", title: "Game Two" },
  { src: "/images/game3.jpg", title: "Game Three" },
];

export default function GalleryGrid() {
  const [images, setImages] = useState(defaultImages);

  useEffect(() => {
    const stored = localStorage.getItem('gameImages');
    if (stored) {
      setImages(JSON.parse(stored));
    }
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
      {images.map((img, i) => (
        <ImageCard key={i} src={img.src} title={img.title} />
      ))}
    </div>
  );
}
