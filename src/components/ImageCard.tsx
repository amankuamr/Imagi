"use client";
import Image from "next/image";

export default function ImageCard({ src, title }: { src: string; title: string }) {
  return (
    <div className="rounded-xl overflow-hidden shadow-lg hover:scale-105 transition">
      <Image src={src} alt={title} width={400} height={250} className="object-cover w-full h-60" />
      <div className="p-3 bg-gray-800">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
    </div>
  );
}
