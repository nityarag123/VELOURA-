import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import AnnouncementBar from './components/common/AnnouncementBar';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import CartDrawer from './components/cart/CartDrawer';
import MobileHomeBar from './components/common/MobileHomeBar';

import HomePage from './pages/HomePage';
import ProductListingPage from './pages/ProductListingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import UserProfilePage from './pages/UserProfilePage';
import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <div className="min-h-screen flex flex-col bg-[#FFFDF9] text-[#2D2020]">
              <AnnouncementBar />
              <Header />
              <CartDrawer />
              
              <main className="flex-1 pb-16 md:pb-0">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/products" element={<ProductListingPage />} />
                  <Route path="/product/:slug" element={<ProductDetailPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
                  <Route path="/profile" element={<UserProfilePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/admin" element={<AdminDashboardPage />} />
                </Routes>
              </main>

              <Footer />
              <MobileHomeBar />
            </div>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
