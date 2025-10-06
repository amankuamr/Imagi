"use client";
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ImageData {
  id: string;
  url: string;
  title: string;
}

export default function GalleryHeroCarousel() {
  const [images, setImages] = useState<ImageData[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'images'));
        const imgs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as ImageData));
        setImages(imgs);
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };
    fetchImages();
  }, []);

  if (images.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Loading images...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-transparent flex items-center z-[40] pt-20">
      <Carousel className="w-full h-full">
        <CarouselContent className="h-full">
          {images.map((img) => (
            <CarouselItem key={img.id} className="h-full">
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={img.url}
                  alt={img.title}
                  className="w-[70vw] h-[80vh] object-cover rounded-lg"
                />

                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-6 py-3 rounded-lg">
                  <h2 className="text-xl font-semibold text-center">{img.title}</h2>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </div>
  );
}
