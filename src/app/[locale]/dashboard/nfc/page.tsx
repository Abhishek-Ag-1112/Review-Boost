'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getFirstBusinessForOwner, 
  getLocations, 
  getNfcCards, 
  createNfcCard, 
  deleteNfcCard, 
  toggleNfcCardActive,
  Business 
} from '@/lib/db';
import UpgradeGate from '../UpgradeGate';
import { 
  Wifi, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle,
  Smartphone,
  Info,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  MapPin,
  Loader,
  Copy
} from 'lucide-react';

export default function NfcCardsPage({ params }: { params: { locale: string } }) {
  const { locale } = params;

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<Business | null>(null);
  const [nfcCards, setNfcCards] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states
  const [label, setLabel] = useState('');
  const [uid, setUid] = useState('');
  const [locationId, setLocationId] = useState('');
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Web NFC Scan state
  const [scanSupported, setScanSupported] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');

  useEffect(() => {
    setMounted(true);
    loadData();
    
    // Check Web NFC API support
    if (typeof window !== 'undefined' && 'NDEFReader' in window) {
      setScanSupported(true);
    }
  }, []);

  const loadData = async () => {
    try {
      const b = await getFirstBusinessForOwner('mock-owner');
      if (b) {
        setBusiness(b);
        if (b.plan === 'growth' || b.plan === 'starter' || b.plan === 'free') {
          const [cards, locs] = await Promise.all([
            getNfcCards(b.id),
            getLocations(b.id)
          ]);
          setNfcCards(cards);
          setLocations(locs);
        }
      }
    } catch (err) {
      console.error('Failed to load NFC cards page data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-bold mt-3">Loading NFC dashboard...</p>
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

  const isGated = false; // Gated at creation action level (1 NFC card maximum) for Starter users

  const handleStartScan = async () => {
    if (!('NDEFReader' in window)) return;
    setIsScanning(true);
    setScanStatus('Approach NFC card to the back of your phone...');
    setFormError('');

    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();
      
      ndef.addEventListener("readingerror", () => {
        setScanStatus('');
        setIsScanning(false);
        setFormError("Reading error. Ensure the card is writable/readable.");
      });

      ndef.addEventListener("reading", ({ serialNumber }: any) => {
        if (serialNumber) {
          setUid(serialNumber);
          setScanStatus('Tag scanned successfully!');
          // Play a small beep pattern or checkmark
          setTimeout(() => {
            setIsScanning(false);
            setScanStatus('');
          }, 1500);
        } else {
          setFormError("Scanned a blank tag with no serial number. Enter UID manually.");
          setIsScanning(false);
        }
      });
    } catch (err: any) {
      console.error("NFC scanning error:", err);
      setFormError(err.message || "Failed to start NFC scan. Give permission if asked.");
      setIsScanning(false);
      setScanStatus('');
    }
  };

  const handleCopyRedirect = (cardUid: string) => {
    const url = `${window.location.origin}/nfc/${cardUid}`;
    navigator.clipboard.writeText(url);
    setCopiedId(cardUid);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const success = await toggleNfcCardActive(id, !currentStatus);
    if (success) {
      setNfcCards(nfcCards.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (confirm('Are you sure you want to delete this NFC card? Taps on this tag will no longer redirect to your review portal.')) {
      const success = await deleteNfcCard(id);
      if (success) {
        setNfcCards(nfcCards.filter(c => c.id !== id));
      }
    }
  };

  const handleAddCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!label.trim()) {
      setFormError('Label is required.');
      return;
    }
    if (!uid.trim()) {
      setFormError('Card UID is required.');
      return;
    }

    setFormSubmitting(true);
    try {
      const linkedLocId = locationId === '' ? null : locationId;
      const newCard = await createNfcCard(business.id, label, uid, linkedLocId);
      if (newCard) {
        // Resolve branch name for mock local render
        const matchedLoc = locations.find(l => l.id === linkedLocId);
        const cardWithLocation = {
          ...newCard,
          tap_count: 0,
          conversion_rate: 0,
          locations: matchedLoc ? { name: matchedLoc.name } : null
        };
        setNfcCards([...nfcCards, cardWithLocation]);
        setShowAddModal(false);
        setLabel('');
        setUid('');
        setLocationId('');
      } else {
        setFormError('A card with this UID is already registered.');
      }
    } catch (err) {
      console.error(err);
      setFormError('Failed to register NFC card.');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">NFC Card Registry</h1>
          <p className="text-sm text-slate-500 font-semibold mt-1">Register smart NFC review cards and route taps to custom destinations.</p>
        </div>
        <button
          onClick={() => {
            if ((business.plan === 'starter' || business.plan === 'free') && nfcCards.length >= 1) {
              setShowUpgradeModal(true);
            } else if (business.plan === 'growth' && nfcCards.length >= 10) {
              alert('You have reached the maximum limit of 10 NFC cards on the Growth plan.');
            } else {
              setShowAddModal(true);
            }
          }}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md hover:shadow-emerald-200/50 cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Register NFC Card</span>
        </button>
      </div>

      {/* Info panel */}
      <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex gap-3">
          <div className="p-2 rounded-2xl bg-indigo-100 text-indigo-600 shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-xs">How NFC Cards Work</h4>
            <p className="text-[11px] text-slate-500 font-semibold mt-1 leading-normal max-w-2xl">
              Write the redirect URL (e.g. <code className="bg-white/80 px-1 py-0.5 rounded font-mono border text-indigo-600 font-extrabold">{window.location.origin}/nfc/card_uid</code>) onto your physical tags. When customer taps the card, our redirect router logs the tap, tracks the conversion rate, and forwards them to the review portal.
            </p>
          </div>
        </div>
      </div>

      {/* Main card list */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {nfcCards.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Card Label</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Chip UID</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Linked Destination</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Taps</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Conversion</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {nfcCards.map((card) => (
                  <tr key={card.id} className="hover:bg-slate-50/40 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                          <Wifi className="w-5 h-5 shrink-0" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm leading-snug">{card.label}</h4>
                          <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                            Created {new Date(card.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs font-semibold text-slate-500 font-mono">
                      {card.card_uid}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {card.locations?.name || 'Main Review Portal'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center text-sm font-black text-slate-800">
                      {card.tap_count || 0}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="inline-flex items-center gap-1 text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                        <span>{card.conversion_rate || 0}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleToggleActive(card.id, card.is_active)}
                        className={`inline-flex text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border cursor-pointer transition-colors ${
                          card.is_active 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100' 
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {card.is_active ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right space-x-1.5">
                      <button
                        onClick={() => handleCopyRedirect(card.card_uid)}
                        title="Copy redirect URL to write to NFC tag"
                        className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 hover:border-indigo-600 hover:bg-indigo-50/20 text-slate-500 hover:text-indigo-700 transition-all cursor-pointer"
                      >
                        {copiedId === card.card_uid ? <Check className="w-4 h-4 text-indigo-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <a
                        href={`/nfc/${card.card_uid}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Test NFC Tap redirect"
                        className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/20 text-slate-500 hover:text-emerald-700 transition-all"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDeleteCard(card.id)}
                        title="Delete NFC registry"
                        className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 hover:border-red-600 hover:bg-red-50/20 text-slate-500 hover:text-red-600 transition-all cursor-pointer"
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
            <Wifi className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-bold text-slate-800 text-base">No NFC Cards Registered</h3>
            <p className="text-xs text-slate-400 font-semibold max-w-xs mx-auto mt-1.5 leading-normal">
              Register smart NFC tap cards or table stands and track detailed conversions across table tags.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-5 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md hover:shadow-emerald-200/50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register Your First Card</span>
            </button>
          </div>
        )}
      </div>

      {/* Add NFC Card Modal Popup */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md p-6 overflow-hidden animate-slide-up">
            <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1">
              Register NFC Card
            </h3>
            <p className="text-xs text-slate-400 font-semibold mb-6">
              Link a new physical chip UID to a branch location for scan-source tracking.
            </p>

            <form onSubmit={handleAddCardSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Card Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. Front Counter Card or Table 4"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              {/* NFC scan check */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Chip UID
                  </label>
                  {scanSupported && (
                    <button
                      type="button"
                      onClick={handleStartScan}
                      disabled={isScanning}
                      className="text-[10px] font-black text-indigo-600 hover:text-indigo-850 inline-flex items-center gap-1 focus:outline-none cursor-pointer"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>{isScanning ? 'Scanning...' : 'Scan via Web NFC'}</span>
                    </button>
                  )}
                </div>

                {isScanning && (
                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-2.5 animate-pulse">
                    <Loader className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
                    <span className="text-[10px] font-bold text-indigo-700">{scanStatus}</span>
                  </div>
                )}

                <input
                  type="text"
                  placeholder="e.g. NFC-TAG-12345"
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-mono"
                />
                
                {!scanSupported && !isScanning && (
                  <span className="text-[9px] font-bold text-slate-400 leading-normal block">
                    Web NFC scanner requires Android Chrome. Enter card UID manually on other systems.
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Link to Destination
                </label>
                <select
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="">Main Review Page ({business.name})</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.slug})
                    </option>
                  ))}
                </select>
              </div>

              {uid && (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Redirect URL to write onto physical card:
                  </span>
                  <div className="flex items-center gap-1 text-slate-700 font-mono text-[10px] font-bold overflow-x-auto whitespace-nowrap">
                    <span>reviewpe.in/nfc/</span>
                    <span className="text-indigo-600 font-black">{uid}</span>
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
                    <span>Register NFC Card</span>
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
              This feature is available on the Growth plan — ₹799/month. Upgrade to unlock multi-location, NFC cards, analytics heatmaps, CSV export, public developer API, and more.
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
