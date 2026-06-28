'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getAnalyticsDailyScans, 
  getStarDistribution, 
  getScanSourceBreakdown, 
  getPeakScansHeatmap,
  getDashboardSummary,
  getFirstBusinessForOwner,
  Business,
  getLocations
} from '@/lib/db';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Filter, 
  Download, 
  PieChart, 
  Maximize2,
  Calendar,
  CheckCircle2
} from 'lucide-react';

export default function AnalyticsDashboard({ params }: { params: { locale: string } }) {
  const { locale } = params;

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<Business | null>(null);

  // Filters State
  const [dateRange, setDateRange] = useState<number>(30); // 7, 30, 90 days
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');

  // Metrics Data
  const [summary, setSummary] = useState<any>(null);
  const [dailyScans, setDailyScans] = useState<any[]>([]);
  const [starBreakdown, setStarBreakdown] = useState<any[]>([]);
  const [sourceBreakdown, setSourceBreakdown] = useState<any[]>([]);
  const [heatmap, setHeatmap] = useState<number[][]>([]);

  useEffect(() => {
    setMounted(true);
    
    async function loadData() {
      try {
        const b = await getFirstBusinessForOwner('mock-owner');
        if (!b) return;
        setBusiness(b);

        // Fetch locations list
        const locs = await getLocations(b.id);
        setLocations(locs || []);

        const [s, scans, stars, sources, heat] = await Promise.all([
          getDashboardSummary(b.id, selectedLocationId || undefined),
          getAnalyticsDailyScans(b.id, dateRange, selectedLocationId || undefined),
          getStarDistribution(b.id, selectedLocationId || undefined),
          getScanSourceBreakdown(b.id, selectedLocationId || undefined),
          getPeakScansHeatmap(b.id, selectedLocationId || undefined)
        ]);

        setSummary(s);
        setDailyScans(scans);
        setStarBreakdown(stars);
        setSourceBreakdown(sources);
        setHeatmap(heat);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [dateRange, selectedLocationId]);

  if (!mounted || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-bold mt-3">Loading analytics metrics...</p>
      </div>
    );
  }

  if (!business) return null;

  // Custom SVG line calculations
  const scansMax = Math.max(...dailyScans.map(d => d.scans), 1);
  const chartWidth = 600;
  const chartHeight = 150;
  const points = dailyScans.map((d, index) => {
    const x = (index / (dailyScans.length - 1)) * chartWidth;
    const y = chartHeight - (d.scans / scansMax) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  // Conversion Funnel Calculations
  const scansCount = summary.totalScans;
  const ratingSelected = summary.totalReviews; // stars selected
  const submittedCount = summary.totalReviews; // finished submission
  
  const ratingRate = scansCount > 0 ? Math.round((ratingSelected / scansCount) * 100) : 0;
  const submitRate = ratingSelected > 0 ? Math.round((submittedCount / ratingSelected) * 100) : 0;

  // Heatmap helper (combine 24 hours into 12 two-hour blocks)
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hourBlocks = [
    '00:00 - 02:00',
    '02:00 - 04:00',
    '04:00 - 06:00',
    '06:00 - 08:00',
    '08:00 - 10:00',
    '10:00 - 12:00',
    '12:00 - 14:00',
    '14:00 - 16:00',
    '16:00 - 18:00',
    '18:00 - 20:00',
    '20:00 - 22:00',
    '22:00 - 00:00'
  ];

  // Get max frequency in heatmap to scale coloring
  let maxHeat = 1;
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      if (heatmap[d] && heatmap[d][h] > maxHeat) {
        maxHeat = heatmap[d][h];
      }
    }
  }

  // Get color gradient weight based on scan counts
  const getHeatmapColor = (scans: number) => {
    if (scans === 0) return 'bg-slate-50 text-slate-300';
    const ratio = scans / maxHeat;
    if (ratio <= 0.25) return 'bg-emerald-50 text-emerald-700';
    if (ratio <= 0.5) return 'bg-emerald-100 text-emerald-800';
    if (ratio <= 0.75) return 'bg-emerald-300 text-emerald-950 font-bold';
    return 'bg-emerald-600 text-white font-bold';
  };

  // Export Analytics CSV
  const handleExportCSV = () => {
    if (business.plan !== 'growth' && business.plan !== 'growth_direct') {
      alert('CSV Export is available on the Growth plan. Please upgrade to unlock.');
      return;
    }
    const locationName = selectedLocationId ? (locations.find(l => l.id === selectedLocationId)?.name || 'Branch') : 'All Branches';
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Branch / Location', locationName],
      ['Total Scans', summary.totalScans],
      ['Total Reviews', summary.totalReviews],
      ['Average Rating', summary.averageStars],
      ['Google Redirect Rate', `${summary.redirectRate}%`],
      ['Conversion Rate (Scans -> Reviews)', `${ratingRate}%`]
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(","))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const locationSlug = selectedLocationId ? (locations.find(l => l.id === selectedLocationId)?.slug || 'branch') : 'all';
    link.setAttribute("download", `${business.slug}-${locationSlug}-analytics.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Analytics Dashboard</h1>
          <p className="text-sm text-slate-500 font-semibold mt-1">Review operational performance charts and traffic metrics.</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Location / Branch filter */}
          <div className="relative">
            {business.plan === 'growth' || business.plan === 'growth_direct' ? (
              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                className="text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white cursor-pointer"
              >
                <option value="">All Branches</option>
                <option value="main">Main Branch</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            ) : (
              <select
                disabled
                value=""
                className="text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed font-medium"
              >
                <option value="">All Branches (Growth Only 🔒)</option>
              </select>
            )}
          </div>

          {/* Date range filter */}
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (val > 30 && business.plan !== 'growth' && business.plan !== 'growth_direct') {
                  alert('90 Days analytics history is a Growth plan feature. Please upgrade to unlock.');
                  return;
                }
                setDateRange(val);
              }}
              className="text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white cursor-pointer"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              {business.plan === 'growth' || business.plan === 'growth_direct' ? (
                <option value="90">Last 90 Days (3 Months)</option>
              ) : (
                <option value="90" disabled>Last 90 Days (Growth Only)</option>
              )}
            </select>
          </div>
          
          <button
            onClick={handleExportCSV}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm text-slate-600 transition-colors"
            title="Download CSV"
          >
            <Download className="w-4.5 h-4.5 shrink-0" />
          </button>
        </div>
      </div>

      {/* Main stats visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scans over time line chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-xs tracking-wider uppercase mb-1">Total Scan Frequency</h3>
              <span className="text-[10px] font-bold text-slate-400">Total QR and NFC card scans logged over {dateRange} days</span>
            </div>
            <span className="text-xs font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{Math.round(summary.totalScans * 0.1)}%</span>
            </span>
          </div>

          <div className="w-full h-44 mt-6 relative">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="scans-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth={3.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
              <polygon
                points={`0,${chartHeight} ${points} ${chartWidth},${chartHeight}`}
                fill="url(#scans-gradient)"
              />
            </svg>
          </div>

          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mt-2">
            <span>{dailyScans[0]?.date}</span>
            <span>{dailyScans[dailyScans.length - 1]?.date}</span>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-xs tracking-wider uppercase mb-1">Conversion Funnel</h3>
            <span className="text-[10px] font-bold text-slate-400">Merchant landing page conversion efficiency</span>
          </div>

          <div className="space-y-4 my-4 flex-1 flex flex-col justify-center">
            {/* Step 1: Scans */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>1. QR Code Scans</span>
                <span className="font-black text-slate-800">{scansCount}</span>
              </div>
              <div className="h-3.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-blue-500" style={{ width: '100%' }} />
              </div>
            </div>

            {/* Step 2: Rating selected */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>2. Rating Clicked</span>
                <span className="font-black text-slate-800">{ratingSelected} ({ratingRate}%)</span>
              </div>
              <div className="h-3.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-indigo-500 transition-all duration-300" style={{ width: `${ratingRate}%` }} />
              </div>
            </div>

            {/* Step 3: Submitted reviews */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>3. Review Submitted</span>
                <span className="font-black text-slate-800">{submittedCount} ({submitRate}%)</span>
              </div>
              <div className="h-3.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500 transition-all duration-300" style={{ width: `${ratingRate}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rating Ratio (Public vs Private) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-xs tracking-wider uppercase mb-1">Feedback Ratio</h3>
            <span className="text-[10px] font-bold text-slate-400">Public redirects vs private feedback submissions</span>
          </div>

          <div className="my-6 space-y-4">
            <div className="h-6 rounded-full bg-slate-100 flex overflow-hidden shadow-inner">
              <div 
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${summary.redirectRate}%` }}
                title={`Public: ${summary.redirectRate}%`}
              />
              <div 
                className="h-full bg-red-400 transition-all"
                style={{ width: `${100 - summary.redirectRate}%` }}
                title={`Private: ${100 - summary.redirectRate}%`}
              />
            </div>

            <div className="flex justify-between text-xs font-bold text-slate-500">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-emerald-500 shrink-0" />
                <span>Google (4-5★)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-red-400 shrink-0" />
                <span>Private (1-3★)</span>
              </div>
            </div>
          </div>

          <div className="text-center bg-slate-50 p-3 rounded-2xl border text-xs text-slate-500 font-semibold leading-relaxed">
            Your redirect rate is <strong className="text-emerald-700">{summary.redirectRate}%</strong>. Grow this by placing the QR standee closer to checkouts!
          </div>
        </div>

        {/* Peak Scan Times Heatmap */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div>
            <h3 className="font-bold text-slate-800 text-xs tracking-wider uppercase mb-1">Peak Scan Times Heatmap</h3>
            <span className="text-[10px] font-bold text-slate-400">Hourly density of QR scans across the week</span>
          </div>

          {/* Grid heatmap table */}
          <div className="mt-4 overflow-x-auto w-full">
            <table className="w-full border-collapse text-[9px] font-bold text-slate-500 select-none min-w-[440px]">
              <thead>
                <tr>
                  <th className="p-1"></th>
                  {daysOfWeek.map(d => (
                    <th key={d} className="p-1 text-center font-bold">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hourBlocks.map((block, bIdx) => (
                  <tr key={block}>
                    <td className="p-1 whitespace-nowrap text-right pr-2 text-slate-450">{block}</td>
                    {daysOfWeek.map((_, dIdx) => {
                      // Sum the 2 hours corresponding to this block
                      const hStart = bIdx * 2;
                      const hEnd = hStart + 2;
                      let blockSum = 0;
                      if (heatmap[dIdx]) {
                        for (let hour = hStart; hour < hEnd; hour++) {
                          blockSum += heatmap[dIdx][hour] || 0;
                        }
                      }

                      return (
                        <td 
                          key={dIdx}
                          className={`p-1.5 border border-white text-center rounded-sm transition-colors ${getHeatmapColor(blockSum)}`}
                          title={`${blockSum} Scans`}
                        >
                          {blockSum > 0 ? blockSum : ''}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend indicators */}
          <div className="flex justify-end gap-3 mt-4 text-[9px] font-bold text-slate-400">
            <span>Legend:</span>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-slate-50 border border-slate-200" />
              <span>0 scans</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-50" />
              <span>Low</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-300" />
              <span>Med</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
              <span>High</span>
            </div>
          </div>
          
          {business.plan !== 'growth' && business.plan !== 'growth_direct' && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 z-10 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 shadow-inner">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Peak Scan Heatmap Locked</h4>
              <p className="text-[10px] text-slate-505 font-semibold mt-1 max-w-xs leading-normal">
                This feature is available on the Growth plan. Upgrade to view hourly scan density and optimize your review generation.
              </p>
              <Link
                href={`/${locale}/dashboard/billing`}
                className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl text-[10px] transition-colors shadow-sm"
              >
                Upgrade Plan
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
