'use client';

import React, { useState, useEffect } from 'react';
import { 
  getFirstBusinessForOwner, 
  Business 
} from '@/lib/db';
import { 
  Check, 
  ShieldCheck, 
  AlertCircle,
  TrendingUp,
  Store,
  Calendar,
  MessageCircle,
  Mail,
  ArrowUpRight,
  Sparkles,
  Lock,
  CheckCircle2
} from 'lucide-react';

interface BillingPageProps {
  params: {
    locale: string;
  };
}

export default function BillingPage({ params }: BillingPageProps) {
  const { locale } = params;

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<Business | null>(null);
  const [requestSending, setRequestSending] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadBusiness();
  }, []);

  const loadBusiness = async () => {
    try {
      const b = await getFirstBusinessForOwner('mock-owner');
      if (b) {
        setBusiness(b);
      }
    } catch (err) {
      console.error("Failed to load business billing details:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-bold mt-3">Loading billing details...</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span className="text-sm font-bold">No active business account found. Please onboard first.</span>
      </div>
    );
  }

  // Calculate Trial progress bar values
  const startedAt = new Date(business.trial_started_at).getTime();
  const elapsedMs = Date.now() - startedAt;
  const elapsedDays = Math.max(0, Math.floor(elapsedMs / (1000 * 60 * 60 * 24)));
  const remainingDays = Math.max(0, 30 - elapsedDays);
  const trialProgress = Math.min(100, Math.round((elapsedDays / 30) * 100));

  const supportEmail = 'billing@reviewboost.com';
  const supportPhone = '+919876543210';

  const getNextPlan = (): 'starter' | 'growth' | null => {
    if (business.plan === 'free') return 'starter';
    if (business.plan === 'starter') return 'growth';
    return null; // Already on growth
  };

  const nextPlan = getNextPlan();

  const planLabels: Record<string, string> = {
    free: 'Free Trial',
    starter: 'Starter (₹399/mo)',
    growth: 'Growth (₹799/mo)',
  };

  const handleRequestUpgrade = async () => {
    if (!nextPlan) return;
    setRequestSending(true);
    try {
      const res = await fetch('/api/upgrade-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: business.id,
          business_name: business.name,
          current_plan: business.plan,
          requested_plan: nextPlan,
          contact_email: business.notification_email,
          contact_phone: business.whatsapp_number,
        })
      });

      if (res.ok) {
        setRequestSent(true);
      } else {
        alert('Failed to submit upgrade request. Please try contacting support directly.');
      }
    } catch {
      alert('Network error. Please try again or contact support.');
    } finally {
      setRequestSending(false);
    }
  };

  const messageText = `Hello ReviewBoost Support, I would like to upgrade my business "${business.name}" from ${planLabels[business.plan]} to ${nextPlan ? planLabels[nextPlan] : 'a higher plan'}. Please coordinate the invoice and activation.`;
  const emailUrl = `mailto:${supportEmail}?subject=ReviewBoost%20Upgrade%20Request&body=${encodeURIComponent(messageText)}`;
  const whatsappUrl = `https://wa.me/${supportPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(messageText)}`;

  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Subscription & Billing</h1>
        <p className="text-sm text-slate-500 font-semibold mt-1">View your current plan and request upgrades. Plan changes are managed by the ReviewBoost admin team.</p>
      </div>

      {/* Subscription Summary Panel */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Merchant</span>
              <h3 className="font-extrabold text-slate-800 text-sm mt-0.5">{business.name}</h3>
            </div>
          </div>

          {/* Plan Status */}
          {business.plan === 'free' ? (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-700">Free Plan Progress</span>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-amber-50 border border-amber-100 text-amber-700 uppercase tracking-wide">
                    {remainingDays} Days Left
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-400">{elapsedDays}/30 Days</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${business.trial_ended ? 'bg-rose-500' : 'bg-amber-500'}`}
                  style={{ width: `${trialProgress}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-semibold leading-normal">
                {business.trial_ended 
                  ? "❌ Your free plan period expired. Request an upgrade below to reactivate your portal." 
                  : "💡 Enjoying the free plan? Request an upgrade to Starter or Growth — our admin team will activate it for you."}
              </p>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-2xl flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 text-xs">Plan Active: {planLabels[business.plan]}</h4>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">
                  Your portal is in good standing.{business.payment_due_date && ` Next billing cycle: ${business.payment_due_date}.`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Plan Summary Card */}
        <div className="p-6 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Current Plan</span>
            <div>
              <h4 className="text-xl font-black text-slate-800">
                {business.plan === 'free' ? 'Free Trial' : business.plan === 'starter' ? 'Starter Tier' : 'Growth Tier'}
              </h4>
              <span className="text-xs font-bold text-slate-400 block mt-1">
                {business.plan === 'free' ? '30-day trial' : business.plan === 'starter' ? '₹399/month' : '₹799/month'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mt-2">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Started: {new Date(business.trial_started_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="border-t border-slate-200 mt-6 pt-4 text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Plans managed by admin</span>
          </div>
        </div>
      </div>

      {/* Plan Comparison — Read Only */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Free */}
        <div className={`bg-white rounded-3xl border p-6 shadow-sm relative ${business.plan === 'free' ? 'border-amber-400 ring-2 ring-amber-50' : 'border-slate-150'}`}>
          {business.plan === 'free' && (
            <div className="absolute top-4 right-4 bg-amber-500 text-white font-extrabold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Current
            </div>
          )}
          <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-widest block">Free Trial</span>
          <h3 className="text-xl font-black text-slate-800 mt-2">₹0</h3>
          <span className="text-xs font-bold text-slate-400">30-day trial</span>
          <div className="border-t border-slate-100 mt-4 pt-4 space-y-2.5">
            {['QR Review Funnel', 'AI Suggestions', 'WhatsApp/Email Alerts'].map(f => (
              <div key={f} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>{f}</span>
              </div>
            ))}
            {['Multi-Language', 'Multiple Locations', 'NFC Cards', 'Developer API'].map(f => (
              <div key={f} className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Lock className="w-3.5 h-3.5" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Starter */}
        <div className={`bg-white rounded-3xl border p-6 shadow-sm relative ${business.plan === 'starter' ? 'border-emerald-600 ring-2 ring-emerald-50' : 'border-slate-150'}`}>
          {business.plan === 'starter' && (
            <div className="absolute top-4 right-4 bg-emerald-600 text-white font-extrabold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Current
            </div>
          )}
          <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest block">Starter</span>
          <h3 className="text-xl font-black text-slate-800 mt-2">₹399</h3>
          <span className="text-xs font-bold text-slate-400">/month</span>
          <div className="border-t border-slate-100 mt-4 pt-4 space-y-2.5">
            {['QR Review Funnel', 'AI Suggestions', 'WhatsApp/Email Alerts', 'Multi-Language', '1 Location', '1 NFC Card'].map(f => (
              <div key={f} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>{f}</span>
              </div>
            ))}
            {['Multiple Locations', 'Developer API'].map(f => (
              <div key={f} className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Lock className="w-3.5 h-3.5" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Growth */}
        <div className={`bg-white rounded-3xl border p-6 shadow-sm relative ${business.plan === 'growth' ? 'border-indigo-600 ring-2 ring-indigo-50' : 'border-slate-150'}`}>
          {business.plan === 'growth' && (
            <div className="absolute top-4 right-4 bg-indigo-600 text-white font-extrabold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Current
            </div>
          )}
          <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest block">Growth</span>
          <h3 className="text-xl font-black text-slate-800 mt-2">₹799</h3>
          <span className="text-xs font-bold text-slate-400">/month</span>
          <div className="border-t border-slate-100 mt-4 pt-4 space-y-2.5">
            {['QR Review Funnel', 'AI Suggestions', 'WhatsApp/Email Alerts', 'Multi-Language', 'Up to 10 Locations', 'Up to 10 NFC Cards', 'Peak Scan Heatmap', 'Developer API', 'White-label'].map(f => (
              <div key={f} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <Check className="w-3.5 h-3.5 text-indigo-600" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upgrade Request Section */}
      {nextPlan ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm">
          {requestSent ? (
            <div className="text-center py-6 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Upgrade Request Submitted!</h3>
              <p className="text-xs font-semibold text-slate-400 mt-2 max-w-sm leading-relaxed">
                Our admin team has been notified. They will review your request and activate your <strong className="text-emerald-700">{planLabels[nextPlan]}</strong> plan shortly. You can also reach out directly:
              </p>
              <div className="flex gap-3 mt-6">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-5 rounded-xl font-bold text-xs transition-all shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={emailUrl}
                  className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white py-2.5 px-5 rounded-xl font-bold text-xs transition-all shadow-sm"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-black text-slate-800 text-sm">Ready to upgrade?</h3>
                </div>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                  Upgrade from <strong className="text-slate-700">{planLabels[business.plan]}</strong> to <strong className="text-indigo-600">{planLabels[nextPlan]}</strong>. Submit a request and our admin team will activate it for you. You can also contact support directly via WhatsApp or Email.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <button
                  onClick={handleRequestUpgrade}
                  disabled={requestSending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-xl font-bold text-xs transition-all shadow-md hover:shadow-indigo-100 flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {requestSending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ArrowUpRight className="w-4 h-4" />
                      <span>Request Upgrade</span>
                    </>
                  )}
                </button>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-5 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={emailUrl}
                  className="bg-slate-800 hover:bg-slate-700 text-white py-3 px-5 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </a>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-indigo-50/30 border border-indigo-100 rounded-3xl p-6 text-center">
          <TrendingUp className="w-8 h-8 text-indigo-500 mx-auto mb-3" />
          <h3 className="font-black text-slate-800 text-sm">You're on the highest plan!</h3>
          <p className="text-xs font-semibold text-slate-400 mt-1">
            You have access to all ReviewBoost features. For enterprise or custom needs, contact support.
          </p>
        </div>
      )}
    </div>
  );
}
