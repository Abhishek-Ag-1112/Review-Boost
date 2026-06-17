import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, QrCode, Star, Smartphone, RefreshCw, BarChart2 } from 'lucide-react';

export default function MarketingPage({ params }: { params: { locale: string } }) {
  const { locale } = params;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between overflow-y-auto">
      {/* Navbar */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/icon.png" alt="ReviewPe Icon" className="w-8 h-8 object-contain rounded-lg" />
            <span className="font-extrabold text-slate-900 tracking-tight text-lg">Review<span className="text-emerald-600">Pe</span></span>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href={`/${locale}/pricing`} 
              className="text-xs font-extrabold text-slate-550 hover:text-slate-900 transition-colors uppercase tracking-wider hidden sm:inline"
            >
              Pricing
            </Link>
            <Link 
              href={`/${locale}/login`} 
              className="text-xs font-extrabold text-slate-550 hover:text-slate-900 transition-colors uppercase tracking-wider"
            >
              Sign In
            </Link>
            <Link 
              href={`/${locale}/login`} 
              className="text-xs font-bold px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm shrink-0"
            >
              <span className="sm:hidden">Start Free</span>
              <span className="hidden sm:inline">Get Started Free</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-16 md:py-24 flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-700 mb-6">
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>India-First Review Funnel Platform</span>
        </span>

        <h1 className="text-4xl md:text-6xl font-black text-slate-950 tracking-tight max-w-3xl leading-tight">
          Turn every happy customer into a <span className="text-emerald-600">Google review</span>
        </h1>
        
        <p className="text-base md:text-lg text-slate-500 font-medium max-w-2xl mt-6 leading-relaxed">
          A smart QR code review funnel that filters ratings: happy customers are directed to post on Google, while private feedback alerts you of issues before they go public.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <Link 
            href={`/${locale}/login`} 
            className="h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Start 30-Day Free Trial</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link 
            href={`/${locale}/pricing`} 
            className="h-12 px-6 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold transition-all shadow-sm flex items-center justify-center cursor-pointer"
          >
            View Pricing Plans
          </Link>
        </div>

        {/* Small Features Grid */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-24 mb-16">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Smart Review Funnel</h3>
            <p className="text-xs text-slate-400 font-medium mt-2 leading-relaxed">
              Redirect 4-5 stars rating to Google Maps. Collect 1-3 star feedback via private form and notify owners instantly.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-left">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Claude AI Suggestions</h3>
            <p className="text-xs text-slate-400 font-medium mt-2 leading-relaxed">
              Empower customers to write detailed reviews in seconds with 3 authentic suggestions written in their native script.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-left">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">NFC Tap & QR Cards</h3>
            <p className="text-xs text-slate-400 font-medium mt-2 leading-relaxed">
              Place QR codes on billing stands, restaurant tables, or ship printed NFC tags to collect reviews directly.
            </p>
          </div>
        </div>

        {/* Pricing plans brief section */}
        <section className="border-t border-slate-200 pt-16 pb-8 w-full">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-2">
              <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 uppercase tracking-widest">
                Simple Pricing
              </span>
              <h2 className="text-3xl font-black text-slate-950 tracking-tight">
                Choose the plan that fits your business
              </h2>
              <p className="text-xs font-semibold text-slate-400 max-w-md mx-auto">
                First month is completely free for all new signups — no credit card required.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 text-left flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Starter Plan</h3>
                  <span className="text-[9px] font-bold text-slate-400 block mt-0.5">Best for single physical stores</span>
                  <div className="my-4">
                    <span className="text-2xl font-black text-slate-900">₹399</span>
                    <span className="text-slate-400 text-xs font-bold">/ month</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                    1 business location, 1 NFC card support, unlimited scans, branded QR customizer, private feedback routing, and 30-day analytics history.
                  </p>
                </div>
                <Link
                  href={`/${locale}/login`}
                  className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white py-2.5 px-4 rounded-xl text-xs font-bold text-center transition-colors"
                >
                  Start Free Trial
                </Link>
              </div>

              <div className="bg-white p-6 rounded-3xl border-2 border-emerald-500 text-left flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-emerald-600 text-white font-black text-[8px] uppercase tracking-widest px-3 py-1 rounded-bl-xl">
                  Popular
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Growth Plan</h3>
                  <span className="text-[9px] font-bold text-slate-400 block mt-0.5">Best for franchises & chains</span>
                  <div className="my-4">
                    <span className="text-2xl font-black text-slate-900">₹799</span>
                    <span className="text-slate-400 text-xs font-bold">/ month</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                    Up to 3 physical locations, 3-month analytics history, peak time heatmap analytics, CSV exports, white-label toggles, and API access.
                  </p>
                </div>
                <Link
                  href={`/${locale}/login`}
                  className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-xl text-xs font-bold text-center transition-colors shadow-sm"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href={`/${locale}/pricing`}
                className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 hover:text-emerald-950 transition-colors uppercase tracking-wider"
              >
                <span>View Full Features Comparison Matrix</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-8 text-center text-xs text-slate-400 font-medium">
        Powered by ReviewPe. Developed for local stores and service shops.
      </footer>
    </div>
  );
}
