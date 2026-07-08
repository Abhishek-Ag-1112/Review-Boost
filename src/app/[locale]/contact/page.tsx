'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Send, Check } from 'lucide-react';
import { createClient, isMockMode } from '@/lib/supabase';

export default function ContactPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const [emailInput, setEmailInput] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !messageInput) return;

    setLoading(true);
    setError('');

    try {
      if (isMockMode) {
        console.log('[MOCK CONTACT] Inquiry submitted:', { emailInput, messageInput });
        setFormSubmitted(true);
      } else {
        const supabase = createClient();
        const { error: dbError } = await supabase
          .from('contact_inquiries')
          .insert([
            { email: emailInput, message: messageInput }
          ]);

        if (dbError) throw dbError;
        setFormSubmitted(true);
      }
      setEmailInput('');
      setMessageInput('');
    } catch (err: any) {
      console.error('Failed to submit contact message:', err);
      setError(err.message || 'Failed to send inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const supportEmail = 'abhishek040478@gmail.com';
  const instagramUrl = 'https://www.instagram.com/reviewpe.online?igsh=ODN6ZmI0anp3NjQ1';

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
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
        {/* Left Column: Direct channels info */}
        <div className="md:col-span-5 space-y-8">
          <div className="space-y-3">
            <span className="text-xs font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-100">
              Get in Touch
            </span>
            <h1 className="text-4xl font-black text-slate-950 tracking-tight">
              Contact Us
            </h1>
            <p className="text-sm font-semibold text-slate-500 leading-relaxed">
              Have a question about manual upgrades, billing, or technical setup? Contact us directly through our primary channels.
            </p>
          </div>

          <div className="space-y-4 pt-4">
            {/* Email Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Email Support</h3>
                <a 
                  href={`mailto:${supportEmail}`}
                  className="font-extrabold text-slate-900 text-sm md:text-base hover:text-emerald-600 transition-colors"
                >
                  {supportEmail}
                </a>
                <p className="text-xs text-slate-450 font-bold">Standard response: within 12-24 hours</p>
              </div>
            </div>

            {/* Instagram DM Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5 text-indigo-600"
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
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Instagram DM</h3>
                <a 
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-extrabold text-slate-900 text-sm md:text-base hover:text-indigo-600 transition-colors block"
                >
                  @reviewpe.online
                </a>
                <p className="text-xs text-slate-450 font-bold">Best for instant chatting & support tickets</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Inquiry Form */}
        <div className="md:col-span-7">
          <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm space-y-6">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Send a Message</h2>
            
            {formSubmitted ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 animate-bounce">
                  <Check className="w-6 h-6 stroke-[3px]" />
                </div>
                <h3 className="text-lg font-black text-slate-900">Message Received!</h3>
                <p className="text-sm font-semibold text-slate-500 max-w-sm">
                  Thank you for reaching out. We will get back to you shortly, or feel free to message us on Instagram for immediate assistance.
                </p>
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="text-xs font-black text-emerald-600 hover:text-emerald-800 uppercase tracking-widest pt-4"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-650 text-xs font-bold rounded-xl">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-black uppercase text-slate-455 tracking-wider block">
                    Your Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    disabled={loading}
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-sm font-semibold transition-all disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-xs font-black uppercase text-slate-455 tracking-wider block">
                    How can we help you?
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    disabled={loading}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Describe your inquiry, request, or issue here..."
                    className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-sm font-semibold transition-all resize-none disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? 'Sending...' : 'Send Inquiry'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-8 text-center flex flex-col items-center justify-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-wide">
        <p>© {new Date().getFullYear()} ReviewPe. All Rights Reserved. Indian local business assistance.</p>
        <div className="flex items-center gap-3">
          <a
            href={instagramUrl}
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
