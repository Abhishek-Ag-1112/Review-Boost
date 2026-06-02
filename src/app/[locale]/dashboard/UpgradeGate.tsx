'use client';

import React, { useState } from 'react';
import { Lock, Check, Sparkles, ChevronRight } from 'lucide-react';
import { updateBusinessSettings } from '@/lib/db';

interface UpgradeGateProps {
  businessId: string;
  currentPlan: 'free' | 'starter' | 'growth' | 'agency';
  planNeeded: 'growth' | 'agency';
  featureName: string;
  benefits: string[];
  onUpgrade: () => void;
}

export default function UpgradeGate({
  businessId,
  currentPlan,
  planNeeded,
  featureName,
  benefits,
  onUpgrade
}: UpgradeGateProps) {
  const [upgrading, setUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      // Simulate upgrading plan
      await updateBusinessSettings(businessId, { plan: planNeeded });
      // Call callback to refresh parent state
      onUpgrade();
    } catch (err) {
      console.error('Failed to simulate upgrade:', err);
    } finally {
      setUpgrading(false);
    }
  };

  const planTitles = {
    growth: 'Growth Plan',
    agency: 'Agency Pro'
  };

  return (
    <div className="relative min-h-[400px] flex items-center justify-center p-6 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 overflow-hidden">
      {/* Abstract background blobs */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-emerald-100/30 blur-3xl" />
      <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-72 h-72 rounded-full bg-indigo-100/30 blur-3xl" />

      <div className="relative max-w-md w-full bg-white p-8 rounded-3xl border border-slate-100 shadow-xl flex flex-col items-center text-center">
        {/* Animated Icon Ring */}
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
        
        <p className="text-xs font-semibold text-slate-400 mt-2">
          This feature requires the <strong className="text-indigo-600 font-extrabold">{planTitles[planNeeded]}</strong>. 
          Upgrade to unlock advanced operations and grow your business.
        </p>

        {/* Benefits list */}
        <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 my-6 space-y-2.5 text-left">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            What you get:
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

        {/* Action Button */}
        <button
          onClick={handleUpgrade}
          disabled={upgrading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-3.5 px-6 rounded-2xl font-bold text-sm transition-all shadow-md hover:shadow-indigo-200/50 flex items-center justify-center gap-2 group cursor-pointer"
        >
          {upgrading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Upgrade to {planTitles[planNeeded]}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>

        <span className="text-[10px] font-bold text-slate-400 mt-3 block">
          Instant activation • Cancel or downgrade anytime
        </span>
      </div>
    </div>
  );
}
