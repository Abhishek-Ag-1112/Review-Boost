'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createClient, isMockMode } from '@/lib/supabase';
import { Mail, Lock, LogIn, ArrowRight, UserPlus, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LoginPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Hydration safety mount check
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Fallback to mock mode if Supabase is unconfigured
    const isMock = isMockMode;

    if (isMock) {
      // Mock auth bypass for local sandbox demo
      setTimeout(() => {
        // Set a mock user session cookie
        document.cookie = `session=mock-session-cookie; path=/; max-age=3600`;
        setSuccess(isSignUp ? 'Mock Account Created!' : 'Logged in successfully!');
        setLoading(false);
        // Redirect to onboarding or dashboard depending on sign up / login
        window.location.href = isSignUp ? `/${locale}/onboarding` : `/${locale}/dashboard`;
      }, 1000);
      return;
    }

    try {
      const supabase = createClient();

      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: name
            }
          }
        });
        if (signUpError) throw signUpError;
        
        const session = data.session;
        if (!session) {
          throw new Error('Account created! Please check your email for a verification link to activate your account.');
        }
        
        const idToken = session.access_token;
        const res = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken })
        });
        
        if (!res.ok) throw new Error('Failed to create server session');
        
        setSuccess('Account created successfully!');
        window.location.href = `/${locale}/onboarding`;
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (signInError) throw signInError;
        
        const session = data.session;
        if (!session) {
          throw new Error('Failed to establish session.');
        }
        
        const idToken = session.access_token;
        const res = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken })
        });
        
        if (!res.ok) throw new Error('Failed to establish server session');

        setSuccess('Logged in successfully!');
        window.location.href = `/${locale}/dashboard`;
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const fillMockCredentials = () => {
    setEmail('merchant@reviewboost.com');
    setPassword('password123');
    setName('Rajesh Kumar');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row justify-center items-stretch overflow-hidden">
      {/* Left side brand banner (hidden on small mobile screens) */}
      <div className="hidden md:flex md:w-1/2 bg-emerald-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Background micro-accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-800 rounded-full blur-3xl opacity-50 transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-950 rounded-full blur-3xl opacity-60 transform -translate-x-1/3 translate-y-1/3" />

        <div className="relative flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-emerald-900 font-extrabold text-xl">
            R
          </div>
          <span className="font-extrabold text-white text-2xl tracking-tight">ReviewBoost</span>
        </div>

        <div className="relative space-y-6 max-w-md">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/60 border border-emerald-700/50 text-xs font-semibold text-emerald-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Built for Indian Businesses</span>
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            Turn every happy customer into a Google review.
          </h1>
          <p className="text-emerald-100/80 leading-relaxed font-medium">
            ReviewBoost helps restaurants, salons, clinics, and shops collect 10x more Google reviews while filtering negative complaints privately.
          </p>

          <div className="space-y-3 pt-6 border-t border-emerald-800">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-sm font-semibold text-emerald-100">AI-powered localized suggestions</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-sm font-semibold text-emerald-100">Private SMS & WhatsApp alerts</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-sm font-semibold text-emerald-100">NFC Tap Card & QR code standees</span>
            </div>
          </div>
        </div>

        <div className="relative text-xs text-emerald-300 font-medium">
          © 2026 ReviewBoost. All rights reserved.
        </div>
      </div>

      {/* Right side form */}
      <div className="flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-24 bg-white">
        <div className="w-full max-w-md mx-auto py-12">
          {/* Header */}
          <div className="mb-8 text-center md:text-left">
            <div className="md:hidden flex items-center justify-center gap-1.5 mb-6">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-extrabold text-sm">
                R
              </div>
              <span className="font-extrabold text-slate-900 tracking-tight text-lg">ReviewBoost</span>
            </div>

            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-sm text-slate-500 font-semibold mt-2">
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <button 
                type="button" 
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setSuccess('');
                }}
                className="text-emerald-600 hover:underline font-bold"
              >
                {isSignUp ? 'Sign In' : 'Sign Up Free'}
              </button>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rajesh Kumar"
                  className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="merchant@reviewboost.com"
                  className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold border border-red-100 flex items-center gap-1.5">
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100 flex items-center gap-1.5">
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-white font-bold bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 transform active:translate-y-px"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                  {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                </>
              )}
            </button>
          </form>

          {/* Dev mock convenience button */}
          {isMockMode && (
            <div className="mt-8 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Dev Helper (Mock Mode)</p>
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                Supabase credentials not configured in `.env.local`. Click below to fill mock credentials and bypass auth.
              </p>
              <button
                type="button"
                onClick={fillMockCredentials}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline"
              >
                Auto-fill Dev Credentials
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
