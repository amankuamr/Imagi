import Hero from "@/components/Hero";
import RecentPlayThrough from "@/components/RecentPlayThrough";
import BestImageOfTheWeek from "@/components/BestImageOfTheWeek";
import WeeklyVoting from "@/components/WeeklyVoting";

export default function Home() {
  return (
    <main className="relative">
      {/* Fixed Hero Section */}
      <Hero />
      
      {/* Scrollable Content */}
      <div className="relative z-10">
        {/* Recent Play Through Section */}
        <RecentPlayThrough />
        
        {/* Best Image of the Week Section */}
        <BestImageOfTheWeek />
        
        {/* Weekly Voting Section */}
        <WeeklyVoting />
      </div>
    </main>
  );
}
