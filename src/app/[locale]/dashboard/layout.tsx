'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  MessageSquare, 
  QrCode, 
  MapPin, 
  Wifi, 
  BarChart3, 
  Settings, 
  CreditCard,
  LogOut,
  Menu,
  X,
  Store,
  ChevronDown,
  Lock,
  ExternalLink
} from 'lucide-react';
import { getFirstBusinessForOwner, Business } from '@/lib/db';

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

export default function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { locale } = params;
  const pathname = usePathname();
  
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    
    // Fetch merchant business
    getFirstBusinessForOwner('mock-owner')
      .then(b => {
        if (!b) {
          window.location.href = `/${locale}/onboarding`;
          return;
        }
        setBusiness(b);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to get business:', err);
        setLoading(false);
      });
  }, []);

  if (!mounted) return null;

  const handleLogout = async () => {
    // Call server-side logout to clear secure session cookie
    await fetch('/api/auth/logout', { method: 'POST' }).catch(err => console.error(err));
    // Clear client cookies
    document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.href = `/${locale}/login`;
  };

  const planLabels: Record<string, { label: string; style: string }> = {
    trial: { label: 'Free Trial', style: 'bg-amber-50 text-amber-700 border-amber-100' },
    starter: { label: 'Starter', style: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    growth: { label: 'Growth', style: 'bg-indigo-50 text-indigo-700 border-indigo-100' }
  };

  const planDetails = business ? (planLabels[business.plan] || planLabels.trial) : planLabels.trial;

  // Sidebar Links
  const navItems = [
    { name: 'Overview', href: `/dashboard`, icon: LayoutDashboard },
    { name: 'Reviews Inbox', href: `/dashboard/reviews`, icon: MessageSquare },
    { name: 'QR Code Generator', href: `/dashboard/qr`, icon: QrCode },
    { name: 'Analytics', href: `/dashboard/analytics`, icon: BarChart3 },
    { name: 'Locations', href: `/dashboard/locations`, icon: MapPin },
    { name: 'NFC Cards', href: `/dashboard/nfc`, icon: Wifi },
    { name: 'Settings', href: `/dashboard/settings`, icon: Settings },
    { name: 'Billing', href: `/dashboard/billing`, icon: CreditCard }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-6">
      {/* Brand logo & Store header */}
      <div className="space-y-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-extrabold text-base shadow-sm">
            R
          </div>
          <span className="font-extrabold text-slate-900 tracking-tight text-lg">Review<span className="text-emerald-600">Boost</span></span>
        </div>

        {/* Business summary card inside sidebar */}
        {loading ? (
          <div className="h-14 bg-slate-100 animate-pulse rounded-2xl" />
        ) : business ? (
          <div className="p-3 bg-slate-50 border border-slate-150 rounded-2xl flex items-center gap-3">
            {business.logo_url ? (
              <img src={business.logo_url} alt={business.name} className="w-9 h-9 rounded-full object-cover shadow-inner shrink-0 bg-white" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                {business.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-slate-800 text-xs truncate leading-tight">{business.name}</h4>
              <span className={`inline-block border text-[9px] font-bold px-1.5 py-0.5 rounded-md mt-1 ${planDetails.style}`}>
                {planDetails.label}
              </span>
            </div>
          </div>
        ) : null}

        {/* Navigation list */}
        <nav className="space-y-1 pt-4">
          {navItems.map((item) => {
            // Check active state. Standard routing prefix: e.g. /en/dashboard/reviews
            const localizedHref = `/${locale}${item.href}`;
            // Extract path details: is it matching active segment?
            const isActive = pathname === localizedHref || (item.href !== '/dashboard' && pathname.startsWith(localizedHref));
            
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={localizedHref}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 group ${isActive ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span>{item.name}</span>
                </div>
                {item.gated && (
                  <Lock className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-350'}`} />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Log out trigger */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-700 transition-all focus:outline-none"
      >
        <LogOut className="w-4.5 h-4.5 shrink-0" />
        <span>Log Out</span>
      </button>
    </div>
  );

  // Checks for suspension
  let suspensionView: React.ReactNode = null;
  let dueSoonBanner: React.ReactNode = null;

  if (business) {
    const isSuspended = business.payment_status === 'unpaid' && business.payment_due_date && (new Date() > new Date(new Date(business.payment_due_date).setHours(23, 59, 59, 999)));
    const isDeactivated = !business.is_active;

    if (isDeactivated) {
      suspensionView = (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 w-full">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-100 shadow-xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-6">
              <Lock className="w-8 h-8 shrink-0" />
            </div>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-red-50 border border-red-100 text-red-700 uppercase tracking-widest">
              Account Deactive
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight mt-4">
              Account Deactivated
            </h2>
            <p className="text-xs font-semibold text-slate-500 mt-2 leading-relaxed">
              This account is deactivated. For activation, please choose a plan or contact ReviewBoost.
            </p>
            <div className="w-full border-t border-slate-100 my-6 pt-6 flex flex-col gap-3">
              <Link
                href={`/${locale}/dashboard/billing`}
                className="w-full inline-block bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-2xl font-bold text-xs transition-colors text-center shadow-md shadow-emerald-100"
              >
                Choose a Plan
              </Link>
              <a
                href="mailto:support@reviewboost.com?subject=Account%20Reactivation"
                className="w-full inline-block bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-6 rounded-2xl font-bold text-xs transition-colors text-center border border-slate-200"
              >
                Contact ReviewBoost
              </a>
            </div>
          </div>
        </div>
      );
    } else if (isSuspended) {
      suspensionView = (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 w-full">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-100 shadow-xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-6">
              <Lock className="w-8 h-8 shrink-0" />
            </div>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-red-50 border border-red-100 text-red-700 uppercase tracking-widest">
              Payment Overdue
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight mt-4">
              Subscription Overdue
            </h2>
            <p className="text-xs font-semibold text-slate-400 mt-2 leading-relaxed">
              Your manual subscription renewal of ₹{business.payment_amount || 0} is overdue (Due: {business.payment_due_date}). Please clear your dues to restore access.
            </p>
            <div className="w-full border-t border-slate-100 my-6 pt-6">
              <Link
                href={`/${locale}/dashboard/billing`}
                className="w-full inline-block bg-slate-900 hover:bg-slate-800 text-white py-3 px-6 rounded-2xl font-bold text-xs transition-colors text-center"
              >
                Go to Billing Panel
              </Link>
            </div>
          </div>
        </div>
      );
    } else {
      // Check due soon warning banner
      const isDueSoon = business.payment_status === 'due_soon';
      let isWithin7Days = false;
      if (business.payment_due_date) {
        const dueDate = new Date(business.payment_due_date);
        const today = new Date();
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 7) {
          isWithin7Days = true;
        }
      }

      if (isDueSoon || isWithin7Days) {
        dueSoonBanner = (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-amber-800 animate-pulse">
            <div className="flex items-center gap-2.5">
              <Lock className="w-5 h-5 shrink-0 text-amber-600" />
              <div>
                <span className="text-xs font-black uppercase tracking-wider block">Subscription Due Soon</span>
                <p className="text-[11px] font-semibold text-amber-700 mt-0.5">
                  Your manual subscription renewal of ₹{business.payment_amount || 0} is due on {business.payment_due_date}. Please clear dues to prevent portal suspension.
                </p>
              </div>
            </div>
            <Link
              href={`/${locale}/dashboard/billing`}
              className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white font-bold py-1.5 px-3 rounded-xl text-[10px] transition-colors shadow-sm text-center"
            >
              Clear Due
            </Link>
          </div>
        );
      }
    }
  }

  // Active or Expired Free Trial Banners
  let trialBanner: React.ReactNode = null;
  let trialExpiredBanner: React.ReactNode = null;

  if (business && business.plan === 'trial') {
    if (business.trial_ended) {
      trialExpiredBanner = (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-rose-800">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 shrink-0 text-rose-600" />
            <div>
              <span className="text-xs font-black uppercase tracking-wider block text-rose-800">Trial Period Expired</span>
              <p className="text-[11px] font-semibold text-rose-700 mt-0.5">
                Your 30-day free trial has expired and your public QR funnel is currently paused. Choose a plan to keep your reviews flowing.
              </p>
            </div>
          </div>
          <Link
            href={`/${locale}/dashboard/billing`}
            className="shrink-0 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors shadow-sm text-center"
          >
            Choose a Plan
          </Link>
        </div>
      );
    } else {
      // Calculate remaining days
      const startedAt = new Date(business.trial_started_at).getTime();
      const elapsedMs = Date.now() - startedAt;
      const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
      const remainingDays = Math.max(0, 30 - elapsedDays);

      trialBanner = (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-emerald-800">
          <div className="flex items-center gap-2.5">
            <span className="text-xl shrink-0">🎁</span>
            <div>
              <span className="text-xs font-black uppercase tracking-wider block text-emerald-800">{remainingDays} days remaining in free trial</span>
              <p className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                You are on the 30-day Free Trial with all <strong>Growth</strong> features fully unlocked. Choose a plan to continue seamlessly.
              </p>
            </div>
          </div>
          <Link
            href={`/${locale}/dashboard/billing`}
            className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors shadow-sm text-center"
          >
            Upgrade Now
          </Link>
        </div>
      );
    }
  }

  const isBillingPage = pathname.includes('/billing');

  if (suspensionView && !isBillingPage) {
    return suspensionView;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden lg:block w-64 bg-white border-r border-slate-100 shrink-0 z-40">
        {sidebarContent}
      </aside>

      {/* Main Page Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="lg:hidden h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0 z-35">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1 text-slate-500 hover:text-slate-800 focus:outline-none"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-1.5">
            <div className="w-7.5 h-7.5 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
              R
            </div>
            <span className="font-extrabold text-slate-900 tracking-tight text-base">ReviewBoost</span>
          </div>

          <div className="w-6" /> {/* spacer */}
        </header>

        {/* Mobile Sidebar Modal Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 flex z-50">
            {/* Backdrop overlay */}
            <div 
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Sidebar box */}
            <div className="relative w-64 max-w-xs bg-white h-full flex flex-col shadow-2xl animate-slide-right z-50">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute right-4 top-4 p-1.5 rounded-full bg-slate-50 border text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
              {sidebarContent}
            </div>
          </div>
        )}

        {/* Dynamic route contents wrapper */}
        <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {/* Quick link to live review portal in header block */}
          {business && (
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm shrink-0">
              <div className="flex items-center gap-3">
                <Store className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Live Portal</span>
                  <span className="block font-bold text-slate-800 text-sm mt-0.5">{business.name}</span>
                </div>
              </div>
              <a
                href={`/${locale}/r/${business.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/20 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-all"
              >
                <span>Open Review Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {dueSoonBanner}
          {trialBanner}
          {trialExpiredBanner}

          <div className="relative">
            {children}
            
            {business?.trial_ended && (pathname.includes('/reviews') || pathname.includes('/qr') || pathname.includes('/analytics') || pathname.includes('/locations') || pathname.includes('/nfc') || pathname.includes('/settings')) && (
              <div className="absolute inset-0 bg-slate-50/70 backdrop-blur-[2px] z-50 rounded-2xl flex items-center justify-center p-6 min-h-[400px]">
                <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-150 shadow-2xl flex flex-col items-center text-center my-12">
                  <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
                    <Lock className="w-8 h-8 shrink-0" />
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-100 text-amber-700 uppercase tracking-widest">
                    Read-Only Lock
                  </span>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight mt-4">
                    Dashboard is Read-Only
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mt-2 leading-relaxed">
                    Your 30-day Free Trial has ended. Your public QR pages are paused, and dashboard editing is locked. Choose a plan to restore full access.
                  </p>
                  <Link
                    href={`/${locale}/dashboard/billing`}
                    className="w-full mt-6 inline-block bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-2xl font-bold text-xs transition-colors shadow-sm text-center"
                  >
                    Upgrade Plan & Unlock
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
