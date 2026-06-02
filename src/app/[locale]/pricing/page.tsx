'use client';

import React from 'react';
import Link from 'next/link';
import { Check, X, ArrowLeft, HelpCircle } from 'lucide-react';

interface PricingPageProps {
  params: {
    locale: string;
  };
}

export default function PricingPage({ params }: PricingPageProps) {
  const { locale } = params;

  const faqItems = [
    {
      q: "Can I cancel anytime?",
      a: "Yes — cancel anytime from your dashboard. No lock-in, no cancellation fee."
    },
    {
      q: "What happens after my free trial?",
      a: "Your QR page pauses until you select a plan. All your reviews and scan data are saved safely for 60 days before deletion."
    },
    {
      q: "Can I switch plans?",
      a: "Yes — upgrade or downgrade anytime. Billing is calculated dynamically and prorated."
    },
    {
      q: "Do you support UPI or cards?",
      a: "Yes — through Razorpay we support UPI (GPay, PhonePe, Paytm), all Indian debit/credit cards, net banking, and wallets."
    },
    {
      q: "I have more than 10 locations. What do I do?",
      a: "Contact us at hello@reviewboost.com for customized enterprise pricing and volume discounts."
    }
  ];

  const features = [
    { name: "First month", starter: "FREE ✓", growth: "FREE ✓", isHighlight: true },
    { name: "Locations Included", starter: "1", growth: "Up to 10" },
    { name: "NFC Cards Included", starter: "1", growth: "Up to 10" },
    { name: "Branded QR (logo + brand color)", starter: true, growth: true },
    { name: "Unlimited Scans & Redirects", starter: true, growth: true },
    { name: "Smart Review Routing (4-5★ → Google)", starter: true, growth: true },
    { name: "AI Review Suggestions (3 per visit)", starter: true, growth: true },
    { name: "Multi-language support (6 languages)", starter: true, growth: true },
    { name: "Private Feedback Inbox (Name/Phone optional)", starter: true, growth: true },
    { name: "Email + WhatsApp Private Alerts", starter: true, growth: true },
    { name: "Print-ready PDF Downloads (Standees, Cards)", starter: true, growth: true },
    { name: "Analytics History", starter: "Last 30 Days", growth: "Unlimited History" },
    { name: "Peak Hours Heatmap", starter: false, growth: true },
    { name: "Funnel & Scan Source Analytics", starter: false, growth: true },
    { name: "CSV Export (Scan & Review Data)", starter: false, growth: true },
    { name: "Weekly Auto-Export Email every Monday", starter: false, growth: true },
    { name: "White-label (No ReviewBoost logo)", starter: false, growth: true },
    { name: "Public Developer API Access", starter: false, growth: true },
    { name: "Priority Support (within 24 hours)", starter: false, growth: true }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans leading-normal overflow-y-auto">
      {/* Header Navigation */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link 
          href={`/${locale}`}
          className="inline-flex items-center gap-2 text-slate-650 hover:text-slate-900 text-xs font-bold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-extrabold shadow-sm">
            R
          </div>
          <span className="font-extrabold text-slate-900 tracking-tight text-base">Review<span className="text-emerald-600">Boost</span></span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto px-6 py-12">
        <span className="text-[10px] font-black px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 uppercase tracking-widest">
          30-Day Free Trial
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mt-4 leading-tight">
          Simple pricing. <span className="text-emerald-600">No surprises.</span>
        </h1>
        <p className="text-sm sm:text-base font-semibold text-slate-500 mt-3 max-w-lg mx-auto">
          Start free for 30 days. No credit card required. All features unlocked during trial so you experience the full power of ReviewBoost.
        </p>
      </section>

      {/* Plan Cards */}
      <section className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Starter Plan */}
        <div className="bg-white rounded-3xl border border-slate-150 p-8 shadow-md hover:shadow-xl transition-all relative flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
              Best for small businesses & single shops
            </span>
            <h3 className="text-2xl font-black text-slate-800 mt-2">Starter Plan</h3>
            <p className="text-xs font-semibold text-slate-400 mt-1 leading-relaxed">
              Ideal for restaurants, kirana stores, salons, and local service providers.
            </p>
            <div className="my-6">
              <span className="text-4xl font-black text-slate-900">₹399</span>
              <span className="text-slate-400 text-xs font-bold ml-1">/ month</span>
            </div>
            <div className="border-t border-slate-100 pt-6 space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-650">1 Business Location</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-650">1 NFC Tap Card Support</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-650">Branded QR (Logo + Center)</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-650">AI Review Suggestions (Legal Disclaimer)</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-650">Private Feedback Inbox & Routing</span>
              </div>
            </div>
          </div>
          <Link
            href={`/${locale}/login`}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl text-xs transition-colors mt-8 text-center shadow-md shadow-slate-100"
          >
            Start Your Free Trial
          </Link>
        </div>

        {/* Growth Plan */}
        <div className="bg-white rounded-3xl border-2 border-indigo-500 p-8 shadow-lg hover:shadow-2xl transition-all relative flex flex-col justify-between overflow-hidden">
          <div className="absolute top-0 right-0 bg-indigo-500 text-white font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl">
            Popular
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest block">
              Best for chains, agencies & hotels
            </span>
            <h3 className="text-2xl font-black text-slate-800 mt-2">Growth Plan</h3>
            <p className="text-xs font-semibold text-slate-400 mt-1 leading-relaxed">
              Ideal for multi-location franchises, digital marketers, and boutique chains.
            </p>
            <div className="my-6">
              <span className="text-4xl font-black text-slate-900">₹799</span>
              <span className="text-slate-400 text-xs font-bold ml-1">/ month</span>
            </div>
            <div className="border-t border-slate-100 pt-6 space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-650">Up to 10 Locations & NFC Cards</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-650">Independent Slug & Analytics</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-650">Peak Hour Heatmaps & Funnel Reports</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-650">White-label review portal (Branding Removed)</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-650">Public Developer API Key Access</span>
              </div>
            </div>
          </div>
          <Link
            href={`/${locale}/login`}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl text-xs transition-colors mt-8 text-center shadow-lg shadow-indigo-100"
          >
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="max-w-4xl mx-auto px-6 mb-20">
        <h2 className="text-xl font-black text-slate-900 tracking-tight text-center mb-8">
          Detailed Feature Comparison
        </h2>
        <div className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="py-4.5 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Features</th>
                  <th className="py-4.5 px-6 text-xs font-black text-emerald-700 uppercase tracking-wider text-center w-36">Starter (₹399)</th>
                  <th className="py-4.5 px-6 text-xs font-black text-indigo-700 uppercase tracking-wider text-center w-36">Growth (₹799)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {features.map((feature, idx) => (
                  <tr key={idx} className={`hover:bg-slate-50/20 transition-colors ${feature.isHighlight ? 'bg-emerald-50/10' : ''}`}>
                    <td className="py-4 px-6 text-xs font-bold text-slate-700">
                      {feature.name}
                    </td>
                    <td className="py-4 px-6 text-center text-xs font-bold text-slate-500">
                      {typeof feature.starter === 'boolean' ? (
                        feature.starter ? (
                          <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-rose-400 mx-auto" />
                        )
                      ) : (
                        <span className={feature.isHighlight ? "text-emerald-700 font-extrabold" : ""}>{feature.starter}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center text-xs font-bold text-slate-500">
                      {typeof feature.growth === 'boolean' ? (
                        feature.growth ? (
                          <Check className="w-4 h-4 text-indigo-650 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-rose-400 mx-auto" />
                        )
                      ) : (
                        <span className={feature.isHighlight ? "text-indigo-700 font-extrabold" : ""}>{feature.growth}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Block */}
      <section className="bg-white border-t border-slate-150 py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqItems.map((item, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-150 flex gap-4">
                <div className="p-2 rounded-xl bg-slate-200 text-slate-550 shrink-0 h-9 w-9 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-xs">{item.q}</h4>
                  <p className="text-[11px] font-semibold text-slate-500 mt-1.5 leading-relaxed">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="text-center py-10 text-[10px] font-bold text-slate-400 border-t border-slate-100 bg-slate-50">
        <p>© {new Date().getFullYear()} ReviewBoost SaaS. All Rights Reserved. Simple, automated Google Review growth.</p>
      </footer>
    </div>
  );
}
