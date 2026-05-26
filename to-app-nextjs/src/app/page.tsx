import { TopHeader, SearchBar } from "@/components/TopHeader";
import { HeroMap } from "@/components/HeroMap";
import { EssentialServices, AiAssistant, AiRecommendations, SurvivalProgress, ArrivalPlan } from "@/components/Dashboard";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <TopHeader />
      <SearchBar />
      
      {/* Mapbox interactive hero */}
      <HeroMap />

      <EssentialServices />
      
      <AiAssistant />
      
      <AiRecommendations />
      
      <SurvivalProgress />
      
      {/* Connect Meet component from the web prototype */}
      <section className="px-6 pb-8">
        <div className="flex justify-between items-baseline mb-1">
          <h3 className="text-[18px] font-bold">Connect & Meet</h3>
          <a href="#" className="text-[13px] text-[var(--color-primary-red)] font-semibold no-underline">View all</a>
        </div>
        <p className="text-[13px] text-[var(--color-text-gray)] mb-4">Find students like you</p>
        <div className="bg-white rounded-[16px] p-4 shadow-[0_8px_24px_rgba(229,57,53,0.04)] flex items-center gap-4">
          <div className="flex">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://i.pravatar.cc/150?img=12" alt="Student 1" className="w-9 h-9 rounded-full border-2 border-white -ml-0" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://i.pravatar.cc/150?img=5" alt="Student 2" className="w-9 h-9 rounded-full border-2 border-white -ml-3" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://i.pravatar.cc/150?img=3" alt="Student 3" className="w-9 h-9 rounded-full border-2 border-white -ml-3" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://i.pravatar.cc/150?img=9" alt="Student 4" className="w-9 h-9 rounded-full border-2 border-white -ml-3" />
          </div>
          <div className="flex-1 flex items-center justify-between">
            <div>
              <h4 className="text-[14px] font-bold">Students at York</h4>
              <p className="text-[11px] text-[var(--color-text-gray)]">Same interests • Same city</p>
            </div>
            <button className="bg-[var(--color-soft-red)] text-[var(--color-primary-red)] border-none px-3 py-1.5 rounded-full font-semibold text-[12px] cursor-pointer">
              Connect
            </button>
          </div>
        </div>
      </section>

      <ArrivalPlan />
    </main>
  );
}
