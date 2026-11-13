import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, ShieldCheck } from 'lucide-react';

const messages = [
  { icon: Sparkles, text: "Welcome to VELOURA • Use code VELOURA10 for 10% Off on your first order" },
  { icon: Clock, text: "Express 2-Hour Delivery & Midnight Delivery Available across Hyderabad, Mumbai, Delhi & Bengaluru" },
  { icon: ShieldCheck, text: "100% Handcrafted Artisanal Cakes • Pure Belgian Cocoa & Premium Ingredients" }
];

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const current = messages[index];
  const Icon = current.icon;

  return (
    <div className="bg-[#4A1525] text-[#F7ECEE] py-2 px-4 text-xs sm:text-sm font-medium tracking-wide transition-all duration-500">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <Icon className="w-3.5 h-3.5 text-[#E6C387] animate-pulse" />
        <span className="text-center">{current.text}</span>
      </div>
    </div>
  );
}
