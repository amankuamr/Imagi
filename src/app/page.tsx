import Hero from "@/components/Hero";
import RecentPlayThrough from "@/components/RecentPlayThrough";


export default function Home() {
  return (
    <main className="relative">
      {/* Fixed Hero Section */}
      <Hero />
      
      {/* Scrollable Content */}
      <div className="relative z-10">
        {/* Spacer to push content down initially */}
        <div className="h-screen"></div>
        
        {/* Recent Play Through Section */}
        <RecentPlayThrough />
        
        
      </div>
    </main>
  );
}