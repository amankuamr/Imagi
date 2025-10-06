import GalleryHeroCarousel from "@/components/gallery/GalleryHeroCarousel";

export default function GalleryPage() {
  return (
    <div className="relative min-h-screen">
  <div
    style={{
      backgroundImage: 'url(/images/herogallery.jpg)',
      backgroundSize: 'cover',
      filter: 'blur(6px)',
    }}
    className="fixed -inset-10 -z-10"
  ></div>
  <GalleryHeroCarousel />
</div>

  );
}
