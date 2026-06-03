'use client';

import React, { useState, useEffect } from 'react';
import { getAllBusinesses, getReviewsInbox, getAllUpgradeRequests, updateUpgradeRequestStatus, Business, Review, UpgradeRequest } from '@/lib/db';
import { 
  Building2, 
  ShieldAlert, 
  DollarSign, 
  Save, 
  Calendar, 
  ArrowLeft,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  LayoutDashboard,
  MessageSquare,
  BarChart3,
  Settings,
  Star,
  TrendingUp,
  Users,
  QrCode,
  Filter,
  ChevronDown,
  X,
  RefreshCw,
  Sparkles,
  Clock,
  MapPin,
  ExternalLink,
  Check,
  ArrowUpRight,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Link from 'next/link';

type AdminTab = 'dashboard' | 'businesses' | 'reviews' | 'upgrade_requests' | 'settings';

export default function AdminControlPanel({ params }: { params: { locale: string } }) {
  const { locale } = params;

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [upgradeRequests, setUpgradeRequests] = useState<UpgradeRequest[]>([]);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Business management
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  // Reviews management
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewStarFilter, setReviewStarFilter] = useState<string>('all');
  const [reviewTypeFilter, setReviewTypeFilter] = useState<string>('all');
  const [reviewBusinessFilter, setReviewBusinessFilter] = useState<string>('all');
  const [expandedReview, setExpandedReview] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const all = await getAllBusinesses();
      setBusinesses(all);

      // Load reviews for all businesses
      const reviewPromises = all.map(b => getReviewsInbox(b.id, {}));
      const reviewResults = await Promise.all(reviewPromises);
      const combined = reviewResults.flat();
      setAllReviews(combined);

      // Load upgrade requests
      const reqs = await getAllUpgradeRequests();
      setUpgradeRequests(reqs);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-bold mt-4 tracking-wider uppercase">Loading Admin Console...</p>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  //  BUSINESS MANAGEMENT HANDLERS
  // ═══════════════════════════════════════════

  const handleFieldChange = (id: string, field: keyof Business, value: any) => {
    setBusinesses(businesses.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const handleSaveChanges = async (id: string) => {
    const business = businesses.find(b => b.id === id);
    if (!business) return;

    setSavingId(id);
    try {
      const res = await fetch('/api/business/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: id,
          plan: business.plan,
          is_active: business.is_active,
          payment_status: business.payment_status,
          payment_due_date: business.payment_due_date,
          payment_amount: business.payment_amount,
          trial_ended: business.trial_ended,
          trial_started_at: business.trial_started_at
        })
      });

      if (res.ok) {
        setSuccessId(id);
        setTimeout(() => setSuccessId(null), 2500);
      } else {
        const errData = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Save failed:', errData);
        alert(`Failed to save: ${errData.error || 'Server error'}`);
      }
    } catch (e: any) {
      console.error(e);
      alert(`Internal error: ${e?.message || 'Network error'}`);
    } finally {
      setSavingId(null);
    }
  };

  // ═══════════════════════════════════════════
  //  COMPUTED METRICS
  // ═══════════════════════════════════════════

  const totalCount = businesses.length;
  const activeCount = businesses.filter(b => b.is_active).length;
  const freeCount = businesses.filter(b => b.plan === 'free').length;
  const starterCount = businesses.filter(b => b.plan === 'starter').length;
  const growthCount = businesses.filter(b => b.plan === 'growth').length;
  
  const pendingPayments = businesses.filter(b => 
    b.payment_status === 'unpaid' || b.payment_status === 'due_soon'
  ).length;

  const totalDuesAmount = businesses.reduce((sum, curr) => {
    if (curr.payment_status === 'unpaid' || curr.payment_status === 'due_soon') {
      return sum + (curr.payment_amount || 0);
    }
    return sum;
  }, 0);

  const totalReviewCount = allReviews.length;
  const publicReviewCount = allReviews.filter(r => r.is_public).length;
  const privateReviewCount = allReviews.filter(r => !r.is_public).length;
  const unresolvedCount = allReviews.filter(r => !r.is_public && !r.is_resolved).length;
  const avgStars = totalReviewCount > 0 
    ? (allReviews.reduce((sum, r) => sum + r.stars, 0) / totalReviewCount).toFixed(1) 
    : '0.0';

  // ═══════════════════════════════════════════
  //  FILTERED DATA
  // ═══════════════════════════════════════════

  const filteredBusinesses = businesses.filter(b => {
    const matchSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        b.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPlan = planFilter === 'all' || b.plan === planFilter;
    const matchStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && b.is_active) || 
      (statusFilter === 'inactive' && !b.is_active);
    return matchSearch && matchPlan && matchStatus;
  });

  const filteredReviews = allReviews.filter(r => {
    const matchSearch = reviewSearch === '' || 
      (r.custom_text?.toLowerCase().includes(reviewSearch.toLowerCase())) ||
      (r.private_feedback?.toLowerCase().includes(reviewSearch.toLowerCase())) ||
      (r.customer_name?.toLowerCase().includes(reviewSearch.toLowerCase()));
    const matchStars = reviewStarFilter === 'all' || r.stars === parseInt(reviewStarFilter);
    const matchType = reviewTypeFilter === 'all' || 
      (reviewTypeFilter === 'public' && r.is_public) || 
      (reviewTypeFilter === 'private' && !r.is_public);
    const matchBusiness = reviewBusinessFilter === 'all' || r.business_id === reviewBusinessFilter;
    return matchSearch && matchStars && matchType && matchBusiness;
  });

  // Helper to get business name by ID
  const getBusinessName = (businessId: string) => {
    return businesses.find(b => b.id === businessId)?.name || 'Unknown';
  };

  const getBusinessSlug = (businessId: string) => {
    return businesses.find(b => b.id === businessId)?.slug || '';
  };

  // Plan badge styling
  const planBadge = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'starter': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'growth': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  // ═══════════════════════════════════════════
  //  TAB: DASHBOARD
  // ═══════════════════════════════════════════

  const DashboardTab = () => (
    <div className="space-y-8">
      {/* Platform KPIs — Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Merchants</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-slate-900 tracking-tight">{totalCount}</span>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{activeCount} active</span>
            <span className="text-[9px] font-bold text-slate-400">{totalCount - activeCount} inactive</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Reviews</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-slate-900 tracking-tight">{totalReviewCount}</span>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{publicReviewCount} public</span>
            <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">{privateReviewCount} private</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Avg Rating</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-500">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-slate-900 tracking-tight">{avgStars}</span>
          <div className="flex items-center gap-1 mt-2">
            {[1,2,3,4,5].map(s => (
              <Star key={s} className={`w-3 h-3 ${parseFloat(avgStars) >= s ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Outstanding Dues</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-500">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-slate-900 tracking-tight">₹{totalDuesAmount}</span>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">{pendingPayments} pending</span>
          </div>
        </div>
      </div>

      {/* Plan Distribution — Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-3">Plan Distribution</span>
          <div className="space-y-3">
            {[
              { label: 'Free Plan', count: freeCount, color: 'bg-amber-500', pct: totalCount ? Math.round((freeCount / totalCount) * 100) : 0 },
              { label: 'Starter', count: starterCount, color: 'bg-emerald-500', pct: totalCount ? Math.round((starterCount / totalCount) * 100) : 0 },
              { label: 'Growth', count: growthCount, color: 'bg-indigo-500', pct: totalCount ? Math.round((growthCount / totalCount) * 100) : 0 },
            ].map(item => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-700">{item.label}</span>
                  <span className="text-xs font-black text-slate-500">{item.count} ({item.pct}%)</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-3">Unresolved Complaints</span>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black ${unresolvedCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {unresolvedCount}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">
                {unresolvedCount > 0 ? 'Feedbacks need attention' : 'All resolved!'}
              </p>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                {privateReviewCount} total private feedbacks received
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-3">Revenue Pipeline</span>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Starter MRR</span>
              <span className="text-xs font-black text-slate-800">₹{starterCount * 399}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Growth MRR</span>
              <span className="text-xs font-black text-slate-800">₹{growthCount * 799}</span>
            </div>
            <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
              <span className="text-xs font-black text-slate-800">Total MRR</span>
              <span className="text-sm font-black text-emerald-600">₹{starterCount * 399 + growthCount * 799}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-black text-slate-700">Recent Reviews</span>
          <button onClick={() => setActiveTab('reviews')} className="text-[10px] font-bold text-emerald-600 hover:underline">View All →</button>
        </div>
        <div className="divide-y divide-slate-50">
          {allReviews.slice(0, 5).map(r => (
            <div key={r.id} className="px-6 py-3 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`w-3 h-3 ${r.stars >= s ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-700 truncate">
                  {r.is_public ? (r.custom_text || 'Public review') : (r.private_feedback || 'Private feedback')}
                </p>
              </div>
              <span className="text-[9px] font-bold text-slate-400 shrink-0">{getBusinessName(r.business_id)}</span>
              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full border shrink-0 ${r.is_public ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                {r.is_public ? 'PUBLIC' : 'PRIVATE'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════
  //  TAB: BUSINESSES
  // ═══════════════════════════════════════════

  const BusinessesTab = () => (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex items-center px-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by name or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs font-bold text-slate-700 placeholder-slate-400 bg-transparent py-2.5 pl-2.5 focus:outline-none"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="p-0.5 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 shadow-sm cursor-pointer"
        >
          <option value="all">All Plans</option>
          <option value="free">Free</option>
          <option value="starter">Starter</option>
          <option value="growth">Growth</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 shadow-sm cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <span className="text-[10px] font-bold text-slate-400 ml-auto">
          Showing {filteredBusinesses.length} of {totalCount}
        </span>
      </div>

      {/* Businesses Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {filteredBusinesses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="py-3.5 px-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Merchant</th>
                  <th className="py-3.5 px-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Plan</th>
                  <th className="py-3.5 px-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Expired</th>
                  <th className="py-3.5 px-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="py-3.5 px-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Payment</th>
                  <th className="py-3.5 px-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="py-3.5 px-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Due Date</th>
                  <th className="py-3.5 px-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredBusinesses.map((b) => {
                  const isOverdue = b.payment_status === 'unpaid' && b.payment_due_date && (new Date() > new Date(new Date(b.payment_due_date).setHours(23, 59, 59, 999)));

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs shrink-0">
                            {b.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-800 text-xs truncate max-w-[180px]">{b.name}</h4>
                            <span className="text-[9px] font-bold text-slate-400 font-mono">/{b.slug}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="flex flex-col gap-1.5">
                          <select
                            value={b.plan}
                            onChange={(e) => {
                              const newPlan = e.target.value as 'free' | 'starter' | 'growth';
                              handleFieldChange(b.id, 'plan', newPlan);
                              if (newPlan !== 'free') {
                                handleFieldChange(b.id, 'trial_ended', false);
                              }
                            }}
                            className="text-[10px] font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer w-24"
                          >
                            <option value="free">Free</option>
                            <option value="starter">Starter</option>
                            <option value="growth">Growth</option>
                          </select>
                          
                          {b.plan === 'free' && (
                            <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-lg px-1.5 py-0.5 w-24">
                              <Calendar className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                              <input
                                type="date"
                                value={b.trial_started_at ? b.trial_started_at.split('T')[0] : ''}
                                onChange={(e) => handleFieldChange(b.id, 'trial_started_at', e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString())}
                                className="bg-transparent text-[8px] font-bold text-slate-500 w-full focus:outline-none cursor-pointer"
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-5 text-center">
                        <input
                          type="checkbox"
                          checked={b.trial_ended}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            handleFieldChange(b.id, 'trial_ended', checked);
                            if (checked) {
                              handleFieldChange(b.id, 'is_active', false);
                            } else {
                              handleFieldChange(b.id, 'is_active', true);
                            }
                          }}
                          className="w-3.5 h-3.5 rounded text-rose-600 border-slate-200 focus:ring-rose-500 cursor-pointer"
                        />
                      </td>

                      <td className="py-3.5 px-5">
                        <button
                          onClick={() => handleFieldChange(b.id, 'is_active', !b.is_active)}
                          className={`text-[9px] font-black px-2.5 py-1 rounded-full border cursor-pointer transition-all ${
                            b.is_active 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {b.is_active ? '● Active' : '○ Suspended'}
                        </button>
                      </td>

                      <td className="py-3.5 px-5">
                        <select
                          value={b.payment_status || 'paid'}
                          onChange={(e) => handleFieldChange(b.id, 'payment_status', e.target.value)}
                          className={`text-[9px] font-black bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none cursor-pointer w-24 ${
                            b.payment_status === 'paid' 
                              ? 'text-emerald-700' 
                              : b.payment_status === 'due_soon' 
                                ? 'text-amber-600' 
                                : 'text-red-600'
                          }`}
                        >
                          <option value="paid">Paid</option>
                          <option value="due_soon">Due Soon</option>
                          <option value="unpaid">Unpaid</option>
                        </select>
                        {isOverdue && (
                          <span className="text-[7px] font-black text-red-600 uppercase tracking-widest block mt-0.5 pl-1">(OVERDUE)</span>
                        )}
                      </td>

                      <td className="py-3.5 px-5">
                        <input
                          type="number"
                          value={b.payment_amount ?? 0}
                          onChange={(e) => handleFieldChange(b.id, 'payment_amount', parseInt(e.target.value, 10))}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 w-16 text-[10px] font-bold text-slate-700 text-center focus:outline-none focus:border-indigo-500"
                        />
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 w-28">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          <input
                            type="date"
                            value={b.payment_due_date || ''}
                            onChange={(e) => handleFieldChange(b.id, 'payment_due_date', e.target.value || null)}
                            className="bg-transparent text-[9px] font-bold text-slate-600 w-full focus:outline-none cursor-pointer"
                          />
                        </div>
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSaveChanges(b.id)}
                            disabled={savingId === b.id}
                            title="Save changes"
                            className="p-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
                          >
                            {savingId === b.id ? (
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : successId === b.id ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Save className="w-3 h-3" />
                            )}
                          </button>
                          <a
                            href={`/${locale}/r/${b.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Open review portal"
                            className="p-2 rounded-xl border border-slate-200 hover:border-emerald-500 text-slate-400 hover:text-emerald-600 bg-white transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 px-6">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-sm">No Matching Merchants</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Adjust your filters or search term.</p>
          </div>
        )}
      </div>
    </div>
  );

  // ═══════════════════════════════════════════
  //  TAB: REVIEWS
  // ═══════════════════════════════════════════

  const ReviewsTab = () => (
    <div className="space-y-6">
      {/* Review Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex items-center px-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={reviewSearch}
            onChange={(e) => setReviewSearch(e.target.value)}
            className="w-full text-xs font-bold text-slate-700 placeholder-slate-400 bg-transparent py-2.5 pl-2.5 focus:outline-none"
          />
        </div>

        <select
          value={reviewStarFilter}
          onChange={(e) => setReviewStarFilter(e.target.value)}
          className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none shadow-sm cursor-pointer"
        >
          <option value="all">All Stars</option>
          <option value="5">5 ★</option>
          <option value="4">4 ★</option>
          <option value="3">3 ★</option>
          <option value="2">2 ★</option>
          <option value="1">1 ★</option>
        </select>

        <select
          value={reviewTypeFilter}
          onChange={(e) => setReviewTypeFilter(e.target.value)}
          className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none shadow-sm cursor-pointer"
        >
          <option value="all">All Types</option>
          <option value="public">Public Only</option>
          <option value="private">Private Only</option>
        </select>

        <select
          value={reviewBusinessFilter}
          onChange={(e) => setReviewBusinessFilter(e.target.value)}
          className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none shadow-sm cursor-pointer"
        >
          <option value="all">All Businesses</option>
          {businesses.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        <span className="text-[10px] font-bold text-slate-400 ml-auto">
          {filteredReviews.length} reviews
        </span>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
        {filteredReviews.length > 0 ? (
          filteredReviews.map(r => (
            <div 
              key={r.id} 
              className="px-6 py-4 hover:bg-slate-50/30 transition-colors cursor-pointer"
              onClick={() => setExpandedReview(expandedReview === r.id ? null : r.id)}
            >
              <div className="flex items-start gap-4">
                {/* Stars */}
                <div className="flex items-center gap-0.5 shrink-0 mt-0.5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-3.5 h-3.5 ${r.stars >= s ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                  ))}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold text-slate-700 ${expandedReview === r.id ? '' : 'truncate'}`}>
                    {r.is_public 
                      ? (r.custom_text || 'No text provided')
                      : (r.private_feedback || 'No feedback text')
                    }
                  </p>

                  {expandedReview === r.id && (
                    <div className="mt-3 space-y-2">
                      {r.customer_name && (
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold">
                          <Users className="w-3 h-3" />
                          <span>{r.customer_name}</span>
                        </div>
                      )}
                      {r.customer_phone && (
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold">
                          <span>📱 {r.customer_phone}</span>
                        </div>
                      )}
                      {r.ai_suggestion_used && (
                        <div className="flex items-center gap-2 text-[10px] text-indigo-500 font-semibold">
                          <Sparkles className="w-3 h-3" />
                          <span>AI suggestion used</span>
                        </div>
                      )}
                      {r.owner_note && (
                        <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-xl text-[10px] text-amber-800 font-semibold">
                          <span className="font-black">Owner note:</span> {r.owner_note}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[9px] font-bold text-slate-400">{getBusinessName(r.business_id)}</span>
                    <span className="text-[9px] text-slate-300">•</span>
                    <span className="text-[9px] font-bold text-slate-400">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${r.is_public ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                    {r.is_public ? 'PUBLIC' : 'PRIVATE'}
                  </span>
                  {!r.is_public && (
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${r.is_resolved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                      {r.is_resolved ? 'RESOLVED' : 'PENDING'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 px-6">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-sm">No Reviews Found</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Adjust your filters.</p>
          </div>
        )}
      </div>
    </div>
  );

  // ═══════════════════════════════════════════
  //  TAB: SETTINGS
  // ═══════════════════════════════════════════

  const SettingsTab = () => (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
          <Settings className="w-4 h-4 text-slate-400" />
          Platform Configuration
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Admin Email</label>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-600">
              {process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@reviewboost.com'}
            </div>
          </div>
          
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Support WhatsApp</label>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-600">
              +91 98765 43210
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Support Email</label>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-600">
              billing@reviewboost.com
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-slate-400" />
          Plan Pricing
        </h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl text-center">
            <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest block">Free</span>
            <span className="text-xl font-black text-slate-800 block mt-1">₹0</span>
            <span className="text-[9px] font-bold text-slate-400 block">30 days</span>
          </div>
          <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl text-center">
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest block">Starter</span>
            <span className="text-xl font-black text-slate-800 block mt-1">₹399</span>
            <span className="text-[9px] font-bold text-slate-400 block">/month</span>
          </div>
          <div className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-xl text-center">
            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest block">Growth</span>
            <span className="text-xl font-black text-slate-800 block mt-1">₹799</span>
            <span className="text-[9px] font-bold text-slate-400 block">/month</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-slate-400" />
          Feature Access Matrix
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-2 px-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Feature</th>
                <th className="py-2 px-3 text-[9px] font-black text-amber-600 uppercase tracking-widest text-center">Free</th>
                <th className="py-2 px-3 text-[9px] font-black text-emerald-600 uppercase tracking-widest text-center">Starter</th>
                <th className="py-2 px-3 text-[9px] font-black text-indigo-600 uppercase tracking-widest text-center">Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { feature: 'QR Review Funnel', free: true, starter: true, growth: true },
                { feature: 'AI Suggestions', free: true, starter: true, growth: true },
                { feature: 'WhatsApp/Email Alerts', free: true, starter: true, growth: true },
                { feature: 'Multi-Language', free: false, starter: true, growth: true },
                { feature: 'Multiple Locations', free: false, starter: false, growth: true },
                { feature: 'NFC Cards (10)', free: false, starter: false, growth: true },
                { feature: 'Peak Scan Heatmap', free: false, starter: false, growth: true },
                { feature: 'Developer API', free: false, starter: false, growth: true },
                { feature: 'White-label', free: false, starter: false, growth: true },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 text-[10px] font-bold text-slate-700">{row.feature}</td>
                  <td className="py-2.5 px-3 text-center">
                    {row.free ? <Check className="w-3.5 h-3.5 text-emerald-500 mx-auto" /> : <X className="w-3.5 h-3.5 text-slate-300 mx-auto" />}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {row.starter ? <Check className="w-3.5 h-3.5 text-emerald-500 mx-auto" /> : <X className="w-3.5 h-3.5 text-slate-300 mx-auto" />}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {row.growth ? <Check className="w-3.5 h-3.5 text-emerald-500 mx-auto" /> : <X className="w-3.5 h-3.5 text-slate-300 mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════
  //  TAB: UPGRADE REQUESTS
  // ═══════════════════════════════════════════

  const pendingUpgradeCount = upgradeRequests.filter(r => r.status === 'pending').length;

  const handleApproveUpgrade = async (req: UpgradeRequest) => {
    // 1. Update the business plan
    try {
      const res = await fetch('/api/business/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: req.business_id,
          plan: req.requested_plan,
          is_active: true,
          trial_ended: false
        })
      });

      if (res.ok) {
        // 2. Mark the request as approved
        const updated = await updateUpgradeRequestStatus(req.id, 'approved');
        if (updated) {
          setUpgradeRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'approved' } : r));
          // Also update the business in local state
          setBusinesses(prev => prev.map(b => b.id === req.business_id ? { ...b, plan: req.requested_plan as any, is_active: true, trial_ended: false } : b));
        }
      } else {
        alert('Failed to update business plan.');
      }
    } catch (e) {
      console.error(e);
      alert('Error approving upgrade request.');
    }
  };

  const handleRejectUpgrade = async (req: UpgradeRequest) => {
    const updated = await updateUpgradeRequestStatus(req.id, 'rejected');
    if (updated) {
      setUpgradeRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'rejected' } : r));
    }
  };

  const UpgradeRequestsTab = () => (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Pending</span>
          <span className="text-2xl font-black text-amber-600">{upgradeRequests.filter(r => r.status === 'pending').length}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Approved</span>
          <span className="text-2xl font-black text-emerald-600">{upgradeRequests.filter(r => r.status === 'approved').length}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Rejected</span>
          <span className="text-2xl font-black text-rose-500">{upgradeRequests.filter(r => r.status === 'rejected').length}</span>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {upgradeRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="py-3.5 px-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Merchant</th>
                  <th className="py-3.5 px-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Current Plan</th>
                  <th className="py-3.5 px-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Requested Plan</th>
                  <th className="py-3.5 px-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                  <th className="py-3.5 px-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="py-3.5 px-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="py-3.5 px-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {upgradeRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 text-xs shrink-0">
                          {req.business_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-800 text-xs truncate max-w-[180px]">{req.business_name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${planBadge(req.current_plan)}`}>
                        {req.current_plan.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${planBadge(req.requested_plan)}`}>
                        {req.requested_plan.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="space-y-0.5">
                        {req.contact_email && <div className="text-[10px] font-bold text-slate-500 truncate max-w-[160px]">{req.contact_email}</div>}
                        {req.contact_phone && <div className="text-[10px] font-bold text-slate-400">{req.contact_phone}</div>}
                        {!req.contact_email && !req.contact_phone && <span className="text-[10px] text-slate-300">—</span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="text-[10px] font-bold text-slate-500">
                        {new Date(req.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border ${
                        req.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        req.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-rose-50 text-rose-600 border-rose-200'
                      }`}>
                        {req.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {req.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApproveUpgrade(req)}
                            title="Approve and upgrade plan"
                            className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRejectUpgrade(req)}
                            title="Reject request"
                            className="p-2 rounded-xl bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 px-6">
            <ArrowUpRight className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-sm">No Upgrade Requests</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">When merchants request plan upgrades, they will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );

  // ═══════════════════════════════════════════
  //  TAB NAVIGATION CONFIG
  // ═══════════════════════════════════════════

  const tabs: { id: AdminTab; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'businesses', label: 'Businesses', icon: Building2 },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
    { id: 'upgrade_requests', label: 'Upgrades', icon: ArrowUpRight },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // ═══════════════════════════════════════════
  //  MAIN RENDER
  // ═══════════════════════════════════════════

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/${locale}/dashboard`}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-slate-800 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-black text-sm shadow-sm">
                R
              </div>
              <div>
                <span className="font-black text-slate-900 tracking-tight text-sm block leading-none">ReviewBoost Admin</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">System Console</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={loadData}
              className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-500 transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <span className="text-[9px] font-black px-3 py-1.5 rounded-full bg-slate-900 text-white uppercase tracking-widest">
              SuperAdmin
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex items-center gap-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3.5 text-xs font-bold transition-all border-b-2 ${
                    isActive 
                      ? 'text-emerald-700 border-emerald-600' 
                      : 'text-slate-400 border-transparent hover:text-slate-700 hover:border-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.id === 'reviews' && unresolvedCount > 0 && (
                    <span className="text-[8px] font-black bg-rose-500 text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {unresolvedCount}
                    </span>
                  )}
                  {tab.id === 'upgrade_requests' && pendingUpgradeCount > 0 && (
                    <span className="text-[8px] font-black bg-indigo-500 text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {pendingUpgradeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'businesses' && <BusinessesTab />}
        {activeTab === 'reviews' && <ReviewsTab />}
        {activeTab === 'upgrade_requests' && <UpgradeRequestsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}
