"use client";

import { Home, Bookmark, Bot, Wallet, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 w-full max-w-[480px] bg-white flex justify-between px-6 pt-3 pb-6 rounded-t-[24px] shadow-[0_-4px_24px_rgba(0,0,0,0.06)] z-50">
      <Link href="/" className={`flex flex-col items-center gap-1 text-[11px] font-medium no-underline ${pathname === '/' ? 'text-[var(--color-primary-red)]' : 'text-[var(--color-text-light)]'}`}>
        <Home size={20} />
        <span>Home</span>
      </Link>
      
      <Link href="/bookings" className={`flex flex-col items-center gap-1 text-[11px] font-medium no-underline ${pathname === '/bookings' ? 'text-[var(--color-primary-red)]' : 'text-[var(--color-text-light)]'}`}>
        <Bookmark size={20} />
        <span>Bookings</span>
      </Link>

      <Link href="/ask-to" className="flex flex-col items-center gap-1 text-[11px] font-medium no-underline text-[var(--color-text-light)] relative -top-[20px]">
        <div className="w-14 h-14 bg-[var(--color-primary-red)] rounded-full flex items-center justify-center text-white shadow-[0_8px_24px_rgba(229,57,53,0.4)] border-4 border-[var(--color-bg-color)]">
          <Bot size={24} />
        </div>
        <span className="mt-1">Ask T.O</span>
      </Link>

      <Link href="/wallet" className={`flex flex-col items-center gap-1 text-[11px] font-medium no-underline ${pathname === '/wallet' ? 'text-[var(--color-primary-red)]' : 'text-[var(--color-text-light)]'}`}>
        <Wallet size={20} />
        <span>Wallet</span>
      </Link>

      <Link href="/profile" className={`flex flex-col items-center gap-1 text-[11px] font-medium no-underline ${pathname === '/profile' ? 'text-[var(--color-primary-red)]' : 'text-[var(--color-text-light)]'}`}>
        <User size={20} />
        <span>Profile</span>
      </Link>
    </nav>
  );
}
