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

  const faqItems = [
    {
      q: "What is your cancellation policy?",
      a: "ReviewPe has no long-term contracts. You can cancel your subscription renewal at any time. Simply contact the support admin or pause your manual renewal, and your account will gracefully transition to the inactive status without any exit fees or penalties."
    },
    {
      q: "Can I switch between plans?",
      a: "Yes! You can request a switch between Starter and Growth at any point. Our administrator will manually adjust your limits, update the billing records, and instantly apply the corresponding features to your merchant profile."
    },
    {
      q: "Do you support UPI payments?",
      a: "Absolutely. We support all Indian payment methods including UPI (Google Pay, PhonePe, Paytm, BHIM), local credit/debit cards, and net banking. Payments are manually processed and matched by our administrator for instant activation."
    },
    {
      q: "I have more than 10 locations. Can I expand further?",
      a: "Yes. For enterprises or franchises requiring more than 10 business locations/NFC cards, we offer customized Enterprise plans. Please contact the admin directly to set up bulk licensing and dedicated support."
    }
  ];

  const features = [
    { name: "Free Plan Benefit", starter: "First month FREE ✓", growth: "First month FREE ✓", isHighlight: true },
    { name: "Location Branches Limit", starter: "1 Location", growth: "Up to 10 Locations" },
    { name: "NFC Cards Supported", starter: "1 NFC Card", growth: "Up to 10 NFC Cards" },
    { name: "Analytics History", starter: "Up to 30 Days", growth: "Unlimited History" },
    { name: "Peak Scans Heatmap", starter: false, growth: true },
    { name: "CSV Export (Scan & Feedback Logs)", starter: false, growth: true },
    { name: "White-label Options (Remove Brand)", starter: false, growth: true },
    { name: "Public Developer API Access", starter: false, growth: true },
    { name: "Smart Review Routing (4-5★ to Google)", starter: true, growth: true },
    { name: "AI Review Suggestions (Claude-powered)", starter: true, growth: true },
    { name: "Private Feedback Form (1-3★)", starter: true, growth: true },
    { name: "Email + WhatsApp Alerts", starter: true, growth: true }
  ];

  const supportEmail = 'billing@reviewpe.online';
  const supportPhone = '+919876543210';
  const starterText = "Hello Support, I would like to subscribe to the Starter Plan (₹399/mo) after my free plan period.";
  const growthText = "Hello Support, I would like to subscribe to the Growth Plan (₹799/mo) after my free plan period.";

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans antialiased relative overflow-hidden pb-20">
      
      {/* Decorative Gradient Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-10 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      
      {/* Header Navigation */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50 transition-all">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link 
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-955 text-xs font-extrabold transition-all"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <img src="/icon.png" alt="ReviewPe Icon" className="w-8 h-8 object-contain rounded-lg shadow-sm" />
            <span className="font-extrabold text-slate-900 tracking-tight text-base">Review<span className="text-emerald-600">Pe</span></span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto px-6 pt-16 pb-12">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-black px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 uppercase tracking-widest shadow-sm">
          <Sparkles className="w-3 h-3 fill-current animate-pulse" /> Limited-Time Free Plan Benefit
        </span>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-950 tracking-tight mt-5 leading-tight">
          Simple pricing. <span className="bg-gradient-to-r from-emerald-600 to-indigo-600 bg-clip-text text-transparent">No surprises.</span>
        </h1>
        <p className="text-sm sm:text-base font-semibold text-slate-500 mt-4 max-w-lg mx-auto leading-relaxed">
          Start free for 30 days. No credit card needed.
        </p>
      </section>

      {/* Side-by-Side Comparison Matrix Cards */}
      <section className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-20">
        
        {/* Starter Plan Card */}
        <div className="bg-white rounded-3xl border border-slate-205 p-8 md:p-10 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                STARTER PLAN
              </span>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-55/50 px-2.5 py-1 rounded-lg border border-emerald-100 uppercase tracking-wide shadow-sm">
                First month FREE ✓
              </span>
            </div>
            
            <h3 className="text-3xl font-black text-slate-900 mt-4">STARTER</h3>
            <p className="text-xs font-semibold text-slate-400 mt-2 leading-relaxed">
              Perfect for single physical shops, cafes, local clinics, and independent service providers.
            </p>
            
            <div className="my-8 flex items-baseline">
              <span className="text-5xl font-black text-slate-900 tracking-tight">₹399</span>
              <span className="text-slate-450 text-sm font-bold ml-1.5">/ month</span>
            </div>
            
            {/* Features list */}
            <div className="border-t border-slate-100 pt-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-5.5 h-5.5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Check className="w-3.5 h-3.5 stroke-[3px]" />
                </div>
                <span className="text-xs font-bold text-slate-650">1 Location Branch</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5.5 h-5.5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Check className="w-3.5 h-3.5 stroke-[3px]" />
                </div>
                <span className="text-xs font-bold text-slate-650">1 NFC Card Support</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5.5 h-5.5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Check className="w-3.5 h-3.5 stroke-[3px]" />
                </div>
                <span className="text-xs font-bold text-slate-650">Analytics History (up to 30 days)</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5.5 h-5.5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Check className="w-3.5 h-3.5 stroke-[3px]" />
                </div>
                <span className="text-xs font-bold text-slate-650">Smart QR Routing (4-5★ → Google)</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5.5 h-5.5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Check className="w-3.5 h-3.5 stroke-[3px]" />
                </div>
                <span className="text-xs font-bold text-slate-650">AI Review Suggestions (Claude)</span>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="mt-10 pt-4 space-y-3">
            <Link
              href={`/${locale}/login`}
              className="w-full inline-flex items-center justify-center bg-slate-905 hover:bg-slate-800 text-white font-black py-4 px-6 rounded-2xl text-xs text-center shadow-md transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 active:scale-[0.99]"
            >
              Log In to Subscribe
            </Link>
            <a
              href={`https://wa.me/${supportPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(starterText)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-extrabold py-3.5 px-6 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-50" />
              <span>Contact Admin to Activate</span>
            </a>
          </div>
        </div>

        {/* Growth Plan Card */}
        <div className="bg-white rounded-3xl border-2 border-indigo-600 p-8 md:p-10 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
          
          <div className="absolute top-0 right-0 bg-indigo-600 text-white font-black text-[9px] uppercase tracking-widest px-5 py-2 rounded-bl-2xl shadow-sm">
            Best Value
          </div>
          
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-indigo-650 uppercase tracking-widest">
                GROWTH PLAN
              </span>
              <span className="text-[10px] font-black text-indigo-705 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 uppercase tracking-wide shadow-sm">
                First month FREE ✓
              </span>
            </div>
            
            <h3 className="text-3xl font-black text-slate-900 mt-4">GROWTH</h3>
            <p className="text-xs font-semibold text-slate-400 mt-2 leading-relaxed">
              Ideal for multi-location outlets, restaurant chains, clinics, and professional agencies.
            </p>
            
            <div className="my-8 flex items-baseline">
              <span className="text-5xl font-black text-slate-900 tracking-tight">₹799</span>
              <span className="text-slate-450 text-sm font-bold ml-1.5">/ month</span>
            </div>
            
            {/* Features list */}
            <div className="border-t border-slate-100 pt-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-5.5 h-5.5 rounded-full bg-indigo-50 text-indigo-605 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Check className="w-3.5 h-3.5 stroke-[3px]" />
                </div>
                <span className="text-xs font-bold text-slate-700">Up to 10 Locations & NFC Cards</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5.5 h-5.5 rounded-full bg-indigo-50 text-indigo-605 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Check className="w-3.5 h-3.5 stroke-[3px]" />
                </div>
                <span className="text-xs font-bold text-slate-700">Unlimited Analytics History</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5.5 h-5.5 rounded-full bg-indigo-50 text-indigo-605 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Check className="w-3.5 h-3.5 stroke-[3px]" />
                </div>
                <span className="text-xs font-bold text-slate-700">Scan & Peak Time Heatmaps</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5.5 h-5.5 rounded-full bg-indigo-50 text-indigo-605 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Check className="w-3.5 h-3.5 stroke-[3px]" />
                </div>
                <span className="text-xs font-bold text-slate-700">CSV Export (Logs & Feedbacks)</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5.5 h-5.5 rounded-full bg-indigo-50 text-indigo-605 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Check className="w-3.5 h-3.5 stroke-[3px]" />
                </div>
                <span className="text-xs font-bold text-slate-700">White-label Toggles (No Branding)</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5.5 h-5.5 rounded-full bg-indigo-50 text-indigo-605 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Check className="w-3.5 h-3.5 stroke-[3px]" />
                </div>
                <span className="text-xs font-bold text-slate-700">Public Developer API Access</span>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="mt-10 pt-4 space-y-3">
            <Link
              href={`/${locale}/login`}
              className="w-full inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-6 rounded-2xl text-xs text-center shadow-lg transition-all hover:shadow-indigo-500/20 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 active:scale-[0.99]"
            >
              Log In to Subscribe
            </Link>
            <a
              href={`https://wa.me/${supportPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(growthText)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-extrabold py-3.5 px-6 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <MessageCircle className="w-4 h-4 text-indigo-605 fill-indigo-50" />
              <span>Contact Admin to Upgrade</span>
            </a>
          </div>
        </div>

      </section>

      {/* Comparison Matrix Table */}
      <section className="max-w-4xl mx-auto px-6 mb-24">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Comparison Matrix
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Compare all options side-by-side to make the right choice.
          </p>
        </div>
        
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="py-5 px-6 text-xs font-bold text-slate-450 uppercase tracking-wider">Features</th>
                  <th className="py-5 px-6 text-xs font-black text-emerald-700 uppercase tracking-wider text-center w-40">STARTER (₹399)</th>
                  <th className="py-5 px-6 text-xs font-black text-indigo-750 uppercase tracking-wider text-center w-40">GROWTH (₹799)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {features.map((feature, idx) => (
                  <tr key={idx} className={`hover:bg-slate-55/10 transition-colors ${feature.isHighlight ? 'bg-emerald-50/15' : ''}`}>
                    <td className="py-4 px-6 text-xs font-bold text-slate-700">
                      {feature.name}
                    </td>
                    <td className="py-4 px-6 text-center text-xs font-bold text-slate-500">
                      {typeof feature.starter === 'boolean' ? (
                        feature.starter ? (
                          <Check className="w-4.5 h-4.5 text-emerald-600 mx-auto stroke-[2.5]" />
                        ) : (
                          <X className="w-4.5 h-4.5 text-slate-300 mx-auto stroke-[2.5]" />
                        )
                      ) : (
                        <span className={feature.isHighlight ? "text-emerald-700 font-black text-xs bg-emerald-55/40 px-2.5 py-0.5 rounded-full border border-emerald-100" : "text-slate-650"}>{feature.starter}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center text-xs font-bold text-slate-500">
                      {typeof feature.growth === 'boolean' ? (
                        feature.growth ? (
                          <Check className="w-4.5 h-4.5 text-indigo-600 mx-auto stroke-[2.5]" />
                        ) : (
                          <X className="w-4.5 h-4.5 text-slate-300 mx-auto stroke-[2.5]" />
                        )
                      ) : (
                        <span className={feature.isHighlight ? "text-indigo-700 font-black text-xs bg-indigo-55/40 px-2.5 py-0.5 rounded-full border border-indigo-100" : "text-slate-650"}>{feature.growth}</span>
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
      <section className="max-w-3xl mx-auto px-6 border-t border-slate-200/80 pt-16">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black px-3 py-1 rounded-full bg-slate-100 text-slate-600 uppercase tracking-widest border border-slate-200">
            <HelpCircle className="w-3.5 h-3.5" /> FAQ
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-3">
            Got Questions? We have Answers.
          </h2>
          <p className="text-xs text-slate-450 font-semibold mt-1">
            Everything you need to know about our subscription and onboarding process.
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx} 
                className="border border-slate-200/80 rounded-2xl overflow-hidden transition-all bg-white shadow-sm hover:shadow"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left p-5 font-bold text-slate-800 text-xs sm:text-sm flex justify-between items-center transition-colors focus:outline-none hover:bg-slate-50/50"
                >
                  <span className="pr-4">{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-slate-700' : ''}`} />
                </button>
                <div 
                  className={`transition-all duration-200 ease-in-out ${
                    isOpen ? 'max-h-64 border-t border-slate-100' : 'max-h-0'
                  } overflow-hidden`}
                >
                  <div className="p-5 text-[11px] sm:text-xs font-medium text-slate-500 leading-relaxed bg-slate-50/30">
                    {item.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="text-center pt-20 pb-4 text-[10px] font-bold text-slate-400">
        <p>© {new Date().getFullYear()} ReviewPe. All Rights Reserved. Indian local business assistance.</p>
      </footer>
    </div>
  );
}
