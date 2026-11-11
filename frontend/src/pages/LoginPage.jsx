import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, ShieldCheck, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [activeTab, setActiveTab] = useState('customer'); // 'customer' or 'admin'
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  
  const [adminEmail, setAdminEmail] = useState('admin@veloura.com');
  const [adminPassword, setAdminPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    if (user.is_admin) navigate('/admin');
    else navigate('/profile');
    return null;
  }

  const handleCustomerLogin = async (e) => {
    e.preventDefault();
    if (!customerEmail.trim()) {
      setErrorMsg('Please enter your email address');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      // Customer login: PASSWORD NOT NEEDED!
      await login(customerEmail.trim().toLowerCase(), '', customerName.trim());
      navigate('/');
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!adminEmail.trim() || !adminPassword.trim()) {
      setErrorMsg('Admin email and password are required');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      await login(adminEmail.trim().toLowerCase(), adminPassword);
      navigate('/admin');
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Incorrect admin email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role) => {
    if (role === 'customer') {
      setCustomerEmail('user@veloura.com');
      setCustomerName('Aarav Sharma');
      setActiveTab('customer');
    } else {
      setAdminEmail('admin@veloura.com');
      setAdminPassword('admin123');
      setActiveTab('admin');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-2xl space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <Link to="/" className="inline-block">
            <span className="font-serif italic text-3xl font-extrabold text-[#E31837] tracking-wide">
              veloura
            </span>
          </Link>
          <h2 className="font-serif text-xl font-bold text-gray-900 pt-1">
            {activeTab === 'customer' ? 'Customer Sign In' : 'Admin Operations Access'}
          </h2>
          <p className="text-xs text-gray-400">
            {activeTab === 'customer'
              ? 'Instant sign-in • No password required!'
              : 'Enter your administrative credentials'}
          </p>
        </div>

        {/* 1-Click Demo Buttons */}
        <div className="p-3 rounded-2xl bg-red-50 border border-red-100 space-y-2">
          <p className="text-[11px] font-bold text-[#E31837] uppercase tracking-wider text-center">
            ⚡ Quick 1-Click Demo Credentials
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('customer')}
              className="py-1.5 px-2 bg-white hover:bg-gray-50 text-gray-800 text-xs font-semibold rounded-xl border border-gray-200 transition shadow-2xs"
            >
              Fill Customer Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="py-1.5 px-2 bg-[#E31837] hover:bg-[#C51132] text-white text-xs font-semibold rounded-xl transition shadow-2xs"
            >
              Fill Admin Demo
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-gray-100 p-1 border border-gray-200">
          <button
            type="button"
            onClick={() => {
              setActiveTab('customer');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'customer'
                ? 'bg-white text-[#E31837] shadow-xs'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            Customer (Passwordless)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'admin'
                ? 'bg-white text-[#E31837] shadow-xs'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            Admin (Password)
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {errorMsg}
          </div>
        )}

        {/* CUSTOMER FORM: PASSWORD IS NOT NEEDED */}
        {activeTab === 'customer' && (
          <form onSubmit={handleCustomerLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Your Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#E31837] font-medium"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Full Name (Optional for First-Time Users)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Aarav Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#E31837] font-medium"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Password is not needed! Instant access with your email.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#E31837] hover:bg-[#C51132] text-white text-xs font-bold uppercase tracking-wider rounded-full transition shadow-md flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Signing In...' : 'Continue to Veloura'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ADMIN FORM: PASSWORD REQUIRED */}
        {activeTab === 'admin' && (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Admin Email *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="admin@veloura.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#E31837] font-medium"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Admin Password *
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#E31837] font-medium"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
              <span>Admin accounts require verified password authentication.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gray-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-full transition shadow-md flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-[#FFD166]" />
              <span>{loading ? 'Authenticating...' : 'Sign In as Admin'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
