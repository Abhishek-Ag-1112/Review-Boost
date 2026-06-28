'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { 
  Utensils, 
  ShoppingBag, 
  Scissors, 
  Stethoscope, 
  Bed, 
  MoreHorizontal, 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  Palette, 
  QrCode, 
  MapPin, 
  Check, 
  HelpCircle,
  Mail,
  Phone,
  Copy,
  Share2
} from 'lucide-react';

const categories = [
  { id: 'restaurant', label: 'Restaurant', icon: Utensils, desc: 'Dining, cafes, food trucks' },
  { id: 'retail', label: 'Retail Shop', icon: ShoppingBag, desc: 'Groceries, boutiques, fashion' },
  { id: 'salon', label: 'Salon & Spa', icon: Scissors, desc: 'Hair, beauty, nails, wellness' },
  { id: 'clinic', label: 'Medical Clinic', icon: Stethoscope, desc: 'Doctors, dentists, physio' },
  { id: 'hotel', label: 'Hotel & Stay', icon: Bed, desc: 'Homestays, hostels, resorts' },
  { id: 'other', label: 'Other Business', icon: MoreHorizontal, desc: 'Services, repair shops' }
];

const categoryTaglines: Record<string, string> = {
  restaurant: 'How was your food and service today?',
  retail: 'How was your shopping experience today?',
  salon: 'How was your styling and service today?',
  clinic: 'How was your consultation experience?',
  hotel: 'How was your stay with us today?',
  other: 'How was your experience today?'
};

const placementTips: Record<string, string> = {
  restaurant: 'Best placed on dining tables and inside bill folders.',
  retail: 'Best placed at billing counters and inside shopping bags.',
  salon: 'Best placed at reception and handed to customers after service.',
  clinic: 'Best placed at the checkout reception desk.',
  hotel: 'Best placed at check-out desk and in-room side tables.',
  other: 'Best placed at main billing counter and service desk.'
};

