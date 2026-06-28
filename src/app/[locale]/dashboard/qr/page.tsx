'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { getFirstBusinessForOwner, Business, getLocations } from '@/lib/db';
import { 
  Download, 
  Copy, 
  Check, 
  Share2, 
  Sparkles, 
  Compass, 
  Printer, 
  FileText,
  Lock
} from 'lucide-react';

const placementTips: Record<string, string> = {
  restaurant: 'Best placed on dining table and inside the bill folder.',
  retail: 'Best placed at billing counter and inside shopping bags.',
  salon: 'Best placed at reception and handed after service.',
  clinic: 'Best placed at reception and handed after service.',
  hotel: 'Best placed at check-out desk and in-room on the side table.',
  other: 'Best placed at billing counters and reception desks.'
};

export default function QRGenerator({ params }: { params: { locale: string } }) {
  const { locale } = params;

  const [mounted, setMounted] = useState(false);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('main');

  useEffect(() => {
    setMounted(true);
    getFirstBusinessForOwner('mock-owner')
      .then(async (b) => {
        setBusiness(b);
        if (b) {
          try {
            const locs = await getLocations(b.id);
            setLocations(locs || []);
          } catch (e) {
            console.error('Error fetching locations:', e);
          }
        }
        setLoading(false);
      });
  }, []);

  if (!mounted || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-bold mt-3">Loading QR code parameters...</p>
      </div>
    );
  }

  if (!business) return null;

  const selectedLocation = locations.find(loc => loc.id === selectedLocationId);
  const activeSlug = selectedLocation ? selectedLocation.slug : business.slug;
  const activeName = selectedLocation ? `${business.name} - ${selectedLocation.name}` : business.name;

  // Determine review page URL
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://reviewpe.online';
  const reviewUrl = `${appUrl}/r/${activeSlug}`;

  // Copy URL to Clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(reviewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // High Resolution PNG Download (1024x1024px, transparent background)
  const handleDownloadPNG = () => {
    // Generate an offscreen canvas at 1024x1024 resolution to ensure premium print crispness
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = 1024;
    offscreenCanvas.height = 1024;
    
    // Render the QR directly into it (uses qrcode.react drawing engine or similar)
    const hiddenCanvas = document.getElementById('qr-canvas-hidden') as HTMLCanvasElement;
    if (hiddenCanvas) {
      const dataUrl = hiddenCanvas.toDataURL('image/png');
      const img = new Image();
      img.onload = () => {
        const ctx = offscreenCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, 1024, 1024);
          const url = offscreenCanvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `${activeSlug}-highres-qr.png`;
          link.href = url;
          link.click();
        }
      };
      img.src = dataUrl;
    }
  };

  // Vector SVG Download
  const handleDownloadSVG = () => {
    const svgEl = document.getElementById('qr-svg-container')?.querySelector('svg');
    if (svgEl) {
      const svgString = new XMLSerializer().serializeToString(svgEl);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const link = document.createElement('a');
      link.download = `${activeSlug}-qr.svg`;
      link.href = svgUrl;
      link.click();
      URL.revokeObjectURL(svgUrl);
    }
  };

  // Print-Ready PDF Download (A4, A5, Business Card sizes)
  const handleDownloadPDF = async (size: 'a4' | 'a5' | 'card') => {
    setDownloadingPdf(size);
    try {
      // Get the QR code from the CLEAN canvas (no logo = no cross-origin taint)
      // The server-side PDF route handles logo embedding separately
      const canvas = document.getElementById('qr-canvas-clean') as HTMLCanvasElement;
      if (!canvas) return;
      const qrDataUrl = canvas.toDataURL('image/png');

      const res = await fetch('/api/qr/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrDataUrl,
          businessName: activeName,
          tagline: business.tagline,
          brandColor: business.brand_color,
          size,
          logoUrl: business.logo_url
        })
      });

      if (res.ok) {
        const blob = await res.blob();
        const fileURL = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = fileURL;
        link.download = `${activeSlug}-${size}-standee.pdf`;
        link.click();
        URL.revokeObjectURL(fileURL);
      } else {
        const errData = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('PDF generation failed:', errData);
        alert(`Failed to generate PDF: ${errData.detail || errData.error || 'Server error'}`);
      }
    } catch (e: any) {
      console.error('PDF fetch error:', e);
      alert(`Error fetching print PDF: ${e?.message || 'Network error'}`);
    } finally {
      setDownloadingPdf(null);
    }
  };

  const isFreePlan = business.plan === 'free' || business.plan === 'free_direct';
  const showLogoInQR = !isFreePlan && business.logo_url;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left side Live QR Preview Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-between min-h-[380px] lg:col-span-1">
        <div className="w-full flex flex-col items-center">
          <h3 className="font-bold text-slate-800 text-sm tracking-wider uppercase mb-1 text-center">QR Code Preview</h3>
          <span className="text-[10px] font-bold text-slate-400 block text-center">Live preview of your review landing link</span>
          
          {/* Branch Dropdown Selector */}
          <div className="w-full mt-4">
            {business.plan === 'growth' || business.plan === 'growth_direct' ? (
              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white cursor-pointer font-bold text-slate-700 text-center"
              >
                <option value="main">Main Branch (Default)</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            ) : (
              <select
                disabled
                value="main"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-450 cursor-not-allowed font-semibold text-center"
              >
                <option value="main">Main Branch (Growth Only 🔒)</option>
              </select>
            )}
          </div>
        </div>

        {/* Display Canvas QR Code */}
        <div className="bg-white p-4 rounded-2xl shadow-inner border border-slate-100 my-6 relative group transition-transform hover:scale-[1.02]">
          <QRCodeCanvas
            id="qr-canvas-display"
            value={reviewUrl}
            size={200}
            level="H"
            includeMargin={true}
            imageSettings={
              showLogoInQR && business.logo_url
                ? {
                    src: business.logo_url,
                    x: undefined,
                    y: undefined,
                    height: 36,
                    width: 36,
                    excavate: true
                  }
                : undefined
            }
          />
          {isFreePlan && (
            <div className="absolute bottom-2 right-2 bg-slate-850/80 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded backdrop-blur-sm flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" />
              <span>Logo Locked</span>
            </div>
          )}
        </div>

        {/* Hidden canvases and SVGs for download utilities */}
        <div className="hidden">
          {/* High res canvas renderer (1024px size) */}
          <QRCodeCanvas
            id="qr-canvas-hidden"
            value={reviewUrl}
            size={1024}
            level="H"
            includeMargin={true}
            imageSettings={
              showLogoInQR && business.logo_url
                ? {
                    src: business.logo_url,
                    x: undefined,
                    y: undefined,
                    height: 180,
                    width: 180,
                    excavate: true
                  }
                : undefined
            }
          />
          {/* Clean canvas WITHOUT logo for PDF export (avoids cross-origin taint) */}
          <QRCodeCanvas
            id="qr-canvas-clean"
            value={reviewUrl}
            size={512}
            level="H"
            includeMargin={true}
          />
          {/* SVG renderer container */}
          <div id="qr-svg-container">
            <QRCodeSVG
              value={reviewUrl}
              size={512}
              level="H"
              includeMargin={true}
              imageSettings={
                showLogoInQR && business.logo_url
                  ? {
                      src: business.logo_url,
                      x: undefined,
                      y: undefined,
                      height: 90,
                      width: 90,
                      excavate: true
                    }
                  : undefined
              }
            />
          </div>
        </div>

        {/* Core Quick Downloads */}
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <button
            onClick={handleDownloadPNG}
            className="flex-1 py-2.5 text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-all border border-slate-200/60 shadow-sm flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG</span>
          </button>
          <button
            onClick={handleDownloadSVG}
            className="flex-1 py-2.5 text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-all border border-slate-200/60 shadow-sm flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download SVG</span>
          </button>
        </div>
      </div>

      {/* Right side download templates and sharing controls */}
      <div className="lg:col-span-2 space-y-6">
        {/* Share link and copy URL cards */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm tracking-wider uppercase mb-1">Shareable Review Link</h3>
          
          <div className="flex items-center gap-3">
            <input
              type="text"
              readOnly
              value={reviewUrl}
              className="flex-1 text-xs px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-semibold focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="pt-2">
            <a
              href={`https://wa.me/?text=Rate%20us%20on%20Google%3A%20${encodeURIComponent(reviewUrl)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 border border-emerald-100 text-xs font-bold transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>Share via WhatsApp Link</span>
            </a>
          </div>
        </div>

        {/* Print Templates download list */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm tracking-wider uppercase">Print-Ready PDF Templates</h3>
            {isFreePlan && (
              <span className="text-[9px] font-extrabold bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                <span>Growth+ Plan Feature</span>
              </span>
            )}
          </div>

          <div className="divide-y divide-slate-100">
            {/* A4 Standee */}
            <div className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-50 text-slate-500">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs md:text-sm">A4 Counter Standee</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">210 × 297 mm — Great for cashier desks and walls</p>
                </div>
              </div>
              <button
                disabled={isFreePlan || downloadingPdf !== null}
                onClick={() => handleDownloadPDF('a4')}
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/20 text-xs font-bold text-slate-600 hover:text-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1 shrink-0"
              >
                {downloadingPdf === 'a4' ? (
                  <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Download PDF</span>
                  </>
                )}
              </button>
            </div>

            {/* A5 Table Tent */}
            <div className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-50 text-slate-500">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs md:text-sm">A5 Table Tent (Foldable)</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">148 × 210 mm — Fits dining tables and vanity counters</p>
                </div>
              </div>
              <button
                disabled={isFreePlan || downloadingPdf !== null}
                onClick={() => handleDownloadPDF('a5')}
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/20 text-xs font-bold text-slate-600 hover:text-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1 shrink-0"
              >
                {downloadingPdf === 'a5' ? (
                  <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Download PDF</span>
                  </>
                )}
              </button>
            </div>

            {/* Business Card size */}
            <div className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-50 text-slate-500">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs md:text-sm">Business Review Card</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">85 × 55 mm — Hand to customers or drop in shopping bags</p>
                </div>
              </div>
              <button
                disabled={isFreePlan || downloadingPdf !== null}
                onClick={() => handleDownloadPDF('card')}
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/20 text-xs font-bold text-slate-600 hover:text-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1 shrink-0"
              >
                {downloadingPdf === 'card' ? (
                  <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Download PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Placement tips section */}
        <div className="bg-amber-50/40 p-6 rounded-3xl border border-amber-100/50 flex gap-4">
          <Compass className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-amber-900 text-sm">Where should you place your QR Code?</h4>
            <p className="text-xs text-amber-800/90 font-medium leading-relaxed mt-1">
              For a <strong>{business.category}</strong>: {placementTips[business.category] || 'Place on counter standees and billing counters.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
