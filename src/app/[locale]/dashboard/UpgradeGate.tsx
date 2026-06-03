'use client';

import React from 'react';
import { Lock, Check, Sparkles, MessageCircle, Mail } from 'lucide-react';

interface UpgradeGateProps {
  businessName: string;
  currentPlan: 'free' | 'starter' | 'growth';
  planNeeded: 'growth';
  featureName: string;
  benefits: string[];
}

export default function UpgradeGate({
  businessName,
  currentPlan,
  planNeeded,
  featureName,
  benefits
}: UpgradeGateProps) {
  const planTitles = {
    growth: 'Growth Plan'
  };

  const supportEmail = 'billing@reviewboost.com';
  const supportPhone = '+919876543210'; // Support number

  const messageText = `Hello ReviewBoost Support, I would like to manually upgrade my business "${businessName}" from the ${currentPlan} tier to the ${planTitles[planNeeded]}. Please coordinate the invoice and activation.`;
  
  const emailUrl = `mailto:${supportEmail}?subject=ReviewBoost%20Manual%20Upgrade%20Request&body=${encodeURIComponent(messageText)}`;
  const whatsappUrl = `https://wa.me/${supportPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(messageText)}`;

  return (
    <div className="relative min-h-[400px] flex items-center justify-center p-6 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 overflow-hidden font-sans">
      {/* Visual background blobs */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-emerald-100/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-72 h-72 rounded-full bg-indigo-100/20 blur-3xl" />

      <div className="relative max-w-md w-full bg-white p-8 rounded-3xl border border-slate-100 shadow-xl flex flex-col items-center text-center z-10">
        {/* Pulsing Lock Icon */}
        <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 mb-6 shadow-inner">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100/50 animate-ping opacity-75" />
          <Lock className="w-6 h-6 shrink-0 relative z-10" />
        </div>

        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 uppercase tracking-widest flex items-center gap-1">
          <Sparkles className="w-3 h-3 fill-current" /> Premium Feature
        </span>

        <h2 className="text-xl font-black text-slate-900 tracking-tight mt-4">
          Unlock {featureName}
        </h2>
        
        <p className="text-xs font-semibold text-slate-400 mt-2 leading-relaxed">
          This feature is available on the <strong className="text-indigo-600 font-extrabold">{planTitles[planNeeded]} (₹799/month)</strong>. 
          To upgrade or add more features, please contact our account team directly.
        </p>

        {/* Benefits list */}
        <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 my-6 space-y-2.5 text-left">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Premium benefits:
          </span>
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-2.5">
              <div className="p-0.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                <Check className="w-3 h-3" />
              </div>
              <span className="text-xs text-slate-600 font-bold leading-normal">
                {benefit}
              </span>
            </div>
          ))}
        </div>

        {/* Action Button Links */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-2xl font-bold text-xs transition-all shadow-md hover:shadow-emerald-100 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span>WhatsApp Admin</span>
          </a>
          <a
            href={emailUrl}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-3 px-4 rounded-2xl font-bold text-xs transition-all shadow-md hover:shadow-slate-200/50 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Mail className="w-4 h-4 shrink-0" />
            <span>Email Support</span>
          </a>
        </div>

        <span className="text-[10px] font-bold text-slate-400 mt-4 block">
          Support will coordinate invoice and active state manual toggle
        </span>
      </div>
    </div>
  );
}
