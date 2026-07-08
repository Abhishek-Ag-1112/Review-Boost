'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, UserPlus, QrCode, CreditCard, Sparkles, Zap } from 'lucide-react';

export default function HowToUsePage({ params }: { params: { locale: string } }) {
  const { locale } = params;

  const steps = [
    {
      num: '01',
      title: 'Sign Up & Get Your Free Plan',
      icon: <UserPlus className="w-6 h-6 text-emerald-600" />,
      desc: 'Create an account in seconds. You are instantly enrolled in the Free Trial Plan. This includes 1 active business location, 1 NFC card mapping, and up to 50 scan redirections per month with standard branding.'
    },
    {
      num: '02',
      title: 'Configure Your Store & QR Codes',
      icon: <QrCode className="w-6 h-6 text-indigo-600" />,
      desc: 'Connect your Google Place ID, select your store category, and customize your AI suggestion prompts. Download your unique QR code or link your ReviewPe URL to custom NFC tags/cards.'
    },
    {
      num: '03',
      title: 'Request an Upgrade',
      icon: <Zap className="w-6 h-6 text-amber-600" />,
      desc: 'Need to remove the branding, add more locations, or get unlimited scans? Go to your Dashboard, navigate to the Billing section, choose your desired plan (Starter or Growth), and click "Request Upgrade".'
    },
    {
      num: '04',
      title: 'Pay Plan Charges',
      icon: <CreditCard className="w-6 h-6 text-emerald-600" />,
      desc: 'Our billing department will send an invoice and secure UPI payment link (supporting Google Pay, PhonePe, Paytm, and Card payments). Transfer the plan charges directly using your preferred UPI app.'
    },
    {
      num: '05',
      title: 'Instant Activation',
      icon: <Sparkles className="w-6 h-6 text-indigo-600 animate-pulse" />,
      desc: 'Once the payment is completed and verified, our admin instantly upgrades your merchant limits. Your branding options, locations capacity, and scan volumes are updated on your dashboard live!'
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
      <div className="absolute bottom-[8%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-400/8 blur-[120px] pointer-events-none -z-10" />

      {/* Header */}
      <header className="sticky top-0 bg-white/75 backdrop-blur-lg border-b border-slate-100/80 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link 
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 text-xs font-black uppercase tracking-wider transition-all"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3px]" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100/65 flex items-center justify-center shadow-sm">
              <img src="/icon.png" alt="ReviewPe Icon" className="w-6 h-6 object-contain" />
            </div>
            <span className="font-black text-slate-950 tracking-tight text-md">
              Review<span className="text-emerald-600">Pe</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-16">
        <div className="text-center mb-16 space-y-3">
          <span className="text-xs font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-100">
            Guide Book
          </span>
          <h1 className="text-4xl font-black text-slate-950 tracking-tight">
            How to Use ReviewPe
          </h1>
          <p className="text-base text-slate-500 font-semibold max-w-xl mx-auto">
            A step-by-step workflow of setting up your free review funnel and upgrading to expand your business limits.
          </p>
        </div>

        {/* Step List Timeline */}
        <div className="relative border-l border-slate-100 ml-4 md:ml-8 space-y-12 pb-8">
          {steps.map((step, idx) => (
            <div key={idx} className="relative pl-8 md:pl-12 group">
              {/* Bullet Node */}
              <div className="absolute -left-5 top-1.5 w-10 h-10 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center shadow-sm group-hover:border-emerald-500 transition-all duration-350">
                <span className="text-[10px] font-black text-slate-400 group-hover:text-emerald-600">
                  {step.num}
                </span>
              </div>

              {/* Step Card */}
              <div className="bg-white border border-slate-100/80 rounded-[32px] p-6 md:p-8 shadow-sm hover:shadow-md hover:border-slate-200/50 transition-all duration-300 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                    {step.icon}
                  </div>
                  <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">
                    {step.title}
                  </h3>
                </div>
                <p className="text-sm font-semibold text-slate-500 leading-relaxed pl-1">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Callout */}
        <div className="mt-16 p-8 rounded-3xl bg-emerald-600 text-white text-center space-y-5 shadow-lg shadow-emerald-600/15">
          <h3 className="text-xl font-black">Ready to scale your business reviews?</h3>
          <p className="text-sm font-semibold text-emerald-100 max-w-md mx-auto">
            Get started today on the Free plan, explore how the smart funnels work, and upgrade whenever your business demands.
          </p>
          <div className="pt-2">
            <Link
              href={`/${locale}/login`}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-emerald-700 hover:bg-slate-50 text-xs font-black uppercase tracking-wider transition-all shadow-md"
            >
              <span>Get Started Free</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-8 text-center flex flex-col items-center justify-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-wide">
        <p>© {new Date().getFullYear()} ReviewPe. All Rights Reserved. Indian local business assistance.</p>
        <div className="flex items-center gap-3">
          <a
            href="https://www.instagram.com/reviewpe.online?igsh=ODN6ZmI0anp3NjQ1"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-600 transition-colors normal-case font-bold"
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            <span>@reviewpe.online</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
