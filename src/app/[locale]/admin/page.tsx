'use client';

import React, { useState, useEffect } from 'react';
import { getAllBusinesses, Business } from '@/lib/db';
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
  HelpCircle,
  Eye
} from 'lucide-react';
import Link from 'next/link';

export default function AdminControlPanel({ params }: { params: { locale: string } }) {
  const { locale } = params;

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Row saving states
  const [savingId, setSavingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      const all = await getAllBusinesses();
      setBusinesses(all);
    } catch (err) {
      console.error('Failed to load admin business list:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-bold mt-3">Loading admin records...</p>
      </div>
    );
  }

  // Row update handlers
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
        setTimeout(() => setSuccessId(null), 2000);
      } else {
        alert('Failed to save administration status updates.');
      }
    } catch (e) {
      console.error(e);
      alert('Internal error updating merchant payment settings.');
    } finally {
      setSavingId(null);
    }
  };

  // Metric Summary logic
  const totalCount = businesses.length;
  const activeCount = businesses.filter(b => b.is_active).length;
  
  const pendingPayments = businesses.filter(b => {
    if (b.payment_status !== 'unpaid' && b.payment_status !== 'due_soon') return false;
    return true;
  }).length;

  const totalDuesAmount = businesses.reduce((sum, curr) => {
    if (curr.payment_status === 'unpaid' || curr.payment_status === 'due_soon') {
      return sum + (curr.payment_amount || 0);
    }
    return sum;
  }, 0);

  // Search filter
  const filteredBusinesses = businesses.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/en/dashboard"
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900 transition-colors shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Admin Console</h1>
              <p className="text-sm text-slate-500 font-semibold mt-1">Manage manual merchant renewals, plan feature-gates, and portal activations.</p>
            </div>
          </div>
          <span className="text-[10px] font-black px-3 py-1.5 rounded-full bg-slate-900 text-white uppercase tracking-widest self-start sm:self-center">
            SuperAdmin Account
          </span>
        </div>

        {/* Admin KPI Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Merchants</span>
              <span className="text-2xl font-black text-slate-900 tracking-tight">{totalCount}</span>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
              <Building2 className="w-5 h-5 shrink-0" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Active Funnels</span>
              <span className="text-2xl font-black text-emerald-600 tracking-tight">{activeCount}</span>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Pending Renewals</span>
              <span className="text-2xl font-black text-amber-500 tracking-tight">{pendingPayments}</span>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-500">
              <ShieldAlert className="w-5 h-5 shrink-0" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Outstanding Dues</span>
              <span className="text-2xl font-black text-slate-900 tracking-tight">₹{totalDuesAmount}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-100 text-slate-700">
              <DollarSign className="w-5 h-5 shrink-0" />
            </div>
          </div>
        </div>

        {/* Search controls */}
        <div className="relative w-full max-w-md bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden flex items-center px-4.5 py-1">
          <Search className="w-4.5 h-4.5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search merchants by name or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs font-bold text-slate-700 placeholder-slate-400 bg-transparent py-3.5 pl-3 focus:outline-none"
          />
        </div>

        {/* Merchants Table Registry */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {filteredBusinesses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="py-4.5 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Merchant Info</th>
                    <th className="py-4.5 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tier (Plan)</th>
                    <th className="py-4.5 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Trial Expired</th>
                    <th className="py-4.5 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Portal Active</th>
                    <th className="py-4.5 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Status</th>
                    <th className="py-4.5 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount (₹)</th>
                    <th className="py-4.5 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due Date</th>
                    <th className="py-4.5 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBusinesses.map((b) => {
                    const isOverdue = b.payment_status === 'unpaid' && b.payment_due_date && (new Date() > new Date(new Date(b.payment_due_date).setHours(23, 59, 59, 999)));

                    return (
                      <tr key={b.id} className="hover:bg-slate-50/40 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm">
                              {b.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm leading-snug">{b.name}</h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-bold text-slate-400 font-mono">
                                  slug: {b.slug}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-1.5">
                            <select
                              value={b.plan === 'free' ? 'trial' : b.plan}
                              onChange={(e) => {
                                const newPlan = e.target.value as any;
                                handleFieldChange(b.id, 'plan', newPlan);
                                if (newPlan !== 'trial' && newPlan !== 'free') {
                                  handleFieldChange(b.id, 'trial_ended', false);
                                }
                              }}
                              className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors cursor-pointer w-28"
                            >
                              <option value="trial">Free / Trial</option>
                              <option value="starter">Starter</option>
                              <option value="growth">Growth</option>
                            </select>
                            
                            {(b.plan === 'trial' || b.plan === 'free') && (
                              <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-lg px-1.5 py-0.5 mt-0.5 w-28 shadow-inner">
                                <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                                <input
                                  type="date"
                                  value={b.trial_started_at ? b.trial_started_at.split('T')[0] : ''}
                                  onChange={(e) => handleFieldChange(b.id, 'trial_started_at', e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString())}
                                  className="bg-transparent text-[9px] font-bold text-slate-500 w-full focus:outline-none cursor-pointer"
                                />
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-6 text-center">
                          <input
                            type="checkbox"
                            checked={b.trial_ended}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              handleFieldChange(b.id, 'trial_ended', checked);
                              // Auto-deactivate active state if trial expired
                              if (checked) {
                                handleFieldChange(b.id, 'is_active', false);
                              } else {
                                handleFieldChange(b.id, 'is_active', true);
                              }
                            }}
                            className="w-4 h-4 rounded text-rose-600 border-slate-200 focus:ring-rose-500 cursor-pointer shadow-sm"
                          />
                        </td>

                        <td className="py-4 px-6">
                          <button
                            onClick={() => handleFieldChange(b.id, 'is_active', !b.is_active)}
                            className={`inline-flex text-[10px] font-black px-2.5 py-1 rounded-full border cursor-pointer transition-colors ${
                              b.is_active 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100' 
                                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {b.is_active ? 'Active' : 'Suspended'}
                          </button>
                        </td>

                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <select
                              value={b.payment_status || 'paid'}
                              onChange={(e) => handleFieldChange(b.id, 'payment_status', e.target.value)}
                              className={`text-[10px] font-black bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:bg-white transition-colors cursor-pointer w-28 appearance-none ${
                                b.payment_status === 'paid' 
                                  ? 'text-emerald-700 font-black' 
                                  : b.payment_status === 'due_soon' 
                                    ? 'text-amber-600 font-black' 
                                    : 'text-red-650 font-black'
                              }`}
                            >
                              <option value="paid">Paid</option>
                              <option value="due_soon">Due Soon</option>
                              <option value="unpaid">Unpaid</option>
                            </select>
                            {isOverdue && (
                              <span className="text-[8px] font-black text-red-600 uppercase tracking-widest block pl-1">
                                (Overdue)
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-6 font-mono text-xs font-bold text-slate-650">
                          <input
                            type="number"
                            value={b.payment_amount ?? 0}
                            onChange={(e) => handleFieldChange(b.id, 'payment_amount', parseInt(e.target.value, 10))}
                            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 w-20 text-xs font-bold text-slate-800 text-center"
                          />
                        </td>

                        <td className="py-4 px-6">
                          <div className="relative flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 hover:bg-slate-100 transition-colors w-32">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <input
                              type="date"
                              value={b.payment_due_date || ''}
                              onChange={(e) => handleFieldChange(b.id, 'payment_due_date', e.target.value || null)}
                              className="bg-transparent text-[10px] font-bold text-slate-700 w-full focus:outline-none cursor-pointer"
                            />
                          </div>
                        </td>

                        <td className="py-4 px-6 text-right space-x-1.5">
                          <button
                            onClick={() => handleSaveChanges(b.id)}
                            disabled={savingId === b.id}
                            title="Save custom settings and trigger changes"
                            className="inline-flex items-center justify-center p-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors cursor-pointer font-bold shadow-md"
                          >
                            {savingId === b.id ? (
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : successId === b.id ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Save className="w-3.5 h-3.5" />
                            )}
                          </button>
                          
                          <a
                            href={`/en/r/${b.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Open client dynamic review portal page"
                            className="inline-flex items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:border-slate-400 text-slate-500 hover:text-slate-800 bg-white transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 px-6">
              <Building2 className="w-12 h-12 text-slate-350 mx-auto mb-4" />
              <h3 className="font-bold text-slate-800 text-base">No Matching Merchants</h3>
              <p className="text-xs text-slate-400 font-semibold mt-1">Refine your query term above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
