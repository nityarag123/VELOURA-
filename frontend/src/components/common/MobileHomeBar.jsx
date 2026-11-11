import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Cake, Coffee, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function MobileHomeBar() {
  const location = useLocation();
  const { totalItemCount, setIsCartOpen } = useCart();
  const { user } = useAuth();

  const isHome = location.pathname === '/';
  const isMenu = location.pathname === '/products' && !location.search.includes('coffee-brews');
  const isCafe = location.search.includes('coffee-brews') || location.search.includes('cafe-savory');
  const isProfile = location.pathname === '/profile' || location.pathname === '/login' || location.pathname === '/admin';

  return (
    <aside aria-label="Mobile Navigation Bar" className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 py-2 px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.07)] md:hidden">
      <nav className="flex items-center justify-around">
        
        {/* 1. Home */}
        <Link
          to="/"
          className={`flex flex-col items-center gap-0.5 transition ${
            isHome ? 'text-[#E31837] font-bold' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Home className={`w-5 h-5 ${isHome ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[10px] tracking-tight">Home</span>
        </Link>

        {/* 2. Menu / Cakes */}
        <Link
          to="/products"
          className={`flex flex-col items-center gap-0.5 transition ${
            isMenu ? 'text-[#E31837] font-bold' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Cake className={`w-5 h-5 ${isMenu ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[10px] tracking-tight">Cakes</span>
        </Link>

        {/* 3. Cafe & Coffee */}
        <Link
          to="/products?category=coffee-brews"
          className={`flex flex-col items-center gap-0.5 transition ${
            isCafe ? 'text-[#E31837] font-bold' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Coffee className={`w-5 h-5 ${isCafe ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[10px] tracking-tight">Cafe</span>
        </Link>

        {/* 4. Cart */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-gray-900 relative transition"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {totalItemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#E31837] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-bounce">
                {totalItemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Bag</span>
        </button>

        {/* 5. Account */}
        <Link
          to={user ? '/profile' : '/login'}
          className={`flex flex-col items-center gap-0.5 transition ${
            isProfile ? 'text-[#E31837] font-bold' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <User className={`w-5 h-5 ${isProfile ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[10px] tracking-tight">{user ? 'Account' : 'Login'}</span>
        </Link>

      </nav>
    </aside>
  );
}
