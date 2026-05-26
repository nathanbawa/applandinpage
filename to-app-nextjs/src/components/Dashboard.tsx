"use client";

import { ChevronRight, Check, Home, Train, Ellipsis, ArrowRight } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export function EssentialServices() {
  const services = [
    { name: "1. SIM Card", icon: "fa-solid fa-sim-card", bgClass: "bg-gradient-to-br from-[#FF5722] to-[#E64A19]" },
    { name: "2. Bank Account", icon: "fa-solid fa-building-columns", bgClass: "bg-gradient-to-br from-[#34495E] to-[#2C3E50]" },
    { name: "3. Find Housing", icon: "fa-solid fa-house-chimney", bgClass: "bg-gradient-to-br from-[#F39C12] to-[#E67E22]" },
    { name: "4. Move Around", icon: "fa-solid fa-train", bgClass: "bg-gradient-to-br from-[#9B59B6] to-[#8E44AD]" },
    { name: "5. Home Services", icon: "fa-solid fa-hammer", bgClass: "bg-gradient-to-br from-[#FF7F50] to-[#FF6347]" },
    { name: "6. Groceries", icon: "fa-solid fa-basket-shopping", bgClass: "bg-gradient-to-br from-[#009688] to-[#00796B]" },
    { name: "7. Winter Survival", icon: "fa-regular fa-snowflake", bgClass: "bg-gradient-to-br from-[#2196F3] to-[#1976D2]" },
    { name: "8. Discounts", icon: "fa-solid fa-tags", bgClass: "bg-gradient-to-br from-[#4CAF50] to-[#388E3C]" },
  ];

  return (
    <section className="px-6 pb-8">
      <div className="flex justify-between items-baseline mb-4">
        <h3 className="text-[18px] font-bold">Essential Services</h3>
        <a href="#" className="text-[13px] text-[var(--color-primary-red)] font-semibold no-underline">View all</a>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {services.map((svc, i) => (
          <motion.div whileTap={{ scale: 0.95 }} key={i} className="flex flex-col items-center text-center gap-2 cursor-pointer">
            <div className={`w-14 h-14 flex items-center justify-center text-2xl rounded-full text-white ${svc.bgClass} shadow-sm`}>
              <i className={svc.icon}></i>
            </div>
            <span className="text-[11px] font-medium text-[var(--color-text-dark)] leading-tight">{svc.name}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function AiAssistant() {
  const [messages, setMessages] = useState([
    { type: 'ai', text: "Hi! I'm T.O.\nHow can I help you today?" }
  ]);
  const [prompts, setPrompts] = useState([
    "Where can I find cheap groceries near York?",
    "Best bank account for international students?",
    "How do I avoid rental scams?",
    "Best winter jacket under $150?"
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSend = (text: string) => {
    if(!text.trim()) return;
    setMessages(prev => [...prev, { type: 'user', text }]);
    setPrompts(prev => prev.filter(p => p !== text));
    setInputValue("");
    setTimeout(() => {
      setMessages(prev => [...prev, { type: 'ai', text: "I'm still learning, but I've noted that down!" }]);
    }, 1500);
  };

  return (
    <section className="px-6 pb-8">
      <div className="flex justify-between items-baseline">
        <h3 className="text-[18px] font-bold">Meet T.O 🤖</h3>
      </div>
      <p className="text-[13px] text-[var(--color-text-gray)] mb-4 -mt-2">Your AI Student Assistant</p>
      
      <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_24px_rgba(229,57,53,0.04)]">
        <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto mb-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.type === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${m.type === 'user' ? 'bg-[var(--color-primary-red)] text-white' : 'bg-[var(--color-soft-red)] text-[var(--color-primary-red)]'}`}>
                {m.type === 'user' ? <i className="fa-solid fa-user text-sm" /> : <i className="fa-solid fa-robot text-sm" />}
              </div>
              <div className={`p-3 rounded-2xl text-[14px] ${m.type === 'user' ? 'bg-[#f1f1f1] rounded-tr-sm' : 'bg-[#FAFAFA] rounded-tl-sm'}`}>
                {m.text.split('\n').map((line, j) => <p key={j}>{line}</p>)}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {prompts.map((p, i) => (
            <button key={i} onClick={() => handleSend(p)} className="bg-[var(--color-soft-red)] text-[var(--color-dark-red)] border border-red-500/10 px-4 py-2 rounded-full text-[13px] font-medium transition-colors hover:bg-[var(--color-primary-red)] hover:text-white text-left">
              {p}
            </button>
          ))}
        </div>

        <div className="relative">
          <input 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
            type="text" 
            placeholder="Ask T.O anything..." 
            className="w-full bg-[#FAFAFA] border-none outline-none py-3 pl-4 pr-12 rounded-2xl text-[14px]"
          />
          <button onClick={() => handleSend(inputValue)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[var(--color-primary-red)] text-white rounded-full flex items-center justify-center">
            <i className="fa-solid fa-paper-plane text-xs" />
          </button>
        </div>
      </div>
    </section>
  );
}

export function AiRecommendations() {
  return (
    <section className="px-6 pb-8">
      <div className="flex justify-between items-baseline mb-4">
        <h3 className="text-[18px] font-bold">AI-Powered For You ✨</h3>
        <a href="#" className="text-[13px] text-[var(--color-primary-red)] font-semibold no-underline">View all</a>
      </div>
      
      <motion.div whileTap={{ scale: 0.98 }} className="bg-white rounded-[16px] p-3 flex items-center gap-4 mb-3 shadow-[0_8px_24px_rgba(229,57,53,0.04)] cursor-pointer">
        <div className="w-12 h-12 bg-[#ffebee] rounded-xl flex items-center justify-center text-[20px]">🏠</div>
        <div className="flex-1">
          <h4 className="text-[15px] font-bold">Recommended Housing</h4>
          <p className="text-[12px] text-[var(--color-text-gray)]">Near York University</p>
          <span className="text-[12px] font-semibold text-[var(--color-primary-red)] mt-1 block">From $650/month</span>
        </div>
        <ChevronRight size={16} className="text-[var(--color-text-light)]" />
      </motion.div>

      <motion.div whileTap={{ scale: 0.98 }} className="bg-white rounded-[16px] p-3 flex items-center gap-4 mb-3 shadow-[0_8px_24px_rgba(229,57,53,0.04)] cursor-pointer">
        <div className="w-12 h-12 bg-[#fce4ec] rounded-xl flex items-center justify-center text-[#c2185b]"><i className="fa-solid fa-sim-card" /></div>
        <div className="flex-1">
          <h4 className="text-[15px] font-bold">Best SIM Deals</h4>
          <p className="text-[12px] text-[var(--color-text-gray)]">Chatr Mobile - $25/month</p>
        </div>
        <ChevronRight size={16} className="text-[var(--color-text-light)]" />
      </motion.div>
    </section>
  );
}

export function SurvivalProgress() {
  return (
    <section className="px-6 pb-8">
      <div className="flex justify-between items-baseline mb-1">
        <h3 className="text-[18px] font-bold">Student Survival Progress 🏆</h3>
        <span className="text-[13px] font-semibold text-[var(--color-text-gray)]">7/14 completed</span>
      </div>
      <p className="text-[13px] text-[var(--color-text-gray)] mb-4">You&apos;re doing great!</p>
      
      <div className="h-2 bg-[var(--color-soft-red)] rounded-full mb-6 overflow-hidden">
        <div className="h-full w-1/2 bg-[var(--color-primary-red)] rounded-full" />
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[var(--color-primary-red)] text-white flex items-center justify-center"><Check size={18} /></div>
          <span className="text-[11px] font-semibold text-[var(--color-text-dark)]">SIM</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[var(--color-primary-red)] text-white flex items-center justify-center"><Check size={18} /></div>
          <span className="text-[11px] font-semibold text-[var(--color-text-dark)]">Bank</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-white border-2 border-[var(--color-soft-red)] text-[var(--color-primary-red)] flex items-center justify-center"><Home size={16} /></div>
          <span className="text-[11px] font-semibold text-[var(--color-text-dark)]">Housing</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-white border-2 border-[var(--color-soft-red)] text-[var(--color-primary-red)] flex items-center justify-center"><Train size={16} /></div>
          <span className="text-[11px] font-semibold text-[var(--color-text-dark)]">Presto</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[var(--color-bg-color)] border-2 border-dashed border-gray-300 text-[var(--color-text-gray)] flex items-center justify-center"><Ellipsis size={18} /></div>
        </div>
      </div>
    </section>
  );
}

export function ArrivalPlan() {
  return (
    <section className="px-6 pb-8">
      <div className="flex justify-between items-baseline mb-4">
        <h3 className="text-[18px] font-bold">Your 48h Arrival Plan</h3>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        <div className="min-w-[160px] bg-[var(--color-soft-red)] border border-red-500/20 rounded-[16px] p-4 shadow-sm">
          <h4 className="text-[var(--color-dark-red)] font-bold mb-3">Day 1</h4>
          <ul className="text-[12px] font-medium space-y-2">
            <li className="flex items-center gap-2"><i className="fa-solid fa-circle-check text-[var(--color-primary-red)]" /> Get a SIM</li>
            <li className="flex items-center gap-2"><i className="fa-solid fa-circle-check text-[var(--color-primary-red)]" /> Open Bank Account</li>
            <li className="flex items-center gap-2"><i className="fa-solid fa-circle-check text-[var(--color-primary-red)]" /> Get PRESTO Card</li>
          </ul>
        </div>
        
        <div className="flex items-center text-[var(--color-text-light)] px-1"><ArrowRight size={20} /></div>
        
        <div className="min-w-[160px] bg-white rounded-[16px] p-4 shadow-sm">
          <h4 className="text-[var(--color-dark-red)] font-bold mb-3">Day 2</h4>
          <ul className="text-[12px] space-y-2 text-[var(--color-text-dark)]">
            <li className="flex items-center gap-2"><i className="fa-regular fa-circle-check text-[var(--color-text-light)]" /> Buy Groceries</li>
            <li className="flex items-center gap-2"><i className="fa-regular fa-circle-check text-[var(--color-text-light)]" /> Winter Essentials</li>
            <li className="flex items-center gap-2"><i className="fa-regular fa-circle text-[var(--color-text-light)]" /> Campus Tour</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
