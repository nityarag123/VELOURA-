import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Mail, User, ShieldCheck, Sparkles, ArrowRight, CheckCircle2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, logout, user, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get('tab') === 'admin' ? 'admin' : 'customer';
  });
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  
  const [adminEmail, setAdminEmail] = useState('admin@veloura.com');
  const [adminPassword, setAdminPassword] = useState('admin123');

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in as ADMIN, navigate to /admin
  React.useEffect(() => {
    if (isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  const handleCustomerLogin = async (e) => {
    e.preventDefault();
    const cleanEmail = customerEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('Please enter your email address');
      return;
    }

    // If customer entered admin email, guide them to admin tab
    if (cleanEmail === 'admin@veloura.com' || cleanEmail.includes('admin')) {
      setActiveTab('admin');
      setAdminEmail(cleanEmail);
      setErrorMsg('admin@veloura.com is an administrator account. Please enter your admin password.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      await login(cleanEmail, '', customerName.trim());
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to sign in. Please try again.');
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
      setErrorMsg(err.message || 'Incorrect admin email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantCustomerLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await login('user@veloura.com', '', 'Aarav Sharma');
      navigate('/');
    } catch (err) {
      setErrorMsg('Failed to sign in as customer.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantAdminLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await login('admin@veloura.com', 'admin123');
      navigate('/admin');
    } catch (err) {
      setErrorMsg('Failed to sign in as admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-[#D8C7B5] luxury-mocha-texture">
      <div className="w-full max-w-md bg-[#E8DDD2] rounded-3xl border border-[#C4B19F] p-8 shadow-2xl space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <Link to="/" className="inline-block">
            <span className="font-serif italic text-3xl font-extrabold text-[#260D16] tracking-wide">
              VELOURA
            </span>
          </Link>
          <h2 className="font-serif text-xl font-bold text-[#160B0D] pt-1">
            {activeTab === 'customer' ? 'Customer Sign In' : 'Admin Operations Access'}
          </h2>
          <p className="text-xs text-[#8C5E43]">
            {activeTab === 'customer'
              ? 'Instant sign-in • No password required!'
              : 'Enter your administrative credentials'}
          </p>
        </div>

        {/* If user is currently signed in as Customer, show banner to switch */}
        {user && !isAdmin && (
          <div className="p-3.5 bg-amber-500/10 rounded-2xl border border-amber-600/30 flex items-center justify-between gap-3 text-xs">
            <div>
              <p className="text-[#8C5E43] text-[11px] font-semibold">Currently signed in as:</p>
              <p className="font-bold text-[#160B0D] truncate">{user.full_name || user.email}</p>
              <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">Customer Mode</span>
            </div>
            <button
              type="button"
              onClick={logout}
              className="px-2.5 py-1 text-xs font-bold bg-white text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition shadow-xs flex items-center gap-1"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* 1-Click Instant Demo Access Buttons */}
        <div className="p-3.5 rounded-2xl bg-[#D8C7B5]/60 border border-[#C4B19F] space-y-2">
          <p className="text-[11px] font-bold text-[#260D16] uppercase tracking-wider text-center">
            ⚡ 1-Click Instant Demo Access
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleInstantCustomerLogin}
              disabled={loading}
              className="py-2.5 px-2 bg-white hover:bg-white/80 text-[#160B0D] text-xs font-bold rounded-xl border border-[#C4B19F] transition shadow-xs text-center active:scale-95 disabled:opacity-50"
            >
              Customer Mode
            </button>
            <button
              type="button"
              onClick={handleInstantAdminLogin}
              disabled={loading}
              className="py-2.5 px-2 bg-[#260D16] hover:bg-[#3D121A] text-[#FAF6EE] text-xs font-bold rounded-xl transition shadow-xs text-center flex items-center justify-center gap-1 active:scale-95 disabled:opacity-50"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#D8B879]" />
              <span>Admin Console</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-[#D8C7B5] p-1 border border-[#C4B19F]">
          <button
            type="button"
            onClick={() => {
              setActiveTab('customer');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'customer'
                ? 'bg-[#260D16] text-[#FAF6EE] shadow-sm'
                : 'text-[#3D2820] hover:text-[#160B0D]'
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
                ? 'bg-[#260D16] text-[#FAF6EE] shadow-sm'
                : 'text-[#3D2820] hover:text-[#160B0D]'
            }`}
          >
            Admin (Password)
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/15 border border-red-500/30 text-red-900 text-xs rounded-xl font-medium">
            {errorMsg}
          </div>
        )}

        {/* CUSTOMER FORM: PASSWORD IS NOT NEEDED */}
        {activeTab === 'customer' && (
          <form onSubmit={handleCustomerLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#160B0D] mb-1">
                Your Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-[#C4B19F] rounded-xl focus:outline-none focus:border-[#260D16] font-medium"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#160B0D] mb-1">
                Full Name (Optional for First-Time Users)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Aarav Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-[#C4B19F] rounded-xl focus:outline-none focus:border-[#260D16] font-medium"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="p-3 bg-emerald-500/15 rounded-xl border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Password is not needed! Instant access with your email.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#260D16] hover:bg-[#3D121A] text-[#FAF6EE] text-xs font-bold uppercase tracking-wider rounded-full transition shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <span>{loading ? 'Signing In...' : 'Continue to Veloura'}</span>
              <ArrowRight className="w-4 h-4 text-[#D8B879]" />
            </button>
          </form>
        )}

        {/* ADMIN FORM: PASSWORD REQUIRED */}
        {activeTab === 'admin' && (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#160B0D] mb-1">
                Admin Email *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="admin@veloura.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-[#C4B19F] rounded-xl focus:outline-none focus:border-[#260D16] font-medium"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#160B0D] mb-1">
                Admin Password *
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-[#C4B19F] rounded-xl focus:outline-none focus:border-[#260D16] font-medium"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="p-3 bg-amber-500/15 rounded-xl border border-amber-500/30 text-xs text-amber-900">
              <span>Admin accounts require verified password authentication.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#260D16] hover:bg-[#3D121A] text-[#FAF6EE] text-xs font-bold uppercase tracking-wider rounded-full transition shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-[#D8B879]" />
              <span>{loading ? 'Authenticating...' : 'Sign In as Admin'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
