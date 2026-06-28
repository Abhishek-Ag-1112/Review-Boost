'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getFirstBusinessForOwner, 
  getLocations, 
  createLocation, 
  deleteLocation, 
  toggleLocationActive,
  getReviewsInbox,
  getScans,
  Business 
} from '@/lib/db';
import UpgradeGate from '../UpgradeGate';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Copy, 
  ExternalLink, 
  Check, 
  AlertCircle,
  Eye,
  Star,
  QrCode
} from 'lucide-react';

export default function LocationsPage({ params }: { params: { locale: string } }) {
  const { locale } = params;

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<Business | null>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [branchName, setBranchName] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const b = await getFirstBusinessForOwner('mock-owner');
      if (b) {
        setBusiness(b);
        
        // Fetch locations, reviews, and scans concurrently
        const [locs, revs, scans] = await Promise.all([
          getLocations(b.id),
          getReviewsInbox(b.id, {}),
          getScans(b.id)
        ]);

        // Calculate metrics for each branch location
        const calculatedLocations = (locs || []).map(loc => {
          const locReviews = revs.filter((r: any) => r.location_id === loc.id);
          const locScans = scans.filter((s: any) => s.location_id === loc.id);
          
          const avg = locReviews.length > 0 
            ? parseFloat((locReviews.reduce((sum: number, r: any) => sum + r.stars, 0) / locReviews.length).toFixed(1))
            : 0.0;
            
          return {
            ...loc,
            avg_rating: avg,
            scans_count: locScans.length
          };
        });

        // Calculate metrics for the Main Branch (where location_id is null/undefined)
        const mainReviews = revs.filter((r: any) => !r.location_id);
        const mainScans = scans.filter((s: any) => !s.location_id);
        const mainAvg = mainReviews.length > 0
          ? parseFloat((mainReviews.reduce((sum: number, r: any) => sum + r.stars, 0) / mainReviews.length).toFixed(1))
          : 0.0;

        const mainBranchObj = {
          id: 'main',
          name: `${b.name} (Main Branch)`,
          slug: b.slug,
          google_place_id: b.google_place_id,
          google_review_url: b.google_review_url,
          is_active: b.is_active,
          avg_rating: mainAvg,
          scans_count: mainScans.length,
          is_main: true
        };

        // Put Main Branch at the top of the list
        setLocations([mainBranchObj, ...calculatedLocations]);
      }
    } catch (err) {
      console.error('Failed to load locations page data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate slug dynamically from name
  useEffect(() => {
    if (business && branchName) {
      const baseSlug = business.slug;
      const cleanBranch = branchName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setCustomSlug(`${baseSlug}-${cleanBranch}`);
    } else {
      setCustomSlug('');
    }
  }, [branchName, business]);

  if (!mounted || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-bold mt-3">Loading locations...</p>
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

  const handleCopyLink = (slug: string, id: string) => {
    const url = `${window.location.origin}/${locale}/r/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean, isMain?: boolean) => {
    if (isMain) {
      alert('The active status of the Main Branch is managed in Settings.');
      return;
    }
    const success = await toggleLocationActive(id, !currentStatus);
    if (success) {
      setLocations(locations.map(loc => loc.id === id ? { ...loc, is_active: !currentStatus } : loc));
    }
  };

  const handleDeleteLocation = async (id: string, isMain?: boolean) => {
    if (isMain) {
      alert('The Main Branch cannot be deleted.');
      return;
    }
    if (confirm('Are you sure you want to delete this branch location? NFC cards and scans associated with it will no longer map to this branch.')) {
      const success = await deleteLocation(id);
      if (success) {
        setLocations(locations.filter(loc => loc.id !== id));
      }
    }
  };

  const handleAddLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    if (!branchName.trim()) {
      setFormError('Branch name is required.');
      return;
    }
    if (!placeId.trim()) {
      setFormError('Google Place ID is required.');
      return;
    }

    setFormSubmitting(true);
    try {
      const newLoc = await createLocation(business.id, branchName, placeId, customSlug);
      if (newLoc) {
        await loadData();
        setShowAddModal(false);
        setBranchName('');
        setPlaceId('');
      } else {
        setFormError('A location with this slug or Place ID already exists.');
      }
    } catch (err) {
      console.error(err);
      setFormError('Failed to save location branch. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Locations Branch Management</h1>
          <p className="text-sm text-slate-500 font-semibold mt-1">Add, edit, and track customer reviews across multiple sites.</p>
        </div>
        <button
          onClick={() => {
            if ((business.plan === 'starter' || business.plan === 'starter_direct' || business.plan === 'free' || business.plan === 'free_direct') && locations.length >= 0) {
              setShowUpgradeModal(true);
            } else if ((business.plan === 'growth' || business.plan === 'growth_direct') && locations.length >= 2) {
              alert('You have reached the maximum limit of 3 locations (1 main + 2 branches) on the Growth plan.');
            } else {
              setShowAddModal(true);
            }
          }}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md hover:shadow-emerald-200/50 cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Add Location Branch</span>
        </button>
      </div>

      {/* Main branch list */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {locations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[180px]">Branch Details</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[140px]">Place ID</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center min-w-[100px]">Avg Rating</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center min-w-[100px]">Total Scans</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center min-w-[100px]">Status</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right min-w-[120px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-slate-50/40 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-100 text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                          <MapPin className="w-5 h-5 shrink-0" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm leading-snug">{loc.name}</h4>
                          <span className="text-[10px] font-bold text-slate-400 block mt-0.5 max-w-[200px] truncate">
                            slug: {loc.slug}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs font-semibold text-slate-500 font-mono">
                      {loc.google_place_id}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">
                        <Star className="w-3 h-3 fill-current shrink-0" />
                        <span>{loc.avg_rating || '0.0'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center text-sm font-black text-slate-800">
                      {loc.scans_count || 0}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {loc.is_main ? (
                        <span className="inline-flex text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed">
                          Always Active
                        </span>
                      ) : (
                        <button
                          onClick={() => handleToggleActive(loc.id, loc.is_active, loc.is_main)}
                          className={`inline-flex text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border cursor-pointer transition-colors ${
                            loc.is_active 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100' 
                              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {loc.is_active ? 'Active' : 'Disabled'}
                        </button>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right space-x-1.5">
                      <button
                        onClick={() => handleCopyLink(loc.slug, loc.id)}
                        title="Copy review URL"
                        className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/20 text-slate-500 hover:text-emerald-700 transition-all cursor-pointer"
                      >
                        {copiedId === loc.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <a
                        href={`/${locale}/r/${loc.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        title="View review page"
                        className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 hover:border-indigo-600 hover:bg-indigo-50/20 text-slate-500 hover:text-indigo-700 transition-all"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDeleteLocation(loc.id, loc.is_main)}
                        disabled={loc.is_main}
                        title="Delete branch"
                        className={`inline-flex items-center justify-center p-2 rounded-xl border transition-all ${
                          loc.is_main 
                            ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400' 
                            : 'border-slate-200 hover:border-red-600 hover:bg-red-50/20 text-slate-500 hover:text-red-600 cursor-pointer'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 px-6">
            <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-bold text-slate-800 text-base">No Locations Registered Yet</h3>
            <p className="text-xs text-slate-400 font-semibold max-w-xs mx-auto mt-1.5 leading-normal">
              Register additional branch locations to gather isolated ratings and route customers to specific maps pins.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-5 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md hover:shadow-emerald-200/50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Location</span>
            </button>
          </div>
        )}
      </div>

      {/* Add location modal popup */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md p-6 overflow-hidden animate-slide-up">
            <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1">
              Add Location Branch
            </h3>
            <p className="text-xs text-slate-400 font-semibold mb-6">
              Create an isolated review endpoint and Place ID for another location.
            </p>

            <form onSubmit={handleAddLocationSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Branch Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Malviya Nagar Branch"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Google Place ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. ChIJ577q_p_BwjsRn32H3t4sF2Q"
                  value={placeId}
                  onChange={(e) => setPlaceId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
                <span className="text-[10px] font-bold text-slate-400 leading-normal block">
                  Find Place IDs in Google Maps Platform developer docs.
                </span>
              </div>

              {customSlug && (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Generated Funnel URL:
                  </span>
                  <div className="flex items-center gap-1 text-slate-700 font-mono text-[10px] font-bold overflow-x-auto whitespace-nowrap">
                    <span>reviewpe.in/r/</span>
                    <span className="text-emerald-600 font-black">{customSlug}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-md hover:shadow-emerald-250 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {formSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Register Branch</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upgrade modal popup */}
      {showUpgradeModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowUpgradeModal(false)}
          />
          <div className="relative bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md p-6 overflow-hidden animate-slide-up text-center flex flex-col items-center z-50">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-black text-slate-950 tracking-tight mb-2">
              Upgrade to Growth Plan
            </h3>
            <p className="text-xs text-slate-500 font-semibold mb-6 max-w-sm">
              This feature is available on the Growth plan — ₹799/month. Upgrade to unlock multi-location, analytics heatmaps, CSV export, public developer API, and more.
            </p>
            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Go Back
              </button>
              <Link
                href={`/${locale}/dashboard/billing`}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-md hover:shadow-emerald-250 cursor-pointer text-center flex items-center justify-center"
              >
                Upgrade now
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
