'use client';

import React, { useState, useEffect } from 'react';
import { getReviewsInbox, getFirstBusinessForOwner, Business, Review } from '@/lib/db';
import { 
  Search, 
  Star, 
  Check, 
  Phone, 
  MessageSquare, 
  FileSpreadsheet, 
  Clock, 
  CornerDownRight, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Save,
  ChevronDown
} from 'lucide-react';

export default function ReviewsInbox({ params }: { params: { locale: string } }) {
  const { locale } = params;

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<Business | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'public' | 'private'>('public');

  // Query & Filter States
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [starFilter, setStarFilter] = useState<number | undefined>(undefined);
  const [resolvedFilter, setResolvedFilter] = useState<boolean | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'stars_desc' | 'stars_asc'>('newest');

  // Reviews Data
  const [reviews, setReviews] = useState<Review[]>([]);

  // Notes editing states
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);

  // Debounce search input changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  useEffect(() => {
    setMounted(true);
    getFirstBusinessForOwner('mock-owner')
      .then(b => {
        setBusiness(b);
      });
  }, []);

  // Fetch reviews on query changes
  useEffect(() => {
    if (!business) return;
    setLoading(true);

    const isPublic = activeTab === 'public';
    getReviewsInbox(business.id, {
      search: debouncedSearch,
      stars: starFilter,
      isPublic,
      isResolved: resolvedFilter,
      sort: sortOrder
    }).then(data => {
      setReviews(data);
      // Pre-fill notes inputs
      const notes: Record<string, string> = {};
      (data || []).forEach((r: Review) => {
        notes[r.id] = r.owner_note || '';
      });
      setEditingNotes(notes);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [business, activeTab, debouncedSearch, starFilter, resolvedFilter, sortOrder]);

  if (!mounted) return null;

  // Toggle Resolution status
  const handleToggleResolve = async (reviewId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/feedback/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId,
          isResolved: !currentStatus
        })
      });

      if (res.ok) {
        // Update local list state
        setReviews(reviews.map(r => r.id === reviewId ? { ...r, is_resolved: !currentStatus } : r));
      }
    } catch (e) {
      console.error('Failed to toggle resolve:', e);
    }
  };

  // Save internal operational note
  const handleSaveNote = async (reviewId: string) => {
    setSavingNoteId(reviewId);
    try {
      const res = await fetch('/api/feedback/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId,
          ownerNote: editingNotes[reviewId]
        })
      });

      if (res.ok) {
        setReviews(reviews.map(r => r.id === reviewId ? { ...r, owner_note: editingNotes[reviewId] } : r));
      }
    } catch (e) {
      console.error('Failed to save note:', e);
    } finally {
      setSavingNoteId(null);
    }
  };

  // Export Reviews as CSV
  const handleExportCSV = () => {
    if (reviews.length === 0) return;

    // Header row
    const headers = ['Date', 'Stars', 'Type', 'Feedback/Text', 'Customer Name', 'Customer Phone', 'AI Chip Used', 'Resolution Status', 'Owner Note'];
    const rows = reviews.map(r => [
      new Date(r.created_at).toLocaleDateString(),
      `${r.stars} Stars`,
      r.is_public ? 'Public' : 'Private',
      r.is_public ? (r.custom_text || '') : (r.private_feedback || ''),
      r.customer_name || 'Anonymous',
      r.customer_phone || 'N/A',
      r.ai_suggestion_used || 'N/A',
      r.is_public ? 'N/A' : (r.is_resolved ? 'Resolved' : 'Unresolved'),
      r.owner_note || ''
    ]);

    // Format fields with quotes
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${business?.slug || 'reviews'}-export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reviews Inbox</h1>
          <p className="text-sm text-slate-500 font-semibold mt-1">Review public submissions and follow up on private customer ratings.</p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={reviews.length === 0}
          className="inline-flex items-center justify-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold shadow-md hover:bg-emerald-700 transition-all self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4 shrink-0" />
          <span>Export as CSV</span>
        </button>
      </div>

      {/* Tabs Row */}
      <div className="border-b border-slate-100 flex gap-4">
        <button
          onClick={() => {
            setActiveTab('public');
            setStarFilter(undefined);
            setResolvedFilter(undefined);
          }}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'public' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
        >
          Google Reviews (4-5★)
        </button>
        <button
          onClick={() => {
            setActiveTab('private');
            setStarFilter(undefined);
            setResolvedFilter(undefined);
          }}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'private' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
        >
          Private Feedback (1-3★)
        </button>
      </div>

      {/* Filters Control Box */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search text or customer..."
            className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
          />
        </div>

        {/* Stars Filter */}
        <div className="relative">
          <select
            value={starFilter || ''}
            onChange={(e) => setStarFilter(e.target.value ? parseInt(e.target.value, 10) : undefined)}
            className="w-full text-xs px-3.5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white cursor-pointer"
          >
            <option value="">All Ratings</option>
            {activeTab === 'public' ? (
              <>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
              </>
            ) : (
              <>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </>
            )}
          </select>
        </div>

        {/* Status Filter (Private only) */}
        <div className="relative">
          <select
            disabled={activeTab === 'public'}
            value={resolvedFilter === undefined ? '' : String(resolvedFilter)}
            onChange={(e) => setResolvedFilter(e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined)}
            className="w-full text-xs px-3.5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white disabled:bg-slate-50 disabled:text-slate-350 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="false">Unresolved</option>
            <option value="true">Resolved</option>
          </select>
        </div>

        {/* Sort Select */}
        <div className="relative">
          <select
            value={sortOrder}
            onChange={(e: any) => setSortOrder(e.target.value)}
            className="w-full text-xs px-3.5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white cursor-pointer"
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="stars_desc">Sort: Stars (High)</option>
            <option value="stars_asc">Sort: Stars (Low)</option>
          </select>
        </div>
      </div>

      {/* Review Inbox List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((rev) => (
            <div 
              key={rev.id} 
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-6 hover:shadow-md transition-shadow"
            >
              <div className="flex-1 space-y-3">
                {/* Header row */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Stars indicators */}
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star 
                        key={s} 
                        className={`w-3.5 h-3.5 shrink-0 ${s <= rev.stars ? 'text-amber-400 fill-current' : 'text-slate-200'}`} 
                      />
                    ))}
                  </div>

                  <span className="text-slate-300">|</span>

                  {/* Relative date */}
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-350 shrink-0" />
                    <span>{new Date(rev.created_at).toLocaleDateString()}</span>
                  </span>

                  {/* Locale badge */}
                  {rev.language_used && (
                    <span className="text-[9px] font-bold bg-slate-100 text-slate-500 border border-slate-200/50 px-1.5 py-0.5 rounded uppercase">
                      {rev.language_used}
                    </span>
                  )}

                  {/* Resolution status badge (Private feedback only) */}
                  {!rev.is_public && (
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${rev.is_resolved ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                      {rev.is_resolved ? 'Resolved' : 'Unresolved'}
                    </span>
                  )}
                </div>

                {/* Text reviews body */}
                {rev.is_public ? (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-700 leading-relaxed italic">
                      {rev.custom_text ? `"${rev.custom_text}"` : 'No text written — customer skipped directly to Google Review.'}
                    </p>
                    {rev.ai_suggestion_used && (
                      <p className="text-[10px] font-bold text-indigo-500 bg-indigo-50/50 border border-indigo-100/50 px-2 py-1 rounded-lg inline-flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>AI Chip Clicked: &quot;{rev.ai_suggestion_used}&quot;</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                      &quot;{rev.private_feedback}&quot;
                    </p>
                    {/* Customer contact card */}
                    <div className="flex gap-4 text-xs font-semibold text-slate-500">
                      <span>👤 {rev.customer_name || 'Anonymous'}</span>
                      {rev.customer_phone && (
                        <a href={`tel:${rev.customer_phone}`} className="text-emerald-600 hover:underline flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{rev.customer_phone}</span>
                        </a>
                      )}
                    </div>

                    {/* Owner Internal Note view block */}
                    {rev.owner_note && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-150 flex items-start gap-2 text-xs">
                        <CornerDownRight className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Internal Note</span>
                          <p className="font-semibold text-slate-600 mt-0.5">{rev.owner_note}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Private review action handlers (Mark as resolved & Edit Notes) */}
              {!rev.is_public && (
                <div className="md:w-64 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 space-y-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleResolve(rev.id, rev.is_resolved)}
                      className={`flex-1 h-9 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${rev.is_resolved ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'}`}
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{rev.is_resolved ? 'Mark Unresolved' : 'Mark Resolved'}</span>
                    </button>
                  </div>

                  {/* Notes update section */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Internal Notes</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingNotes[rev.id] || ''}
                        onChange={(e) => setEditingNotes({ ...editingNotes, [rev.id]: e.target.value })}
                        placeholder="Add voucher, call notes..."
                        className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                      />
                      <button
                        onClick={() => handleSaveNote(rev.id)}
                        disabled={savingNoteId === rev.id || (editingNotes[rev.id] || '') === (rev.owner_note || '')}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-600 transition-colors"
                        aria-label="Save note"
                      >
                        <Save className="w-4 h-4 shrink-0" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm text-sm text-slate-400 font-bold">
            No reviews matching your filter preferences.
          </div>
        )}
      </div>
    </div>
  );
}
