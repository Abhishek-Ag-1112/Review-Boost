'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, X, ArrowLeft, ChevronDown, MessageCircle, Mail, Sparkles, Shield, User, Globe, HelpCircle } from 'lucide-react';

interface PricingPageProps {
  params: {
    locale: string;
  };
}

export default function PricingPage({ params }: PricingPageProps) {
  const { locale } = params;

  // Accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  // Toggle State: 'smart' | 'direct'
  const [funnelType, setFunnelType] = useState<'smart' | 'direct'>('smart');

  const faqItems = [
    {
      q: "What is the difference between Smart and Direct Funnels?",
      a: "The Smart Funnel routes 4-5 star reviews directly to Google, while collecting 1-3 star reviews privately to protect your reputation. The Direct Funnel bypasses the private form entirely and sends all star ratings directly to Google Maps."
    },
    {
      q: "What is your cancellation policy?",
      a: "ReviewPe has no long-term contracts. You can cancel your subscription renewal at any time. Simply contact the support admin or pause your manual renewal, and your account will gracefully transition to the inactive status without any exit fees or penalties."
    },
    {
      q: "Can I switch between plans?",
      a: "Yes! You can request a switch between Starter and Growth (including standard/direct models) at any point. Our administrator will manually adjust your limits, update the billing records, and instantly apply the corresponding features to your merchant profile."
    },
    {
      q: "Do you support UPI payments?",
      a: "Absolutely. We support all Indian payment methods including UPI (Google Pay, PhonePe, Paytm, BHIM), local credit/debit cards, and net banking. Payments are manually processed and matched by our administrator for instant activation."
    },
    {
      q: "I have more than 3 locations. Can I expand further?",
      a: "Yes. For enterprises or franchises requiring more than 3 business locations/NFC cards, we offer customized Enterprise plans. Please contact the admin directly to set up bulk licensing and dedicated support."
    }
  ];

  const features = [
    { name: "Free Plan Benefit", starter: "First month FREE ✓", growth: "First month FREE ✓", isHighlight: true },
    { name: "Location Branches Limit", starter: "1 Location", growth: "Up to 3 Locations" },
    { name: "NFC Cards Supported", starter: "1 NFC Card", growth: "Up to 3 NFC Cards" },
    { name: "Analytics History", starter: "Up to 30 Days", growth: "3 Months History" },
    { name: "Peak Scans Heatmap", starter: false, growth: true },
    { name: "CSV Export (Scan & Feedback Logs)", starter: false, growth: true },
    { name: "White-label Options (Remove Brand)", starter: false, growth: true },
    { name: "Public Developer API Access", starter: false, growth: true },
    ...(funnelType === 'smart' ? [
      { name: "Smart Review Routing (4-5★ to Google)", starter: true, growth: true },
      { name: "Private Feedback Form (1-3★)", starter: true, growth: true },
    ] : [
      { name: "Direct Google Reviews (All 1-5★)", starter: true, growth: true },
      { name: "Private Feedback Form (1-3★)", starter: false, growth: false },
    ]),
    { name: "AI Review Suggestions", starter: true, growth: true },
    { name: "Email + WhatsApp Alerts", starter: true, growth: true }
  ];

  const supportEmail = 'abhishek040478@gmail.com';
  const supportPhone = '+918829095225';
  const starterText = funnelType === 'smart' 
    ? "Hello Support, I would like to subscribe to the Starter Plan (₹399/mo) after my free plan period."
    : "Hello Support, I would like to subscribe to the Starter Direct Plan (₹399/mo) after my free plan period.";
  const growthText = funnelType === 'smart'
    ? "Hello Support, I would like to subscribe to the Growth Plan (₹799/mo) after my free plan period."
    : "Hello Support, I would like to subscribe to the Growth Direct Plan (₹799/mo) after my free plan period.";

  return (
    <div 
      className="min-h-screen bg-[#FDFDFD] text-slate-800 font-sans antialiased relative overflow-hidden pb-20"
      style={{ 
        backgroundImage: 'radial-gradient(rgba(16, 185, 129, 0.03) 1.5px, transparent 1.5px)', 
        backgroundSize: '32px 32px' 
      }}
    >
      
      {/* Premium Ambient Background Lighting */}
      <div className="absolute top-[-5%] left-[-5%] w-[600px] h-[600px] rounded-full bg-emerald-400/10 blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-[20%] right-[-10%] w-[700px] h-[700px] rounded-full bg-indigo-400/8 blur-[160px] pointer-events-none -z-10" />
      <div className="absolute bottom-[10%] left-[15%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none -z-10" />
      
      {/* Header Navigation */}
      <header className="sticky top-0 bg-white/75 backdrop-blur-lg border-b border-slate-100/80 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link 
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 text-xs font-black uppercase tracking-wider transition-all"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3px]" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-sm">
              <img src="/icon.png" alt="ReviewPe Icon" className="w-6.5 h-6.5 object-contain" />
            </div>
            <span className="font-black text-slate-900 tracking-tight text-base">
              Review<span className="text-emerald-600">Pe</span>
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto px-6 pt-16 pb-12">
        <span className="inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 uppercase tracking-widest shadow-sm">
          <Sparkles className="w-3.5 h-3.5 fill-emerald-100 text-emerald-600 animate-pulse" />
          <span>Limited-Time Free Plan Benefit</span>
        </span>
        
        <h1 className="text-4xl sm:text-5xl md:text-[56px] font-black text-slate-950 tracking-tight mt-5 leading-[1.1]">
          Simple pricing.{' '}
          <span className="relative inline-block text-emerald-600">
            <span className="relative z-10 bg-gradient-to-r from-emerald-600 to-indigo-600 bg-clip-text text-transparent">No surprises.</span>
            <span className="absolute bottom-1 left-0 w-full h-3 bg-emerald-100/50 -z-10 rounded-full" />
          </span>
        </h1>
        
        <p className="text-base sm:text-lg font-semibold text-slate-500 mt-4 max-w-lg mx-auto leading-relaxed">
          Start free for 30 days. No credit card needed.
        </p>
      </section>

      {/* Funnel Type Selector Toggle */}
      <div className="flex justify-center mb-12 px-6">
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

      {/* Side-by-Side Comparison Matrix Cards */}
      <section className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-24">
        
        {/* Starter Plan Card */}
        <div className="bg-white rounded-[32px] border border-slate-150 p-8 md:p-10 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                {funnelType === 'smart' ? 'STARTER PLAN' : 'STARTER DIRECT PLAN'}
              </span>
              <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-100 uppercase tracking-wide shadow-sm">
                First month FREE ✓
              </span>
            </div>
            
            <h3 className="text-3xl font-black text-slate-900 mt-5">
              {funnelType === 'smart' ? 'STARTER' : 'STARTER DIRECT'}
            </h3>
            <p className="text-sm font-semibold text-slate-500 mt-2 leading-relaxed">
              {funnelType === 'smart' 
                ? "Perfect for single physical shops, cafes, local clinics, and independent service providers."
                : "Perfect for single shops looking to route all customer ratings directly to Google Maps."
              }
            </p>
            
            <div className="my-8 flex items-baseline">
              <span className="text-5xl font-black text-slate-900 tracking-tight">₹399</span>
              <span className="text-slate-400 text-sm font-bold ml-1.5">/ month</span>
            </div>
            
            {/* Features list */}
            <div className="border-t border-slate-100 pt-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Check className="w-3 h-3 text-emerald-600 stroke-[3px]" />
                </div>
                <span className="text-sm font-bold text-slate-600">1 Location Branch</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Check className="w-3 h-3 text-emerald-600 stroke-[3px]" />
                </div>
                <span className="text-sm font-bold text-slate-600">1 NFC Card Support</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Check className="w-3 h-3 text-emerald-600 stroke-[3px]" />
                </div>
                <span className="text-sm font-bold text-slate-600">Analytics History (up to 30 days)</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Check className="w-3 h-3 text-emerald-600 stroke-[3px]" />
                </div>
                <span className="text-sm font-bold text-slate-600">
                  {funnelType === 'smart' ? 'Smart QR Routing (4-5★ → Google)' : 'Direct Google Reviews (All 1-5★)'}
                </span>
              </div>
              {funnelType === 'smart' ? (
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Check className="w-3 h-3 text-emerald-600 stroke-[3px]" />
                  </div>
                  <span className="text-sm font-bold text-slate-600">Private Feedback Form (1-3★)</span>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <X className="w-3.5 h-3.5 stroke-[3px]" />
                  </div>
                  <span className="text-sm font-bold text-slate-400 line-through">Private Feedback Form (1-3★)</span>
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Check className="w-3 h-3 text-emerald-600 stroke-[3px]" />
                </div>
                <span className="text-sm font-bold text-slate-600">AI Review Suggestions</span>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="mt-10 pt-4 space-y-3.5">
            <Link
              href={`/${locale}/login`}
              className="w-full inline-flex items-center justify-center bg-slate-950 hover:bg-slate-900 text-white font-black py-4 px-6 rounded-2xl text-sm uppercase tracking-wider text-center shadow-md transition-all active:scale-[0.99]"
            >
              Log In to Subscribe
            </Link>
            <a
              href={`https://wa.me/${supportPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(starterText)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-extrabold py-3.5 px-6 rounded-2xl text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-50" />
              <span>Contact Admin to Activate</span>
            </a>
          </div>
        </div>

        {/* Growth Plan Card */}
        <div className="bg-white rounded-[32px] border-2 border-emerald-500 p-8 md:p-10 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
          
          <div className="absolute top-0 right-0 bg-emerald-600 text-white font-black text-xs uppercase tracking-widest px-5 py-2 rounded-bl-2xl shadow-sm">
            Best Value
          </div>
          
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                {funnelType === 'smart' ? 'GROWTH PLAN' : 'GROWTH DIRECT PLAN'}
              </span>
              <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-100 uppercase tracking-wide shadow-sm">
                First month FREE ✓
              </span>
            </div>
            
            <h3 className="text-3xl font-black text-slate-900 mt-5">
              {funnelType === 'smart' ? 'GROWTH' : 'GROWTH DIRECT'}
            </h3>
            <p className="text-sm font-semibold text-slate-500 mt-2 leading-relaxed">
              {funnelType === 'smart' 
                ? "Ideal for multi-location outlets, restaurant chains, clinics, and professional agencies."
                : "Ideal for multi-location outlets looking to route all customer ratings directly to Google Maps."
              }
            </p>
            
            <div className="my-8 flex items-baseline">
              <span className="text-5xl font-black text-slate-900 tracking-tight">₹799</span>
              <span className="text-slate-400 text-sm font-bold ml-1.5">/ month</span>
            </div>
            
            {/* Features list */}
            <div className="border-t border-slate-100 pt-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5 shadow-sm bg-emerald-50">
                  <Check className="w-3 h-3 text-emerald-600 stroke-[3px]" />
                </div>
                <span className="text-sm font-bold text-slate-700">Up to 3 Locations & NFC Cards</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Check className="w-3 h-3 text-emerald-600 stroke-[3px]" />
                </div>
                <span className="text-sm font-bold text-slate-700">3-Month Analytics History</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Check className="w-3 h-3 text-emerald-600 stroke-[3px]" />
                </div>
                <span className="text-sm font-bold text-slate-700">Scan & Peak Time Heatmaps</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Check className="w-3 h-3 text-emerald-600 stroke-[3px]" />
                </div>
                <span className="text-sm font-bold text-slate-700">CSV Export (Logs & Feedbacks)</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Check className="w-3 h-3 text-emerald-600 stroke-[3px]" />
                </div>
                <span className="text-sm font-bold text-slate-700">White-label Toggles (No Branding)</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Check className="w-3 h-3 text-emerald-600 stroke-[3px]" />
                </div>
                <span className="text-sm font-bold text-slate-700">Public Developer API Access</span>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="mt-10 pt-4 space-y-3.5">
            <Link
              href={`/${locale}/login`}
              className="w-full inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-6 rounded-2xl text-sm uppercase tracking-wider text-center shadow-lg hover:shadow-emerald-600/15 active:scale-[0.99]"
            >
              Log In to Subscribe
            </Link>
            <a
              href={`https://wa.me/${supportPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(growthText)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-extrabold py-3.5 px-6 rounded-2xl text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-50" />
              <span>Contact Admin to Upgrade</span>
            </a>
          </div>
        </div>

      </section>

      {/* Comparison Matrix Table */}
      <section className="max-w-4xl mx-auto px-6 mb-24 relative">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Comparison Matrix
          </h2>
          <p className="text-sm text-slate-400 font-semibold mt-1">
            Compare all options side-by-side to make the right choice.
          </p>
        </div>
        
        <div className="bg-white rounded-[32px] border border-slate-150 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="py-5 px-6 text-sm font-bold text-slate-400 uppercase tracking-wider min-w-[160px]">Features</th>
                  <th className="py-5 px-6 text-sm font-black text-slate-805 uppercase tracking-wider text-center w-48 min-w-[140px]">
                    {funnelType === 'smart' ? 'STARTER (₹399)' : 'STARTER DIRECT (₹399)'}
                  </th>
                  <th className="py-5 px-6 text-sm font-black text-emerald-700 uppercase tracking-wider text-center w-48 min-w-[140px]">
                    {funnelType === 'smart' ? 'GROWTH (₹799)' : 'GROWTH DIRECT (₹799)'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {features.map((feature, idx) => (
                  <tr key={idx} className={`hover:bg-slate-50/50 transition-colors ${feature.isHighlight ? 'bg-emerald-50/15' : ''}`}>
                    <td className="py-4 px-6 text-sm font-bold text-slate-700">
                      {feature.name}
                    </td>
                    <td className="py-4 px-6 text-center text-sm font-bold text-slate-500">
                      {typeof feature.starter === 'boolean' ? (
                        feature.starter ? (
                          <Check className="w-4.5 h-4.5 text-emerald-600 mx-auto stroke-[2.5]" />
                        ) : (
                          <X className="w-4.5 h-4.5 text-slate-300 mx-auto stroke-[2.5]" />
                        )
                      ) : (
                        <span className={feature.isHighlight ? "text-emerald-700 font-black text-sm bg-emerald-50/30 px-2.5 py-0.5 rounded-full border border-emerald-100" : "text-slate-600"}>{feature.starter}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center text-sm font-bold text-slate-500">
                      {typeof feature.growth === 'boolean' ? (
                        feature.growth ? (
                          <Check className="w-4.5 h-4.5 text-emerald-600 mx-auto stroke-[2.5]" />
                        ) : (
                          <X className="w-4.5 h-4.5 text-slate-300 mx-auto stroke-[2.5]" />
                        )
                      ) : (
                        <span className={feature.isHighlight ? "text-emerald-700 font-black text-sm bg-emerald-50/30 px-2.5 py-0.5 rounded-full border border-emerald-100" : "text-slate-600"}>{feature.growth}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Accordion FAQ Block */}
      <section className="max-w-3xl mx-auto px-6 border-t border-slate-100 pt-20">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-widest border border-slate-200">
            <HelpCircle className="w-3.5 h-3.5" /> FAQ
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-3">
            Got Questions? We have Answers.
          </h2>
          <p className="text-base text-slate-500 font-semibold mt-1">
            Everything you need to know about our subscription and onboarding process.
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx} 
                className="border border-slate-200/60 rounded-[24px] overflow-hidden transition-all bg-[#FAFAFB] shadow-sm hover:shadow"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left p-6 font-bold text-slate-900 text-base flex justify-between items-center transition-colors focus:outline-none hover:bg-slate-100/40 cursor-pointer"
                >
                  <span className="pr-4">{item.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-450 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                </button>
                <div 
                  className={`transition-all duration-350 ease-in-out overflow-hidden ${
                    isOpen ? 'max-h-64 border-t border-slate-100/50' : 'max-h-0'
                  }`}
                >
                  <div className="p-6 text-sm text-slate-500 font-semibold leading-relaxed bg-[#FAFAFB]">
                    {item.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="text-center pt-24 pb-4 text-[10px] font-black text-slate-400 uppercase tracking-wide">
        <p>© {new Date().getFullYear()} ReviewPe. All Rights Reserved. Indian local business assistance.</p>
      </footer>
    </div>
  );
}
