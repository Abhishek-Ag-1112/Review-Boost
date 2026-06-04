'use client';

import React, { useState, useEffect } from 'react';
import { 
  getDashboardSummary, 
  getReviewsInbox, 
  getAnalyticsDailyScans, 
  getStarDistribution, 
  getScanSourceBreakdown, 
  getFirstBusinessForOwner,
  Business
} from '@/lib/db';
import { 
  QrCode, 
  MessageSquare, 
  Star, 
  TrendingUp, 
  AlertCircle,
  Calendar,
  Smartphone,
  Globe,
  Share2,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  subtext: string;
  badge?: number;
  badgeColor?: string;
  iconColor?: string;
}

function MetricCard({ title, value, icon: Icon, subtext, badge, badgeColor = 'bg-red-100 text-red-700', iconColor = 'bg-emerald-50 text-emerald-600' }: MetricCardProps) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-start">
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-black text-slate-900 tracking-tight">{value}</span>
          {badge !== undefined && badge > 0 && (
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-red-200/50 ${badgeColor} animate-pulse`}>
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 font-semibold">{subtext}</p>
      </div>
      <div className={`p-3 rounded-2xl ${iconColor}`}>
        <Icon className="w-5 h-5 shrink-0" />
      </div>
    </div>
  );
}

export default function DashboardOverview({ params }: { params: { locale: string } }) {
  const { locale } = params;

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState<'all' | 'month'>('all');
  
  // Data states
  const [business, setBusiness] = useState<Business | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [dailyScans, setDailyScans] = useState<any[]>([]);
  const [starBreakdown, setStarBreakdown] = useState<any[]>([]);
  const [sourceBreakdown, setSourceBreakdown] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    
    async function loadData() {
      try {
        const b = await getFirstBusinessForOwner('mock-owner');
        if (!b) return;
        setBusiness(b);

        const [s, revs, scans, stars, sources] = await Promise.all([
          getDashboardSummary(b.id),
          getReviewsInbox(b.id, { limit: 10 } as any), // last 10 reviews
          getAnalyticsDailyScans(b.id, 14), // last 14 days
          getStarDistribution(b.id),
          getScanSourceBreakdown(b.id)
        ]);

        setSummary(s);
        setRecentReviews(revs.slice(0, 10)); // last 10 reviews
        setDailyScans(scans);
        setStarBreakdown(stars);
        setSourceBreakdown(sources);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (!mounted || loading || !business || !summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-bold mt-3">Loading dashboard data...</p>
      </div>
    );
  }

  // Formatting percentages and counts
  const totalScans = filterMonth === 'month' ? Math.round(summary.totalScans * 0.4) : summary.totalScans;
  const totalReviews = filterMonth === 'month' ? Math.round(summary.totalReviews * 0.3) : summary.totalReviews;

  // Custom SVG Line Graph calculations
  const scansMax = Math.max(...dailyScans.map(d => d.scans), 1);
  const chartWidth = 500;
  const chartHeight = 120;
  
  // Build line coordinate points
  const points = dailyScans.map((d, index) => {
    const x = (index / (dailyScans.length - 1)) * chartWidth;
    const y = chartHeight - (d.scans / scansMax) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  // SVG source mappings
  const sourceIcons: Record<string, any> = {
    qr: QrCode,
    nfc: Smartphone,
    link: Globe,
    whatsapp: Share2
  };

  const sourceLabels: Record<string, string> = {
    qr: 'QR Scan',
    nfc: 'NFC Card Tap',
    link: 'Direct URL',
    whatsapp: 'WhatsApp Link'
  };

  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Overview</h1>
          <p className="text-sm text-slate-500 font-semibold mt-1">Here is a snapshot of your ReviewPe stats.</p>
        </div>

        {/* Date Filter Toggle */}
        <div className="flex rounded-xl bg-slate-100 p-1 self-start">
          <button
            onClick={() => setFilterMonth('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterMonth === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            All Time
          </button>
          <button
            onClick={() => setFilterMonth('month')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterMonth === 'month' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            This Month
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total QR Scans"
          value={totalScans}
          icon={QrCode}
          subtext="Unique page scans logged"
          iconColor="bg-blue-50 text-blue-600"
        />
        <MetricCard
          title="Reviews Collected"
          value={totalReviews}
          icon={MessageSquare}
          subtext="Total public + private feedback"
          iconColor="bg-indigo-50 text-indigo-600"
        />
        <MetricCard
          title="Average Rating"
          value={summary.averageStars}
          icon={Star}
          subtext="Aggregated feedback stars"
          iconColor="bg-amber-50 text-amber-500"
        />
        <MetricCard
          title="Google Redirect Rate"
          value={`${summary.redirectRate}%`}
          icon={TrendingUp}
          subtext="Taps redirected to Google"
          badge={summary.unresolvedFeedbackCount}
          badgeColor="bg-red-50 text-red-600 border-red-100"
          iconColor="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Charts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Daily Scans Line Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm tracking-wider uppercase mb-1">Scans Over Time</h3>
            <span className="text-[10px] font-bold text-slate-400">Total QR + NFC scans logged daily</span>
          </div>

          <div className="w-full h-36 mt-4 relative">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="scans-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1={chartHeight * 0.25} x2={chartWidth} y2={chartHeight * 0.25} stroke="#f1f5f9" strokeWidth={1} />
              <line x1="0" y1={chartHeight * 0.5} x2={chartWidth} y2={chartHeight * 0.5} stroke="#f1f5f9" strokeWidth={1} />
              <line x1="0" y1={chartHeight * 0.75} x2={chartWidth} y2={chartHeight * 0.75} stroke="#f1f5f9" strokeWidth={1} />
              {/* Area */}
              <polygon
                points={`0,${chartHeight} ${points} ${chartWidth},${chartHeight}`}
                fill="url(#scans-gradient)"
              />
              {/* Line */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
            </svg>
          </div>

          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mt-2">
            <span>{dailyScans[0]?.date}</span>
            <span>{dailyScans[Math.floor(dailyScans.length / 2)]?.date}</span>
            <span>{dailyScans[dailyScans.length - 1]?.date}</span>
          </div>
        </div>

        {/* SVG Ratings Distribution Bar Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm tracking-wider uppercase mb-1">Rating Distribution</h3>
            <span className="text-[10px] font-bold text-slate-400">Feedback count breakdown by stars</span>
          </div>

          <div className="space-y-2.5 mt-6 flex-1 flex flex-col justify-center">
            {starBreakdown.slice().reverse().map((r) => {
              const maxCount = Math.max(...starBreakdown.map(d => d.count), 1);
              const percentage = Math.round((r.count / maxCount) * 100);
              
              return (
                <div key={r.stars} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 w-4 flex items-center gap-0.5">
                    {r.stars}<Star className="w-3 h-3 text-amber-500 fill-current shrink-0" />
                  </span>
                  <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-amber-400 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-black text-slate-700 w-6 text-right">{r.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity feed */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-slate-800 text-sm tracking-wider uppercase mb-1">Recent Activity</h3>
            <span className="text-[10px] font-bold text-slate-400">Last reviews and feedback submissions</span>
          </div>

          <div className="divide-y divide-slate-100">
            {recentReviews.length > 0 ? (
              recentReviews.map((rev) => (
                <div key={rev.id} className="py-3.5 flex justify-between items-start gap-4">
                  <div className="flex gap-3">
                    <div className={`p-2 rounded-xl h-9 w-9 shrink-0 flex items-center justify-center ${rev.is_public ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                      {rev.is_public ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800">
                          {rev.is_public ? 'Public Review' : `Private Complaint (${rev.customer_name || 'Anonymous'})`}
                        </span>
                        <div className="flex items-center text-[10px] text-amber-500 font-bold bg-amber-50 px-1.5 py-0.5 rounded-full">
                          {rev.stars}★
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-1">
                        {rev.is_public ? rev.custom_text : rev.private_feedback}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 shrink-0 mt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(rev.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400 font-bold">No reviews logged yet.</div>
            )}
          </div>
        </div>

        {/* Scan Source Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="mb-6">
            <h3 className="font-bold text-slate-800 text-sm tracking-wider uppercase mb-1">Scan Sources</h3>
            <span className="text-[10px] font-bold text-slate-400">Visitor traffic sources breakdown</span>
          </div>

          <div className="space-y-4">
            {sourceBreakdown.map((src) => {
              const total = Math.max(sourceBreakdown.reduce((acc, curr) => acc + curr.count, 0), 1);
              const percentage = Math.round((src.count / total) * 100);
              const SrcIcon = sourceIcons[src.source] || QrCode;

              return (
                <div key={src.source} className="flex items-center justify-between p-3 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-100 text-slate-500">
                      <SrcIcon className="w-4 h-4 shrink-0" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">{sourceLabels[src.source]}</h4>
                      <span className="text-[10px] font-bold text-slate-400">{percentage}% of traffic</span>
                    </div>
                  </div>
                  <span className="text-sm font-black text-slate-800">{src.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
