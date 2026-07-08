'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, HelpCircle, MessageSquare, ShieldAlert, BadgeInfo } from 'lucide-react';

export default function FaqPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const categories = [
    {
      name: 'General',
      icon: <HelpCircle className="w-5 h-5 text-emerald-600" />,
      faqs: [
        {
          q: 'What is ReviewPe?',
          a: 'ReviewPe is an AI-powered review funnel platform designed to help local brick-and-mortar stores, restaurants, salons, and hotels easily request, collect, and optimize Google Map reviews from their physical customers.'
        },
        {
          q: 'How does it help protect my business rating?',
          a: 'By using our Smart Funnel routing, happy customers (rating 4-5 stars) are directed to post publicly on your Google Maps listing. Unhappy customers (rating 1-3 stars) are routed to a private feedback form so you can resolve the issue privately instead of getting a public 1-star review.'
        },
        {
          q: 'Are the AI suggestions customizable?',
          a: 'Yes! ReviewPe analyzes your business category, language, vibe, and avoiding phrases to generate tailored review chips. Customers click a chip to load a well-written draft, which they can copy directly into Google Reviews.'
        }
      ]
    },
    {
      name: 'Setup & NFC',
      icon: <BadgeInfo className="w-5 h-5 text-indigo-600" />,
      faqs: [
        {
          q: 'How do customers access my review page?',
          a: 'You receive a unique ReviewPe URL and a custom QR code for each location. You can print the QR code on bills, table tents, standees, or program them into NFC tags and cards so customers can tap or scan using their smartphones.'
        },
        {
          q: 'How do I program my NFC cards?',
          a: 'You can link your ReviewPe business URL (e.g., https://www.reviewpe.online/en/r/your-slug) to any standard NTAG213 NFC chip using free mobile apps like NFC Tools. Alternatively, our team can ship pre-programmed cards directly to you.'
        },
        {
          q: 'Do I need special hardware to use this?',
          a: 'No special hardware is required! You can start immediately by displaying the downloadable digital QR code on any phone, tablet, or printed paper at your checkout counter.'
        }
      ]
    },
    {
      name: 'Billing & Upgrades',
      icon: <ShieldAlert className="w-5 h-5 text-amber-600" />,
      faqs: [
        {
          q: 'How does the free plan work?',
          a: 'The free trial includes 1 business location, 1 active NFC card link, and up to 50 scan redirections per month. There are no setup fees and no credit card is required to sign up.'
        },
        {
          q: 'How do I upgrade to a paid plan?',
          a: 'To upgrade, navigate to your Billing Dashboard, select your desired tier (Starter or Growth), and click "Request Upgrade". This sends an automated ticket. Our team will coordinate the billing charges and instantly upgrade your account limit upon receipt.'
        },
        {
          q: 'What payment methods do you support?',
          a: 'We support all major Indian payment methods, including UPI (Google Pay, PhonePe, Paytm), net banking, and local debit/credit cards. Plans are activated manually upon invoice verification.'
        }
      ]
    }
  ];

  // Flatten FAQs to manage open indices easily
  let globalIndex = 0;
  const categorizedFaqs = categories.map(category => {
    const faqsWithIndex = category.faqs.map(faq => ({
      ...faq,
      index: globalIndex++
    }));
    return {
      ...category,
      faqs: faqsWithIndex
    };
  });

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
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-16">
        <div className="text-center mb-16 space-y-3">
          <span className="text-xs font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-100">
            Faq Directory
          </span>
          <h1 className="text-4xl font-black text-slate-950 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-base text-slate-500 font-semibold max-w-xl mx-auto">
            Everything you need to know about setting up, routing reviews, and managing your ReviewPe plans.
          </p>
        </div>

        {/* FAQ Categories & Items */}
        <div className="space-y-12">
          {categorizedFaqs.map((category, catIdx) => (
            <div key={catIdx} className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                {category.icon}
                <h2 className="font-black text-lg text-slate-900 uppercase tracking-wider">
                  {category.name}
                </h2>
              </div>

              <div className="space-y-4">
                {category.faqs.map((faq) => (
                  <div 
                    key={faq.index} 
                    className="bg-[#FAFAFB] border border-slate-100 rounded-[24px] overflow-hidden transition-all duration-300 shadow-sm"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(openFaqIndex === faq.index ? null : faq.index)}
                      className="w-full flex items-center justify-between p-6 text-left cursor-pointer transition-colors hover:bg-slate-100/40"
                    >
                      <span className="font-extrabold text-slate-900 text-base pr-4">
                        {faq.q}
                      </span>
                      <ChevronDown 
                        className={`w-5 h-5 text-slate-400 transition-transform duration-300 shrink-0 ${openFaqIndex === faq.index ? 'rotate-180 text-emerald-600' : ''}`} 
                      />
                    </button>
                    
                    <div 
                      className={`transition-all duration-350 ease-in-out overflow-hidden ${
                        openFaqIndex === faq.index ? 'max-h-64 border-t border-slate-100/50' : 'max-h-0'
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
          ))}
        </div>

        {/* Bottom CTA Card */}
        <div className="mt-20 p-8 rounded-3xl bg-emerald-50/50 border border-emerald-100 text-center space-y-4">
          <h3 className="text-lg font-black text-slate-900">Still have questions?</h3>
          <p className="text-sm font-semibold text-slate-500 max-w-md mx-auto">
            We are always here to help you get more 5-star ratings. Reach out to our support team directly.
          </p>
          <div className="pt-2">
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Contact Support</span>
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
