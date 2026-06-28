'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, QrCode, Star, Smartphone, RefreshCw, BarChart2, Check, Award, Lock, ArrowUpRight, ChevronDown } from 'lucide-react';

export default function MarketingPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const [funnelType, setFunnelType] = useState<'smart' | 'direct'>('smart');
  
  // Interactive mock states for the live AI Suggestions demo
  const [mockRating, setMockRating] = useState<number>(5);
  const [mockSelectedChip, setMockSelectedChip] = useState<'Ambiance' | 'Service' | 'Value'>('Ambiance');
  const [mockReviewText, setMockReviewText] = useState("The ambiance was absolutely wonderful and the setup was extremely clean. Highly recommend!");

  const mockSuggestions = {
    Ambiance: "The ambiance was absolutely wonderful and the setup was extremely clean. Highly recommend!",
    Service: "The staff were extremely helpful and the service was prompt. Excellent hospitality!",
    Value: "Great value for money, high-quality offerings, and a top-notch experience."
  };

  const handleChipClick = (type: 'Ambiance' | 'Service' | 'Value') => {
    setMockSelectedChip(type);
    setMockReviewText(mockSuggestions[type]);
  };

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "How does the Smart Review Funnel work?",
      a: "The Smart Funnel routes happy customers (who rate 4-5 stars) to your Google Review page, while capturing private feedback from unhappy customers (who rate 1-3 stars) through a private form. This lets you resolve issues privately and protect your online rating."
    },
    {
      q: "What are AI Suggestions and how do they help?",
      a: "ReviewPe uses advanced AI to generate 3 custom review suggestions tailored to your business category, language, and vibe (e.g., highlights of your service, ambiance, or quality). Customers click a suggestion chip, and we pre-format the text so they can write detailed reviews in seconds."
    },
    {
      q: "Can I use ReviewPe with NFC stands or cards?",
      a: "Absolutely! You can link your ReviewPe slug URL to any NFC cards, tags, or tabletop stands. Additionally, we generate custom-designed QR codes for each location that you can print and display on billing counters or tables."
    },
    {
      q: "Are there any limits on scan redirections?",
      a: "The Free Trial allows up to 50 scan redirections per month. Both our Starter and Growth paid plans include unlimited scan redirections, so you can collect reviews without worrying about limits."
    },
    {
      q: "How does the manual plan upgrade process work?",
      a: "To upgrade, select your plan in the Billing tab and click the manual upgrade button. You can request activation via WhatsApp or email, and our team will coordinate the invoice and enable the upgraded limits for your account."
    }
  ];

  return (
    <div 
      className="min-h-screen bg-[#FDFDFD] text-slate-800 font-sans antialiased relative overflow-hidden flex flex-col justify-between"
      style={{ 
        backgroundImage: 'radial-gradient(rgba(16, 185, 129, 0.03) 1.5px, transparent 1.5px)', 
        backgroundSize: '32px 32px' 
      }}
    >
      
      {/* Premium Ambient Background Lighting */}
      <div className="absolute top-[-5%] left-[-5%] w-[600px] h-[600px] rounded-full bg-emerald-400/10 blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-[25%] right-[-10%] w-[700px] h-[700px] rounded-full bg-indigo-400/8 blur-[160px] pointer-events-none -z-10" />
      <div className="absolute bottom-[8%] left-[15%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none -z-10" />

      {/* Navbar */}
      <header className="sticky top-0 bg-white/75 backdrop-blur-lg border-b border-slate-100/80 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100/65 flex items-center justify-center shadow-sm">
              <img src="/icon.png" alt="ReviewPe Icon" className="w-6.5 h-6.5 object-contain" />
            </div>
            <span className="font-black text-slate-900 tracking-tight text-xl">
              Review<span className="text-emerald-600">Pe</span>
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link 
              href={`/${locale}/pricing`} 
              className="text-xs font-black text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider hidden sm:inline"
            >
              Pricing
            </Link>
            <Link 
              href={`/${locale}/login`} 
              className="text-xs font-black text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider"
            >
              Sign In
            </Link>
            <Link 
              href={`/${locale}/login`} 
              className="text-xs font-black px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md hover:shadow-emerald-600/15 active:scale-[0.98] shrink-0"
            >
              <span className="sm:hidden">Start Free</span>
              <span className="hidden sm:inline">Get Started Free</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content wrapper */}
      <main className="flex-1 flex flex-col items-center">
        
        {/* HERO SECTION */}
        <section className="max-w-6xl w-full mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading & CTAs */}
          <div className="lg:col-span-7 text-left space-y-7">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50/70 border border-emerald-100/60 text-xs font-black text-emerald-700 uppercase tracking-widest shadow-sm">
              <Sparkles className="w-3.5 h-3.5 fill-emerald-100 text-emerald-600 animate-pulse" />
              <span>India-First Review Funnel Platform</span>
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-[56px] font-black text-slate-950 tracking-tight leading-[1.08] max-w-2xl">
              Supercharge your Google reviews with{' '}
              <span className="relative inline-block text-emerald-600">
                <span className="relative z-10 bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">AI Suggestions</span>
                <span className="absolute bottom-1 left-0 w-full h-3 bg-emerald-100/50 -z-10 rounded-full" />
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-500 font-semibold max-w-xl leading-relaxed">
              Supercharge your review collection with smart QR codes. Empower customers to write detailed reviews in seconds using native-language AI suggestions, while private feedback protects your rating.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-3">
              <Link 
                href={`/${locale}/login`} 
                className="h-14 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-wider transition-all shadow-lg hover:shadow-emerald-600/25 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <span>Start 30-Day Free Trial</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </Link>
              <Link 
                href={`/${locale}/pricing`} 
                className="h-14 px-8 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-black text-sm uppercase tracking-wider transition-all shadow-sm flex items-center justify-center active:scale-[0.98]"
              >
                View Pricing Plans
              </Link>
            </div>

            {/* Micro proof badges */}
            <div className="flex items-center gap-6 pt-6 border-t border-slate-100 max-w-md">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Check className="w-3 h-3 text-emerald-600 stroke-[3px]" />
                </div>
                <span className="text-xs font-bold text-slate-500">No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Check className="w-3 h-3 text-emerald-600 stroke-[3px]" />
                </div>
                <span className="text-xs font-bold text-slate-500">First Month Free</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive AI suggestions Preview widget (designed like macOS Window) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[390px] bg-white rounded-[32px] border border-slate-100 shadow-2xl overflow-hidden relative group transition-all duration-350 hover:shadow-emerald-500/5">
              
              {/* macOS Control Bar */}
              <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400 block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400 block" />
                </div>
                <div className="bg-white/80 border border-slate-150/50 rounded-lg text-xs text-slate-400 font-bold px-3 py-0.5 mx-auto w-40 text-center truncate">
                  reviewpe.online/r/dominos
                </div>
              </div>

              {/* Demo Window Content */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black flex items-center justify-center text-base shadow-sm">
                    D
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">Domino&apos;s Pizza</h4>
                    <span className="text-xs font-bold text-slate-400">Share your genuine review</span>
                  </div>
                </div>

                {/* Star selection simulator */}
                <div className="flex justify-center gap-2 mb-5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setMockRating(star)}
                      className="p-1 transition-transform active:scale-90 hover:scale-105"
                    >
                      <Star className={`w-8 h-8 ${star <= mockRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                    </button>
                  ))}
                </div>

                {/* Mock dynamic display based on rating */}
                {mockRating >= 4 ? (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="p-3.5 bg-emerald-50/50 border border-emerald-100/60 rounded-2xl text-xs font-bold text-emerald-800 text-center flex items-center justify-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Happy Customer! AI Suggestion Chips unlocked:</span>
                    </div>

                    {/* Suggestion Chips */}
                    <div className="flex gap-2 justify-center">
                      {(['Ambiance', 'Service', 'Value'] as const).map((chip) => (
                        <button
                          key={chip}
                          onClick={() => handleChipClick(chip)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-black border transition-all ${
                            mockSelectedChip === chip 
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' 
                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>

                    {/* TextArea review content */}
                    <div className="relative">
                      <textarea
                        readOnly
                        value={mockReviewText}
                        className="w-full text-xs p-3.5 rounded-2xl border border-slate-200 text-slate-600 font-semibold bg-slate-50/70 focus:outline-none h-24 resize-none leading-relaxed"
                      />
                      <Sparkles className="absolute right-3.5 bottom-3.5 w-4 h-4 text-emerald-600/35" />
                    </div>

                    <button className="w-full bg-slate-900 text-white font-extrabold text-xs py-3.5 rounded-2xl flex items-center justify-center gap-1.5 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10">
                      <span>Post Review on Google Maps</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="p-3.5 bg-rose-50 border border-rose-100/60 rounded-2xl text-xs font-bold text-rose-800 text-center">
                      🛑 Smart Funnel: Capturing private feedback
                    </div>
                    <textarea
                      placeholder="We apologize. Please share what went wrong..."
                      className="w-full text-xs p-3.5 rounded-2xl border border-slate-200 text-slate-600 bg-slate-50 focus:outline-none h-24 resize-none"
                    />
                    <button className="w-full bg-emerald-600 text-white font-extrabold text-xs py-3.5 rounded-2xl flex items-center justify-center hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/10">
                      Submit Private Feedback
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES GRID SECTION */}
        <section className="w-full border-t border-slate-100/80 bg-white py-24 relative">
          <div className="max-w-6xl mx-auto px-6">
            
            <div className="text-center max-w-2xl mx-auto mb-20 space-y-3">
              <span className="text-xs font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-100/80">
                Core Capabilities
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-955 tracking-tight">
                Get more 5-star reviews on auto-pilot
              </h2>
              <p className="text-base text-slate-500 font-semibold leading-relaxed">
                ReviewPe combines smart routing with generative AI to make leaving customer reviews effortless.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group bg-[#FDFDFD] hover:bg-white p-8 rounded-[32px] border border-slate-100 hover:border-emerald-500/20 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-350 hover:-translate-y-1">
                <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg mt-6">Smart Review Funnel</h3>
                <p className="text-sm text-slate-500 font-semibold mt-2.5 leading-relaxed">
                  Automatically redirect 4-5 star ratings directly to Google Maps, while routing 1-3 star feedbacks to a private form to resolve internally.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group bg-[#FDFDFD] hover:bg-white p-8 rounded-[32px] border border-slate-100 hover:border-emerald-500/20 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-350 hover:-translate-y-1">
                <div className="w-13 h-13 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg mt-6">AI Suggestions</h3>
                <p className="text-sm text-slate-500 font-semibold mt-2.5 leading-relaxed">
                  Help users write authentic reviews in seconds with 3 AI suggestion chips generated instantly matching your vibe, theme, and language.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group bg-[#FDFDFD] hover:bg-white p-8 rounded-[32px] border border-slate-100 hover:border-emerald-500/20 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-350 hover:-translate-y-1">
                <div className="w-13 h-13 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg mt-6">NFC & QR Review Stands</h3>
                <p className="text-sm text-slate-500 font-semibold mt-2.5 leading-relaxed">
                  Collect reviews instantly in-store by placing dynamic QR custom stands or smart NFC tap cards on customer tables or checkout counters.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING BRIEF SECTION */}
        <section className="border-t border-slate-100/80 py-24 w-full bg-[#FAFAFB]">
          <div className="max-w-4xl mx-auto text-center px-6 space-y-8">
            <div className="space-y-3">
              <span className="text-xs font-black px-3.5 py-1 rounded-full bg-emerald-55/50 border border-emerald-100 text-emerald-700 uppercase tracking-widest">
                Simple Pricing
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-955 tracking-tight">
                Pricing plans that scale with you
              </h2>
              <p className="text-base font-semibold text-slate-500 max-w-md mx-auto">
                First month is completely free for all new signups — no credit card required.
              </p>
            </div>

            {/* Funnel Type Selector Toggle */}
            <div className="flex justify-center my-8">
              <div className="bg-slate-200/50 p-1.5 rounded-2xl inline-flex border border-slate-200/60 shadow-inner flex-wrap justify-center gap-1.5">
                <button
                  onClick={() => setFunnelType('smart')}
                  className={`px-6 py-3 rounded-xl text-xs font-black tracking-wide uppercase transition-all ${funnelType === 'smart' ? 'bg-white text-emerald-800 shadow-md border border-slate-200/30' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Smart Funnel (Filters Reviews)
                </button>
                <button
                  onClick={() => setFunnelType('direct')}
                  className={`px-6 py-3 rounded-xl text-xs font-black tracking-wide uppercase transition-all ${funnelType === 'direct' ? 'bg-white text-indigo-800 shadow-md border border-slate-200/30' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Direct Funnel (Direct Reviews)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-8">
              
              {/* Starter Card */}
              <div className="bg-white p-8 md:p-10 rounded-[32px] border border-slate-150 text-left flex flex-col justify-between hover:shadow-xl transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-slate-900 text-lg">
                      {funnelType === 'smart' ? 'Starter Plan' : 'Starter Direct Plan'}
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-slate-400 block mt-1">Best for single physical stores</span>
                  
                  <div className="my-6">
                    <span className="text-4xl font-black text-slate-900">₹399</span>
                    <span className="text-slate-400 text-sm font-bold ml-1">/ month</span>
                  </div>
                  
                  <div className="border-t border-slate-100 pt-6 mt-2 space-y-4">
                    <div className="flex items-start gap-3 text-sm text-slate-600 font-bold">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-emerald-600 stroke-[3px]" />
                      </div>
                      <span>1 Business Location</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-slate-600 font-bold">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-emerald-600 stroke-[3px]" />
                      </div>
                      <span>1 Registered NFC Card</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-slate-600 font-bold">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-emerald-600 stroke-[3px]" />
                      </div>
                      <span>Unlimited Scan Redirections</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-slate-600 font-bold">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-emerald-600 stroke-[3px]" />
                      </div>
                      <span>{funnelType === 'smart' ? 'Private Gated Feedback Form' : 'Direct Google Review Routing'}</span>
                    </div>
                  </div>
                </div>
                <Link
                  href={`/${locale}/login`}
                  className="w-full mt-10 bg-slate-900 hover:bg-slate-800 text-white py-3.5 px-4 rounded-2xl text-sm font-black uppercase tracking-wider text-center transition-all shadow-md active:scale-[0.98]"
                >
                  Start Free Trial
                </Link>
              </div>

              {/* Growth Card */}
              <div className="bg-white p-8 md:p-10 rounded-[32px] border-2 border-emerald-500 text-left flex flex-col justify-between hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-emerald-600 text-white font-black text-xs uppercase tracking-widest px-5 py-2 rounded-bl-2xl shadow-sm">
                  Popular
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">
                    {funnelType === 'smart' ? 'Growth Plan' : 'Growth Direct Plan'}
                  </h3>
                  <span className="text-xs font-bold text-slate-400 block mt-1">Best for franchises & chains</span>
                  
                  <div className="my-6">
                    <span className="text-4xl font-black text-slate-900">₹799</span>
                    <span className="text-slate-400 text-sm font-bold ml-1">/ month</span>
                  </div>
                  
                  <div className="border-t border-slate-100 pt-6 mt-2 space-y-4">
                    <div className="flex items-start gap-3 text-sm text-slate-600 font-bold">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-emerald-600 stroke-[3px]" />
                      </div>
                      <span>Up to 3 Locations & Branches</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-slate-600 font-bold">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-emerald-600 stroke-[3px]" />
                      </div>
                      <span>Up to 3 Registered NFC Cards</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-slate-600 font-bold">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-emerald-600 stroke-[3px]" />
                      </div>
                      <span>Heatmap Peak Times Analytics</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-slate-600 font-bold">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-emerald-600 stroke-[3px]" />
                      </div>
                      <span>No Branding (White Label)</span>
                    </div>
                  </div>
                </div>
                <Link
                  href={`/${locale}/login`}
                  className="w-full mt-10 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-4 rounded-2xl text-sm font-black uppercase tracking-wider text-center transition-all shadow-md hover:shadow-emerald-600/15 active:scale-[0.98]"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>

            <div className="pt-8">
              <Link
                href={`/${locale}/pricing`}
                className="inline-flex items-center gap-1.5 text-sm font-black text-emerald-700 hover:text-emerald-950 transition-colors uppercase tracking-wider"
              >
                <span>View Full Features Comparison Matrix</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ ACCORDION SECTION */}
        <section className="w-full border-t border-slate-100 bg-white py-24 relative">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-16 space-y-3">
              <span className="text-xs font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-100">
                Common Questions
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-base text-slate-500 font-semibold leading-relaxed">
                Have questions about ReviewPe? Here are answers to the most common queries.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div 
                  key={idx} 
                  className="bg-[#FAFAFB] border border-slate-100 rounded-[24px] overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-6 text-left cursor-pointer transition-colors hover:bg-slate-100/40"
                  >
                    <span className="font-extrabold text-slate-900 text-base pr-4">
                      {faq.q}
                    </span>
                    <ChevronDown 
                      className={`w-5 h-5 text-slate-450 transition-transform duration-300 shrink-0 ${openFaqIndex === idx ? 'rotate-180 text-emerald-600' : ''}`} 
                    />
                  </button>
                  
                  <div 
                    className={`transition-all duration-350 ease-in-out overflow-hidden ${
                      openFaqIndex === idx ? 'max-h-52 border-t border-slate-100/50' : 'max-h-0'
                    }`}
                  >
                    <div className="p-6 text-sm text-slate-500 font-semibold leading-relaxed">
                      {faq.a}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12 text-center text-xs text-slate-450 font-black tracking-wide uppercase">
        Powered by ReviewPe. Developed for local stores and service shops.
      </footer>
    </div>
  );
}
