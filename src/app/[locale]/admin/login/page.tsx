'use client';

import React, { useState, useEffect } from 'react';
import { createClient, isMockMode } from '@/lib/supabase';
import { Mail, Lock, LogIn, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AdminLoginPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Hydration safety mount check
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Fallback to mock mode if Supabase is unconfigured
    const isMock = isMockMode;

    if (isMock) {
      // Mock admin auth bypass for local sandbox demo
      setTimeout(() => {
        // Set a mock admin session cookie
        document.cookie = `session=mock-admin-session-cookie; path=/; max-age=3600`;
        setSuccess('Logged in successfully as Admin!');
        setLoading(false);
        // Redirect to system admin console
        window.location.href = `/${locale}/admin`;
      }, 1000);
      return;
    }

    try {
      const supabase = createClient();

      // Check client-side first if the email matches the authorized admin email
      const authorizedAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@reviewpe.online';
      if (email.toLowerCase().trim() !== authorizedAdminEmail.toLowerCase().trim()) {
        throw new Error('Unauthorized. Access is restricted to system administrators only.');
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (signInError) throw signInError;

      const session = data.session;
      if (!session) {
        throw new Error('Failed to establish admin session.');
      }
      
      const idToken = session.access_token;
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });
      
      if (!res.ok) throw new Error('Failed to establish admin server session.');

      setSuccess('Administrator access granted. Redirecting...');
      setTimeout(() => {
        window.location.href = `/${locale}/admin`;
      }, 500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during administrator authentication.');
    } finally {
      setLoading(false);
    }
  };

  const fillMockAdminCredentials = () => {
    setEmail('admin@reviewpe.online');
    setPassword('adminpassword123');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row justify-center items-stretch overflow-hidden font-sans">
      {/* Left side branding banner */}
      <div className="hidden md:flex md:w-1/2 bg-slate-950 text-white flex-col justify-between p-12 relative overflow-hidden border-r border-slate-800">
        {/* Background micro-accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-950 rounded-full blur-3xl opacity-40 transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-900 rounded-full blur-3xl opacity-50 transform -translate-x-1/3 translate-y-1/3" />

        <div className="relative flex items-center gap-2">
          <img src="/icon.png" alt="ReviewPe Icon" className="w-9 h-9 object-contain rounded-xl bg-slate-800 p-1" />
          <span className="font-extrabold text-white text-2xl tracking-tight">ReviewPe</span>
          <span className="text-[9px] font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded uppercase tracking-wider ml-1">
            Console
          </span>
        </div>

        <div className="relative space-y-6 max-w-md">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-800/50 text-xs font-bold text-indigo-400">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Secure Admin Access</span>
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            System Administration Portal.
          </h1>
          <p className="text-slate-400 leading-relaxed font-medium">
            Manage merchants, configure manual renewals, modify plan limits, and monitor system-wide review flows.
          </p>
        </div>

        <div className="relative text-xs text-slate-500 font-semibold">
          Secure Administrator Access. Unauthorized attempts are logged.
        </div>
      </div>

      {/* Right side form */}
      <div className="flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-24 bg-slate-900">
        <div className="w-full max-w-md mx-auto py-12">
          {/* Header */}
          <div className="mb-8 text-center md:text-left">
            <div className="md:hidden flex items-center justify-center gap-1.5 mb-6">
              <img src="/icon.png" alt="ReviewPe Icon" className="w-7 h-7 object-contain rounded-lg" />
              <span className="font-extrabold text-white tracking-tight text-lg">ReviewPe</span>
            </div>

            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Sign in as Admin
            </h2>
            <p className="text-sm text-slate-400 font-semibold mt-2">
              Enter your system credentials below to assess the console.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAdminAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full text-sm pl-10 pr-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Admin Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm pl-10 pr-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/40 text-rose-400 text-xs font-semibold border border-rose-900/50 flex items-center gap-1.5 leading-relaxed">
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-xl bg-emerald-950/40 text-emerald-400 text-xs font-semibold border border-emerald-900/50 flex items-center gap-1.5 leading-relaxed">
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-white font-bold bg-indigo-650 hover:bg-indigo-700 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 transform active:translate-y-px"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Authenticate Admin</span>
                  <LogIn className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Dev mock convenience button */}
          {isMockMode && (
            <div className="mt-8 p-4 bg-slate-850/50 border border-slate-800 rounded-2xl">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Dev Helper (Mock Mode)</p>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                Supabase credentials not configured in `.env.local`. Click below to fill mock credentials and bypass auth.
              </p>
              <button
                type="button"
                onClick={fillMockAdminCredentials}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline"
              >
                Auto-fill Mock Admin
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