export default function OnboardingWizard({ params }: { params: { locale: string } }) {
  const { locale } = params;

  // Hydration safety mount check
  const [mounted, setMounted] = useState(false);
  
  // Wizard state variables
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [googlePlaceId, setGooglePlaceId] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [brandColor, setBrandColor] = useState('#059669'); // default emerald green
  const [tagline, setTagline] = useState('');
  const [primaryLang, setPrimaryLang] = useState('en');
  
  // Collapsible help state
  const [showGuide, setShowGuide] = useState(false);
  const [slug, setSlug] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [reviewMode, setReviewMode] = useState<'smart' | 'direct'>('smart');

  useEffect(() => {
    setMounted(true);
    // Load wizard state from localStorage on load
    const saved = localStorage.getItem('reviewpe_onboarding_state');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        setStep(state.step || 1);
        setCategory(state.category || '');
        setName(state.name || '');
        setGooglePlaceId(state.googlePlaceId || '');
        setEmail(state.email || '');
        setWhatsapp(state.whatsapp || '');
        setLogoBase64(state.logoBase64 || null);
        setBrandColor(state.brandColor || '#059669');
        setTagline(state.tagline || '');
        setPrimaryLang(state.primaryLang || 'en');
        setSlug(state.slug || '');
        setReviewMode(state.reviewMode || 'smart');
      } catch (e) {
        console.error('Failed to parse onboarding state', e);
      }
    }
  }, []);

  // Save state to localStorage whenever anything changes
  useEffect(() => {
    if (!mounted) return;
    const state = {
      step,
      category,
      name,
      googlePlaceId,
      email,
      whatsapp,
      logoBase64,
      brandColor,
      tagline,
      primaryLang,
      slug,
      reviewMode
    };
    localStorage.setItem('reviewpe_onboarding_state', JSON.stringify(state));
  }, [step, category, name, googlePlaceId, email, whatsapp, logoBase64, brandColor, tagline, primaryLang, slug, reviewMode, mounted]);

  if (!mounted) return null;

  // Auto-generate slug when name changes
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (val) {
      const cleanName = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      setSlug(`${cleanName}-${randomSuffix}`);
    } else {
      setSlug('');
    }
  };

  // Pre-fill tagline when category is selected
  const handleCategorySelect = (catId: string) => {
    setCategory(catId);
    setTagline(categoryTaglines[catId] || 'How was your experience today?');
    setStep(2);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds 2MB limit');
        return;
      }
      
      const isMock = document.cookie.includes('mock-jwt-token') || document.cookie.includes('mock-session-cookie') || !process.env.NEXT_PUBLIC_SUPABASE_URL;

      if (isMock) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoBase64(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        const formData = new FormData();
        formData.append('file', file);
        try {
          const uploadRes = await fetch('/api/storage/upload', {
            method: 'POST',
            body: formData,
          });
          if (uploadRes.ok) {
            const data = await uploadRes.json();
            setLogoBase64(data.url);
          } else {
            alert('Failed to upload logo to storage');
          }
        } catch (err) {
          console.error(err);
          alert('Error uploading file');
        }
      }
    }
  };

  // Construct Review Page destination URL
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://reviewpe.online';
  const reviewUrl = `${appUrl}/r/${slug}`;

  // Download QR Code
  const downloadQR = () => {
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${slug}-qr.png`;
      link.href = url;
      link.click();
    }
  };

  // Copy Review Link
  const copyLink = () => {
    navigator.clipboard.writeText(reviewUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Onboarding completion
  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/business/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          google_place_id: googlePlaceId,
          logo_url: logoBase64,
          brand_color: brandColor,
          tagline,
          category,
          language: primaryLang,
          whatsapp_number: whatsapp,
          notification_email: email,
          plan: reviewMode === 'smart' ? 'free' : 'free_direct' // Start onboarding merchants on the selected Free tier
        })
      });

      if (res.ok) {
        // Clear onboarding storage state
        localStorage.removeItem('reviewpe_onboarding_state');
        // Redirect to dashboard
        window.location.href = `/${locale}/dashboard`;
      } else {
        alert('Failed to register business. Please try again.');
      }
    } catch (e) {
      console.error(e);
      alert('Error connecting to backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between py-12 px-4">
      <div className="w-full max-w-xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 p-8 flex flex-col">
        {/* Stepper Headers */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <img src="/icon.png" alt="ReviewPe Icon" className="w-8 h-8 object-contain rounded-xl" />
            <span className="font-extrabold text-slate-900 tracking-tight text-xl">Review<span className="text-emerald-600">Pe</span></span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full text-xs font-semibold text-slate-500">
            Step {step} of 4
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
          <div 
            className="h-full bg-emerald-600 rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* STEP 1: What type of business */}
        {step === 1 && (
          <div className="flex-1 flex flex-col">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">What type of business do you have?</h1>
            <p className="text-slate-500 text-sm mt-1 mb-6">Select your category to help us pre-configure custom templates.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              {categories.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`flex items-start gap-4 p-4 text-left border rounded-2xl transition-all duration-150 hover:bg-slate-50/50 group ${category === cat.id ? 'border-emerald-600 ring-2 ring-emerald-50' : 'border-slate-150'}`}
                  >
                    <div className={`p-3 rounded-xl border flex items-center justify-center transition-colors ${category === cat.id ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-500 group-hover:text-emerald-600'}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm md:text-base">{cat.label}</h3>
                      <p className="text-xs text-slate-400 font-medium mt-0.5 leading-snug">{cat.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Tell us about your business */}
        {step === 2 && (
          <div className="flex-1 flex flex-col">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Tell us about your business</h1>
            <p className="text-slate-500 text-sm mt-1 mb-6">Connect your details to let us compile reviews onto Google Maps.</p>

            <div className="space-y-4 flex-1">
              {/* Business Name */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Business Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={handleNameChange}
                    placeholder="e.g. Chai Point Jaipur"
                    className="w-full text-sm pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                  />
                  {slug && (
                    <span className="absolute right-3 top-3.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100">
                      /{slug}
                    </span>
                  )}
                </div>
              </div>

              {/* Google Place ID */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                    <span>Google Place ID *</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowGuide(!showGuide)}
                    className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>How to find Place ID?</span>
                  </button>
                </div>
                
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={googlePlaceId}
                    onChange={(e) => setGooglePlaceId(e.target.value)}
                    placeholder="e.g. ChIJ-x9F2u2zZTkR082K2x2W3lE"
                    className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                  />
                </div>

                {/* Collapsible Guide */}
                {showGuide && (
                  <div className="mt-2.5 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 leading-relaxed space-y-1">
                    <p className="font-bold text-slate-700 mb-1">Guide to get your Google Place ID:</p>
                    <p>1. Go to <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">maps.google.com</a></p>
                    <p>2. Search your exact business listing.</p>
                    <p>3. Copy the long place ID from URL search results, OR search online for &quot;Google Place ID Finder&quot; and paste your listing title.</p>
                    <p>4. Example: <span className="font-mono text-emerald-700 bg-emerald-50/50 px-1 py-0.5 rounded">ChIJ-x9F2u2zZTkR082K2x2W3lE</span></p>
                  </div>
                )}
              </div>

              {/* Notification Email */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Notification Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. javed@chaipoint.com"
                    className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">WhatsApp Number (Optional)</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="e.g. +919876543210"
                    className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Step Controls */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                disabled={!name || !googlePlaceId || !email}
                onClick={() => setStep(3)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 disabled:opacity-50 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Make it yours */}
        {step === 3 && (
          <div className="flex-1 flex flex-col">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Make it yours</h1>
            <p className="text-slate-500 text-sm mt-1 mb-6">Customize the review funnel branding to match your store layout.</p>

            <div className="space-y-4 flex-1">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Business Logo (Optional)</label>
                <div className="flex items-center gap-4">
                  {logoBase64 ? (
                    <div className="relative w-16 h-16 rounded-xl border overflow-hidden shadow-inner bg-slate-50 shrink-0">
                      <img src={logoBase64} alt="Uploaded logo" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setLogoBase64(null)}
                        className="absolute inset-0 bg-black/60 text-white flex items-center justify-center text-[10px] font-bold opacity-0 hover:opacity-100 transition-opacity"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-emerald-600 hover:text-emerald-600 cursor-pointer transition-colors shrink-0">
                      <Upload className="w-4 h-4" />
                      <span className="text-[9px] font-bold mt-1">Upload</span>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  )}
                  <div className="text-xs text-slate-400 font-medium">
                    <p className="text-slate-600 font-bold">Upload PNG, JPG, or SVG</p>
                    <p>Max size of 2MB. Logo will display inside the review portal and QR.</p>
                  </div>
                </div>
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Review Tagline</label>
                <input
                  type="text"
                  maxLength={60}
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. How was your experience today?"
                  className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                />
                <p className="text-[10px] text-slate-400 mt-1 font-medium">This text is shown right above the star rating icons.</p>
              </div>

              {/* Brand Color Picker */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Brand Accent Color</label>
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                    <input
                      type="color"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="absolute inset-0 w-full h-full transform scale-125 cursor-pointer"
                    />
                  </div>
                  <div className="flex gap-2">
                    {['#059669', '#4f46e5', '#d97706', '#dc2626', '#db2777', '#0284c7'].map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setBrandColor(color)}
                        className={`w-6 h-6 rounded-full border transition-all ${brandColor === color ? 'ring-2 ring-emerald-100 border-white scale-110' : 'border-slate-100 hover:scale-105'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Language Selector */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Primary Language</label>
                <select
                  value={primaryLang}
                  onChange={(e) => setPrimaryLang(e.target.value)}
                  className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white cursor-pointer"
                >
                  <option value="en">English (Default)</option>
                  <option value="hi">Hindi (हिंदी)</option>
                  <option value="mr">Marathi (मराठी)</option>
                  <option value="ta">Tamil (தமிழ்)</option>
                  <option value="te">Telugu (తెలుగు)</option>
                  <option value="kn">Kannada (ಕನ್ನಡ)</option>
                </select>
              </div>

              {/* Review Routing Mode */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Review Routing Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    key="mode-smart"
                    type="button"
                    onClick={() => setReviewMode('smart')}
                    className={`p-3 text-left border rounded-xl transition-all ${reviewMode === 'smart' ? 'border-emerald-600 bg-emerald-50/10 ring-2 ring-emerald-50' : 'border-slate-200'}`}
                  >
                    <span className="block text-xs font-black text-slate-800">Smart Funnel</span>
                    <span className="block text-[9px] text-slate-400 mt-0.5 leading-snug">Filters 1-3★ ratings to private form</span>
                  </button>
                  <button
                    key="mode-direct"
                    type="button"
                    onClick={() => setReviewMode('direct')}
                    className={`p-3 text-left border rounded-xl transition-all ${reviewMode === 'direct' ? 'border-emerald-600 bg-emerald-50/10 ring-2 ring-emerald-50' : 'border-slate-200'}`}
                  >
                    <span className="block text-xs font-black text-slate-800">Direct Route</span>
                    <span className="block text-[9px] text-slate-400 mt-0.5 leading-snug">Redirects all ratings straight to Google</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Step Controls */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
              >
                <span>Generate QR</span>
                <QrCode className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Your QR is ready */}
        {step === 4 && (
          <div className="flex-1 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 animate-pulse">
              <QrCode className="w-6 h-6" />
            </div>
            
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Your QR is ready!</h1>
            <p className="text-slate-500 text-sm mt-1 mb-6">Print this code and place it where customers can easily scan it.</p>

            <div className="flex flex-col items-center border border-slate-100 rounded-3xl p-6 shadow-sm mb-6 bg-slate-50/50">
              {/* Dynamic QR canvas rendering */}
              <div className="bg-white p-4 rounded-2xl shadow-inner border border-slate-100">
                <QRCodeCanvas
                  id="qr-canvas"
                  value={reviewUrl}
                  size={180}
                  level="H"
                  includeMargin={true}
                  imageSettings={
                    logoBase64
                      ? {
                          src: logoBase64,
                          x: undefined,
                          y: undefined,
                          height: 32,
                          width: 32,
                          excavate: true
                        }
                      : undefined
                  }
                />
              </div>

              <div className="mt-4 flex flex-col gap-2 w-full max-w-[280px]">
                <button
                  type="button"
                  onClick={downloadQR}
                  className="w-full py-2.5 text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 rotate-180" />
                  <span>Download QR PNG</span>
                </button>
              </div>
            </div>

            {/* Placement tip block based on category selection */}
            <div className="w-full p-4 rounded-2xl bg-amber-50/40 border border-amber-100/50 text-left text-xs text-amber-800 leading-relaxed mb-6 flex items-start gap-2.5">
              <Palette className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <p className="font-bold text-amber-900">Placement Tip</p>
                <p className="font-medium text-amber-800/90 mt-0.5">
                  {placementTips[category] || 'Best placed where customers complete payments or complete service.'}
                </p>
              </div>
            </div>

            {/* Share link and CTA section */}
            <div className="w-full flex flex-col gap-2.5 pt-6 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={copyLink}
                  className="flex-1 py-3 text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
                <a
                  href={`https://wa.me/?text=Rate%20us%20on%20Google%3A%20${encodeURIComponent(reviewUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3 text-sm font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share on WhatsApp</span>
                </a>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleComplete}
                className="w-full py-3.5 text-white font-bold bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Finish & Go to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
