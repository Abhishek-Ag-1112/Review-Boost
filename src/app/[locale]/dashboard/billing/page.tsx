'use client';

import React, { useState, useEffect } from 'react';
import { 
  getFirstBusinessForOwner, 
  updateBusinessSettings, 
  Business 
} from '@/lib/db';
import { 
  CreditCard, 
  Check, 
  Smartphone, 
  ShieldCheck, 
  Loader2, 
  QrCode, 
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Store,
  Calendar
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

  // Checkout Simulator States
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'growth'>('starter');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'success'>('form');

  // Form input states
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

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

  const planPricing = {
    starter: { name: 'Starter Plan', price: 399 },
    growth: { name: 'Growth Plan', price: 799 }
  };

  const handleCheckoutClick = (plan: 'starter' | 'growth') => {
    setSelectedPlan(plan);
    setCheckoutStep('form');
    setPaymentMethod('upi');
    setShowCheckoutModal(true);
  };

  const handleSimulatedPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Instantly upgrade active business plan state inside db mock store
      const updated = await updateBusinessSettings(business.id, {
        plan: selectedPlan,
        trial_ended: false,
        is_active: true,
        payment_status: 'paid',
        payment_due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Next cycle in 30 days
        payment_amount: planPricing[selectedPlan].price
      });

      if (updated) {
        setBusiness(updated);
        setCheckoutStep('success');
      }
    } catch (err) {
      console.error("Upgrade checkout failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseModal = () => {
    setShowCheckoutModal(false);
    // Force a reload of the window to propagate changes to layout sidebar instantly!
    window.location.reload();
  };

  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Subscription & Billing</h1>
        <p className="text-sm text-slate-500 font-semibold mt-1">Manage your active SaaS tier, view payment schedules, and simulator checkouts.</p>
      </div>

      {/* Subscription Summary Panel */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Merchant ID</span>
              <h3 className="font-extrabold text-slate-800 text-sm mt-0.5">{business.name}</h3>
            </div>
          </div>

          {/* Plan Status Badges */}
          {business.plan === 'trial' ? (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-700">Free Trial Progress</span>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-amber-50 border border-amber-100 text-amber-700 uppercase tracking-wide">
                    {remainingDays} Days Left
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-400">{elapsedDays}/30 Days</span>
              </div>
              {/* Progress track */}
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${business.trial_ended ? 'bg-rose-500' : 'bg-amber-500'}`}
                  style={{ width: `${trialProgress}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-semibold leading-normal">
                {business.trial_ended 
                  ? "❌ Your free trial expired. Please select a plan below to reactive and keep scans flowing." 
                  : "💡 Enjoying the trial? Select Starter or Growth below. Your payment will only start when trial period expires!"}
              </p>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-2xl flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 text-xs">Plan Active: {business.plan === 'starter' ? 'Starter (₹399/mo)' : 'Growth (₹799/mo)'}</h4>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">
                  Your portal is in good standing. Next automatic simulated billing charge of ₹{business.plan === 'starter' ? '399' : '799'} will be processed on <strong>{business.payment_due_date || 'N/A'}</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Plan Billing Card */}
        <div className="p-6 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Active Plan Summary</span>
            <div>
              <h4 className="text-xl font-black text-slate-800">
                {business.plan === 'trial' ? 'Free Trial Period' : business.plan === 'starter' ? 'Starter Tier' : 'Growth Tier'}
              </h4>
              <span className="text-xs font-bold text-slate-400 block mt-1">
                {business.plan === 'trial' ? 'Full Growth Access' : business.plan === 'starter' ? '₹399/month' : '₹799/month'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mt-2">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Started: {new Date(business.trial_started_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="border-t border-slate-200 mt-6 pt-4 text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secure billing via Razorpay</span>
          </div>
        </div>
      </div>

      {/* Plan Card Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        {/* Starter Plan card */}
        <div className={`bg-white rounded-3xl border p-8 shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between ${business.plan === 'starter' ? 'border-emerald-600 ring-2 ring-emerald-50 bg-emerald-50/5' : 'border-slate-150'}`}>
          {business.plan === 'starter' && (
            <div className="absolute top-4 right-4 bg-emerald-600 text-white font-extrabold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Current Tier
            </div>
          )}
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Single-Location Business</span>
            <h3 className="text-xl font-black text-slate-800 mt-2">Starter Tier</h3>
            <p className="text-xs font-semibold text-slate-400 mt-1 leading-normal">
              Ideal for independent kiranas, local restaurants, salons and small single shops.
            </p>
            <div className="my-6">
              <span className="text-3xl font-black text-slate-900">₹399</span>
              <span className="text-slate-400 text-xs font-bold ml-1">/ month</span>
            </div>
            <div className="border-t border-slate-100 pt-6 space-y-3.5">
              <div className="flex items-center gap-2.5 text-xs font-bold text-slate-600">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>1 Registered Location limit</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-bold text-slate-600">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>1 NFC Tap Card Support</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-bold text-slate-600">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Branded Center Logo QR</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-bold text-slate-600">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>AI Review helper suggestions</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => handleCheckoutClick('starter')}
            disabled={business.plan === 'starter'}
            className={`w-full font-bold py-3 rounded-xl text-xs transition-all mt-8 focus:outline-none cursor-pointer ${
              business.plan === 'starter' 
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed' 
                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
            }`}
          >
            {business.plan === 'starter' ? 'Active Plan' : 'Select Starter Plan'}
          </button>
        </div>

        {/* Growth Plan card */}
        <div className={`bg-white rounded-3xl border p-8 shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between ${business.plan === 'growth' ? 'border-indigo-650 ring-2 ring-indigo-50 bg-indigo-50/5' : 'border-slate-150'}`}>
          {business.plan === 'growth' && (
            <div className="absolute top-4 right-4 bg-indigo-600 text-white font-extrabold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Current Tier
            </div>
          )}
          <div>
            <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest block font-bold">Multi-Location & Chains</span>
            <h3 className="text-xl font-black text-slate-800 mt-2">Growth Tier</h3>
            <p className="text-xs font-semibold text-slate-400 mt-1 leading-normal">
              Ideal for multi-location businesses, boutique chains, agency accounts, and hotels.
            </p>
            <div className="my-6">
              <span className="text-3xl font-black text-slate-900">₹799</span>
              <span className="text-slate-400 text-xs font-bold ml-1">/ month</span>
            </div>
            <div className="border-t border-slate-100 pt-6 space-y-3.5">
              <div className="flex items-center gap-2.5 text-xs font-bold text-slate-650">
                <Check className="w-4 h-4 text-indigo-600" />
                <span>Up to 10 Physical Locations</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-bold text-slate-650">
                <Check className="w-4 h-4 text-indigo-600" />
                <span>Up to 10 NFC cards supported</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-bold text-slate-650">
                <Check className="w-4 h-4 text-indigo-600" />
                <span>Analytics peak heatmap & funnel</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-bold text-slate-650">
                <Check className="w-4 h-4 text-indigo-600" />
                <span>White-label Review Pages</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-bold text-slate-650">
                <Check className="w-4 h-4 text-indigo-600" />
                <span>Public developer API Keys</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => handleCheckoutClick('growth')}
            disabled={business.plan === 'growth'}
            className={`w-full font-bold py-3 rounded-xl text-xs transition-all mt-8 focus:outline-none cursor-pointer ${
              business.plan === 'growth' 
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-105/20'
            }`}
          >
            {business.plan === 'growth' ? 'Active Plan' : 'Select Growth Plan'}
          </button>
        </div>
      </div>

      {/* Checkout Simulator Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => !isProcessing && handleCloseModal()}
          />
          <div className="relative bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md p-6 overflow-hidden animate-slide-up z-50">
            {checkoutStep === 'form' ? (
              <div>
                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100">
                  Razorpay Checkout Simulator
                </span>
                <h3 className="text-lg font-black text-slate-900 tracking-tight mt-3 mb-1">
                  Complete subscription payment
                </h3>
                <p className="text-xs text-slate-400 font-semibold mb-6">
                  Select payment method to process your simulated monthly charge of <strong>₹{planPricing[selectedPlan].price}</strong>.
                </p>

                {/* Tab select payment method */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 border border-slate-150 rounded-xl mb-6">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${paymentMethod === 'upi' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    UPI QR Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${paymentMethod === 'card' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Credit / Debit Card
                  </button>
                </div>

                <form onSubmit={handleSimulatedPayment} className="space-y-4">
                  {paymentMethod === 'upi' ? (
                    <div className="flex flex-col items-center text-center p-4 bg-slate-50 border border-slate-150 rounded-2xl">
                      {/* Interactive mock QR Code */}
                      <div className="bg-white p-3 rounded-2xl border shadow-sm mb-3.5 relative group">
                        <QrCode className="w-36 h-36 text-slate-800" />
                        <div className="absolute inset-0 bg-white/90 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                          <span className="text-[10px] font-black text-indigo-600">Merchant UPI: rb@upi</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider block">Scan with GPay, PhonePe or Paytm</span>
                      <p className="text-[9px] font-semibold text-slate-400 mt-1 max-w-xs leading-normal">
                        This is a simulated Razorpay UPI gateway. Scan or simply click the action below to emulate a successful transaction scan response.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cardholder Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Rahul Sharma"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-850 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Card Number</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 4111 2222 3333 4444"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-850 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expiry Date</label>
                          <input
                            type="text"
                            required
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-850 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-center"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CVV</label>
                          <input
                            type="password"
                            required
                            maxLength={3}
                            placeholder="***"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-850 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-center font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleCloseModal()}
                      className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-md hover:shadow-indigo-250 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <span>Simulate Pay ₹{planPricing[selectedPlan].price}</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="text-center py-6 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 border border-emerald-100 shadow-inner animate-scale-up">
                  <ShieldCheck className="w-9 h-9" />
                </div>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 uppercase tracking-widest">
                  Upgrade Successful
                </span>
                <h3 className="text-lg font-black text-slate-900 tracking-tight mt-4">
                  Portal Reactivated!
                </h3>
                <p className="text-xs font-semibold text-slate-400 mt-2 max-w-sm leading-relaxed">
                  Your payment of <strong>₹{planPricing[selectedPlan].price}</strong> was captured successfully. Your ReviewBoost <strong>{selectedPlan === 'starter' ? 'Starter' : 'Growth'}</strong> plan is now active. Your public QR pages have been reactivated!
                </p>

                <button
                  type="button"
                  onClick={() => handleCloseModal()}
                  className="w-full mt-8 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-2xl text-xs transition-colors shadow-md focus:outline-none"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
