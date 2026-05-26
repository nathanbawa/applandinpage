import { Bell, Search, QrCode } from "lucide-react";

export function TopHeader() {
  return (
    <header className="flex justify-between items-center p-6 bg-[var(--color-bg-color)] sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-[var(--color-soft-red)] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://i.pravatar.cc/150?img=11" alt="User Profile" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Hi, Ahmed! 👋</h1>
          <p className="text-[13px] text-[var(--color-text-gray)]">Welcome to Toronto 🇨🇦</p>
        </div>
      </div>
      <div className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(229,57,53,0.04)] text-[var(--color-text-dark)] cursor-pointer">
        <Bell size={20} />
        <span className="absolute top-0 right-0 bg-[var(--color-primary-red)] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
          3
        </span>
      </div>
    </header>
  );
}

export function SearchBar() {
  return (
    <div className="mx-6 mb-6 px-4 py-3 bg-white rounded-2xl flex items-center gap-3 shadow-[0_8px_24px_rgba(229,57,53,0.04)]">
      <Search size={20} className="text-[var(--color-text-light)]" />
      <input 
        type="text" 
        placeholder="What do you need today?" 
        className="flex-1 border-none outline-none text-[15px] bg-transparent text-[var(--color-text-dark)]" 
      />
      <QrCode size={20} className="text-[var(--color-text-light)] cursor-pointer" />
    </div>
  );
}
