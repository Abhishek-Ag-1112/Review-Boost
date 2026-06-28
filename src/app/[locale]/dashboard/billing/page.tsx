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
  TrendingDown,
  Store,
  Calendar,
  MessageCircle,
  Mail,
  ArrowUpRight,
  ArrowDownRight,
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
  const [selectedChange, setSelectedChange] = useState<'upgrade' | 'downgrade' | null>(null);

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

  const supportEmail = 'abhishek040478@gmail.com';
  const supportPhone = '+918829095225';

  const planLabels: Record<string, string> = {
    free: 'Free Trial',
    free_direct: 'Free Trial (Direct)',
    starter: 'Starter (₹399/mo)',
    starter_direct: 'Starter Direct (₹399/mo)',
    growth: 'Growth (₹799/mo)',
    growth_direct: 'Growth Direct (₹799/mo)',
  };

  const canChange = true;

  const handleRequestPlanChange = async (plan: string) => {
    if (!plan) return;
    setRequestSending(true);
    try {
      const res = await fetch('/api/upgrade-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: business.id,
          business_name: business.name,
          current_plan: business.plan,
          requested_plan: plan,
          contact_email: business.notification_email,
          contact_phone: business.whatsapp_number,
        })
      });

      if (res.ok) {
        setRequestSent(true);
      } else {
        alert('Failed to submit plan change request. Please try contacting support directly.');
      }
    } catch {
      alert('Network error. Please try again or contact support.');
    } finally {
      setRequestSending(false);
    }
  };

  const messageText = `Hello ReviewPe Support, I would like to change my business "${business.name}" plan from ${planLabels[business.plan]}. Please coordinate.`;
  const emailUrl = `mailto:${supportEmail}?subject=ReviewPe%20Plan%20Change%20Request&body=${encodeURIComponent(messageText)}`;
  const whatsappUrl = `https://wa.me/${supportPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(messageText)}`;

  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Subscription & Billing</h1>
        <p className="text-sm text-slate-500 font-semibold mt-1">View your current plan and request upgrades. Plan changes are managed by the ReviewPe admin team.</p>
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
          {business.plan === 'free' || business.plan === 'free_direct' ? (
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
              <h4 className="text-xl font-black text-slate-850">
                {planLabels[business.plan]}
              </h4>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-655 mt-2">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Started: {new Date(business.trial_started_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="border-t border-slate-200 mt-6 pt-4 text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-650" />
            <span>Plans managed by admin</span>
          </div>
        </div>
      </div>

      {/* Plan Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        {/* Free */}
        <div className={`bg-white rounded-3xl border p-5 shadow-sm relative flex flex-col justify-between ${(business.plan === 'free' || business.plan === 'free_direct') ? 'border-amber-400 ring-2 ring-amber-50' : 'border-slate-150'}`}>
          <div>
            {(business.plan === 'free' || business.plan === 'free_direct') && (
              <div className="absolute top-4 right-4 bg-amber-500 text-white font-extrabold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Current
              </div>
            )}
            <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-widest block">
              {business.plan === 'free_direct' ? 'Free Trial (Direct)' : 'Free Trial (Smart)'}
            </span>
            <h3 className="text-xl font-black text-slate-805 mt-2">₹0</h3>
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
          <button
            disabled
            className="w-full mt-6 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
          >
            {(business.plan === 'free' || business.plan === 'free_direct') ? 'Active Plan' : 'Unavailable'}
          </button>
        </div>

        {/* Starter (Funnel) */}
        <div className={`bg-white rounded-3xl border p-5 shadow-sm relative flex flex-col justify-between ${business.plan === 'starter' ? 'border-emerald-600 ring-2 ring-emerald-50' : 'border-slate-150'}`}>
          <div>
            {business.plan === 'starter' && (
              <div className="absolute top-4 right-4 bg-emerald-600 text-white font-extrabold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Current
              </div>
            )}
            <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest block">Starter (Funnel)</span>
            <h3 className="text-xl font-black text-slate-805 mt-2">₹399</h3>
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
          <button
            onClick={() => handleRequestPlanChange('starter')}
            disabled={business.plan === 'starter' || requestSending}
            className={`w-full mt-6 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              business.plan === 'starter' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default font-extrabold' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm border-transparent hover:shadow-emerald-100'
            }`}
          >
            {business.plan === 'starter' ? 'Active Plan' : 'Select Starter'}
          </button>
        </div>

        {/* Starter Direct */}
        <div className={`bg-white rounded-3xl border p-5 shadow-sm relative flex flex-col justify-between ${business.plan === 'starter_direct' ? 'border-teal-600 ring-2 ring-teal-50' : 'border-slate-150'}`}>
          <div>
            {business.plan === 'starter_direct' && (
              <div className="absolute top-4 right-4 bg-teal-600 text-white font-extrabold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Current
              </div>
            )}
            <span className="text-[10px] font-extrabold text-teal-600 uppercase tracking-widest block">Starter Direct</span>
            <h3 className="text-xl font-black text-slate-805 mt-2">₹399</h3>
            <span className="text-xs font-bold text-slate-400">/month</span>
            <div className="border-t border-slate-100 mt-4 pt-4 space-y-2.5">
              {['Direct Google Routing', 'AI Suggestions (All Stars)', 'WhatsApp/Email Alerts', 'Multi-Language', '1 Location', '1 NFC Card'].map(f => (
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
          <button
            onClick={() => handleRequestPlanChange('starter_direct')}
            disabled={business.plan === 'starter_direct' || requestSending}
            className={`w-full mt-6 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              business.plan === 'starter_direct' 
                ? 'bg-teal-50 text-teal-700 border-teal-200 cursor-default font-extrabold' 
                : 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm border-transparent hover:shadow-teal-100'
            }`}
          >
            {business.plan === 'starter_direct' ? 'Active Plan' : 'Select Starter Direct'}
          </button>
        </div>

        {/* Growth (Funnel) */}
        <div className={`bg-white rounded-3xl border p-5 shadow-sm relative flex flex-col justify-between ${business.plan === 'growth' ? 'border-indigo-600 ring-2 ring-indigo-50' : 'border-slate-150'}`}>
          <div>
            {business.plan === 'growth' && (
              <div className="absolute top-4 right-4 bg-indigo-600 text-white font-extrabold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Current
              </div>
            )}
            <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest block">Growth (Funnel)</span>
            <h3 className="text-xl font-black text-slate-805 mt-2">₹799</h3>
            <span className="text-xs font-bold text-slate-400">/month</span>
            <div className="border-t border-slate-100 mt-4 pt-4 space-y-2.5">
              {['QR Review Funnel', 'AI Suggestions', 'WhatsApp/Email Alerts', 'Multi-Language', 'Up to 3 Locations', 'Up to 3 NFC Cards', '3-Month Analytics History', 'Peak Scan Heatmap', 'Developer API', 'White-label'].map(f => (
                <div key={f} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <Check className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => handleRequestPlanChange('growth')}
            disabled={business.plan === 'growth' || requestSending}
            className={`w-full mt-6 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              business.plan === 'growth' 
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 cursor-default font-extrabold' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm border-transparent hover:shadow-indigo-150'
            }`}
          >
            {business.plan === 'growth' ? 'Active Plan' : 'Select Growth'}
          </button>
        </div>

        {/* Growth Direct */}
        <div className={`bg-white rounded-3xl border p-5 shadow-sm relative flex flex-col justify-between ${business.plan === 'growth_direct' ? 'border-violet-600 ring-2 ring-violet-50' : 'border-slate-150'}`}>
          <div>
            {business.plan === 'growth_direct' && (
              <div className="absolute top-4 right-4 bg-violet-600 text-white font-extrabold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Current
              </div>
            )}
            <span className="text-[10px] font-extrabold text-violet-600 uppercase tracking-widest block">Growth Direct</span>
            <h3 className="text-xl font-black text-slate-805 mt-2">₹799</h3>
            <span className="text-xs font-bold text-slate-400">/month</span>
            <div className="border-t border-slate-100 mt-4 pt-4 space-y-2.5">
              {['Direct Google Routing', 'AI Suggestions (All Stars)', 'WhatsApp/Email Alerts', 'Multi-Language', 'Up to 3 Locations', 'Up to 3 NFC Cards', '3-Month Analytics History', 'Peak Scan Heatmap', 'Developer API', 'White-label'].map(f => (
                <div key={f} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <Check className="w-3.5 h-3.5 text-violet-600" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => handleRequestPlanChange('growth_direct')}
            disabled={business.plan === 'growth_direct' || requestSending}
            className={`w-full mt-6 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              business.plan === 'growth_direct' 
                ? 'bg-violet-50 text-violet-750 border-violet-200 cursor-default font-extrabold' 
                : 'bg-violet-600 hover:bg-violet-700 text-white shadow-sm border-transparent hover:shadow-violet-100'
            }`}
          >
            {business.plan === 'growth_direct' ? 'Active Plan' : 'Select Growth Direct'}
          </button>
        </div>
      </div>

      {/* Plan Change Request Section */}
      {canChange ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm">
          {requestSent ? (
            <div className="text-center py-6 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Plan Change Request Submitted!</h3>
              <p className="text-xs font-semibold text-slate-400 mt-2 max-w-sm leading-relaxed">
                Our admin team has been notified. They will review your request and update your plan shortly. You can also reach out directly:
              </p>
              <div className="flex gap-3 mt-6">
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-5 rounded-xl font-bold text-xs transition-all shadow-sm">
                  <MessageCircle className="w-4 h-4" /><span>WhatsApp</span>
                </a>
                <a href={emailUrl} className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white py-2.5 px-5 rounded-xl font-bold text-xs transition-all shadow-sm">
                  <Mail className="w-4 h-4" /><span>Email</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-650" />
                <h3 className="font-black text-slate-800 text-sm">Request Plan Change</h3>
              </div>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                You are currently on <strong className="text-slate-700">{planLabels[business.plan]}</strong>. Click on one of the plan cards above to request a plan change, or get in touch with our team:
              </p>
              <div className="flex flex-wrap gap-3">
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-5 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5">
                  <MessageCircle className="w-4 h-4" /><span>WhatsApp Support</span>
                </a>
                <a href={emailUrl} className="bg-slate-800 hover:bg-slate-700 text-white py-3 px-5 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5">
                  <Mail className="w-4 h-4" /><span>Email Support</span>
                </a>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
