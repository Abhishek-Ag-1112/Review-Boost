'use client';

import React, { useState, useEffect } from 'react';
import { getFirstBusinessForOwner, Business } from '@/lib/db';
import { 
  Building2, 
  Palette, 
  Languages, 
  Bell, 
  Trash2, 
  HelpCircle, 
  Upload, 
  Check, 
  AlertTriangle,
  Smartphone,
  Star,
  Eye,
  Code,
  Copy,
  Lock,
  Sparkles
} from 'lucide-react';

export default function BusinessSettings({ params }: { params: { locale: string } }) {
  const { locale } = params;

  const [mounted, setMounted] = useState(false);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [successSection, setSuccessSection] = useState<string | null>(null);

  // Profile Form States
  const [name, setName] = useState('');
  const [category, setCategory] = useState('restaurant');
  const [googlePlaceId, setGooglePlaceId] = useState('');

  // AI Personalization Form States
  const [vibe, setVibe] = useState('');
  const [theme, setTheme] = useState('');
  const [ambiance, setAmbiance] = useState('');
  const [staffHighlights, setStaffHighlights] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [brandValues, setBrandValues] = useState('');
  const [reviewTone, setReviewTone] = useState('casual');
  const [targetKeywords, setTargetKeywords] = useState('');
  const [avoidPhrases, setAvoidPhrases] = useState('');

  // Branding Form States
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [tagline, setTagline] = useState('');
  const [brandColor, setBrandColor] = useState('#000000');
  const [hideBranding, setHideBranding] = useState(false);

  // Language Form States
  const [primaryLanguage, setPrimaryLanguage] = useState('en');
  const [allowChangeLang, setAllowChangeLang] = useState(true);

  // Notification States
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [notificationEmail, setNotificationEmail] = useState('');
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [alertThreshold, setAlertThreshold] = useState(3);

  // Preview Helpers
  const [previewStars, setPreviewStars] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    getFirstBusinessForOwner('mock-owner')
      .then(b => {
        if (b) {
          setBusiness(b);
          // Pre-fill profile
          setName(b.name);
          setCategory(b.category);
          setGooglePlaceId(b.google_place_id);
          // Pre-fill AI personalization
          setVibe(b.vibe || '');
          setTheme(b.theme || '');
          setAmbiance(b.ambiance || '');
          setStaffHighlights(b.staff_highlights || '');
          setSpecialties(b.specialties || '');
          setBrandValues(b.brand_values || '');
          setReviewTone(b.review_tone || 'casual');
          setTargetKeywords(b.target_keywords || '');
          setAvoidPhrases(b.avoid_phrases || '');
          // Pre-fill branding
          setLogoUrl(b.logo_url);
          setTagline(b.tagline);
          setBrandColor(b.brand_color);
          setHideBranding(!!b.hide_branding);
          // Pre-fill languages
          setPrimaryLanguage(b.language);
          // Pre-fill notifications
          setWhatsappNumber(b.whatsapp_number || '');
          setNotificationEmail(b.notification_email || '');
        }
        setLoading(false);
      });
  }, []);

  if (!mounted || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-bold mt-3">Loading settings data...</p>
      </div>
    );
  }

  if (!business) return null;

  const handleSave = async (section: string, payload: any) => {
    setSavingSection(section);
    try {
      const res = await fetch('/api/business/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          ...payload
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setBusiness(updated);
        setSuccessSection(section);
        setTimeout(() => setSuccessSection(null), 2500);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to save settings');
    } finally {
      setSavingSection(null);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Logo image exceeds 2MB size limit');
        return;
      }

      const isMock = document.cookie.includes('mock-jwt-token') || document.cookie.includes('mock-session-cookie') || !process.env.NEXT_PUBLIC_SUPABASE_URL;

      if (isMock) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoUrl(reader.result as string);
          // Automatically save branding changes
          handleSave('branding', { logo_url: reader.result as string });
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
            setLogoUrl(data.url);
            handleSave('branding', { logo_url: data.url });
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

  const handleDeactivate = async () => {
    const confirm = window.confirm('Are you sure you want to deactivate this business portal? Your QR link will show a "business deactivated" warning.');
    if (confirm) {
      await handleSave('danger', { is_active: false });
    }
  };

  const handleDeleteAccount = async () => {
    const confirm = window.confirm('⚠️ WARNING: Deleting your account will remove all reviews, scans, locations, and settings permanently. This action CANNOT be undone. Type "DELETE" to confirm.');
    if (confirm) {
      const promptText = window.prompt('Type DELETE to confirm:');
      if (promptText === 'DELETE') {
        // Mock account deletion
        alert('Account deleted successfully.');
        document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        window.location.href = `/${locale}/login`;
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left side Form settings columns */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* BUSINESS PROFILE */}
        <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <h3 className="font-bold text-slate-800 text-sm tracking-wider uppercase">Business Profile</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Business Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white cursor-pointer"
                >
                  <option value="restaurant">Restaurant</option>
                  <option value="retail">Retail Shop</option>
                  <option value="salon">Salon & Spa</option>
                  <option value="clinic">Medical Clinic</option>
                  <option value="hotel">Hotel & Stay</option>
                  <option value="other">Other Service</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Google Place ID</label>
                <a
                  href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-emerald-600 hover:underline flex items-center gap-0.5"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Find your Place ID</span>
                </a>
              </div>
              <input
                type="text"
                value={googlePlaceId}
                onChange={(e) => setGooglePlaceId(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
              />
            </div>
            
            <button
              onClick={() => handleSave('profile', { name, category, google_place_id: googlePlaceId })}
              disabled={savingSection === 'profile'}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              {savingSection === 'profile' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : successSection === 'profile' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </section>

        {/* BRANDING ACCENTS */}
        <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="w-5 h-5 text-emerald-600 shrink-0" />
            <h3 className="font-bold text-slate-800 text-sm tracking-wider uppercase">Custom Branding</h3>
          </div>

          <div className="space-y-4">
            {/* Logo Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Business Logo</label>
              <div className="flex items-center gap-4">
                {logoUrl ? (
                  <div className="relative w-14 h-14 rounded-xl border overflow-hidden bg-slate-50 shrink-0 shadow-inner">
                    <img src={logoUrl} alt="Logo preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => {
                        setLogoUrl(null);
                        handleSave('branding', { logo_url: null });
                      }}
                      className="absolute inset-0 bg-black/60 text-white flex items-center justify-center text-[10px] font-bold opacity-0 hover:opacity-100 transition-opacity"
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <label className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-emerald-600 hover:text-emerald-600 cursor-pointer transition-colors shrink-0">
                    <Upload className="w-4 h-4" />
                    <span className="text-[8px] font-bold mt-1">Upload</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                )}
                <div className="text-[11px] text-slate-400 font-medium">
                  <p className="text-slate-600 font-bold">Accepts PNG, JPG, or SVG</p>
                  <p>Max size of 2MB. Logo appears inside review panels and center of QR code.</p>
                </div>
              </div>
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Review Portal Tagline</label>
              <input
                type="text"
                maxLength={60}
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="How was your experience today?"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
              />
            </div>

            {/* Brand Color Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Accent Brand Color</label>
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="absolute inset-0 w-full h-full transform scale-125 cursor-pointer"
                  />
                </div>
                <div className="flex gap-2">
                  {['#059669', '#4f46e5', '#d97706', '#dc2626', '#db2777', '#000000'].map(color => (
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
            
            {/* White label toggle */}
            <div className="flex items-center pt-3 border-t border-slate-100 mt-4">
              {business.plan === 'growth' ? (
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hideBranding}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setHideBranding(checked);
                    }}
                    className="w-4.5 h-4.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">Hide ReviewPe Branding (White-label)</span>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Remove the &quot;Powered by ReviewPe&quot; footer branding from your customer pages.</span>
                  </div>
                </label>
              ) : (
                <div className="flex items-start gap-2.5 p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl w-full">
                  <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-slate-400 block flex items-center gap-1">
                      Hide ReviewPe Branding <span className="text-[8px] font-black bg-indigo-50 border border-indigo-150 text-indigo-600 px-1.5 py-0.5 rounded">Growth Plan</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-1">Remove the ReviewPe watermark from your pages. Upgrade to Growth Plan to unlock.</span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => handleSave('branding', { tagline, brand_color: brandColor, hide_branding: hideBranding })}
              disabled={savingSection === 'branding'}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              {savingSection === 'branding' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : successSection === 'branding' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </section>

        {/* AI REVIEW PERSONALIZATION */}
        <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
            <h3 className="font-bold text-slate-800 text-sm tracking-wider uppercase">AI Review Personalization</h3>
          </div>

          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            Customize the details our AI uses to generate personalized customer review suggestions.
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Business Vibe</label>
                <input
                  type="text"
                  value={vibe}
                  onChange={(e) => setVibe(e.target.value)}
                  placeholder="e.g. Cozy, lively, family-friendly"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Theme / Style</label>
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="e.g. Modern chic, rustic traditional"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Specialties & Bestsellers</label>
                <input
                  type="text"
                  value={specialties}
                  onChange={(e) => setSpecialties(e.target.value)}
                  placeholder="e.g. Masala Chai, Butter Chicken, Hair Spa"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Unique Brand Values</label>
                <input
                  type="text"
                  value={brandValues}
                  onChange={(e) => setBrandValues(e.target.value)}
                  placeholder="e.g. Eco-friendly, organic ingredients, handmade"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Ambiance details</label>
              <input
                type="text"
                value={ambiance}
                onChange={(e) => setAmbiance(e.target.value)}
                placeholder="e.g. Soft lighting, relaxing instrumental music, spacious seating"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Staff & Service Highlights</label>
              <input
                type="text"
                value={staffHighlights}
                onChange={(e) => setStaffHighlights(e.target.value)}
                placeholder="e.g. Friendly waiter Javed, super quick checkouts, polite receptionists"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Review Tone of Voice</label>
                <select
                  value={reviewTone}
                  onChange={(e) => setReviewTone(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white cursor-pointer"
                >
                  <option value="casual">Casual & Conversational (Default)</option>
                  <option value="enthusiastic">Enthusiastic & Exciting</option>
                  <option value="formal">Formal & Professional</option>
                  <option value="concise">Concise & Direct</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Target Keywords</label>
                <input
                  type="text"
                  value={targetKeywords}
                  onChange={(e) => setTargetKeywords(e.target.value)}
                  placeholder="e.g. worth the money, quick checkout, fresh coffee"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phrases / Topics to Avoid</label>
              <input
                type="text"
                value={avoidPhrases}
                onChange={(e) => setAvoidPhrases(e.target.value)}
                placeholder="e.g. parking, long lines, expensive prices"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
              />
            </div>
            
            <button
              onClick={() => handleSave('ai_personalization', { 
                vibe, 
                theme, 
                ambiance, 
                staff_highlights: staffHighlights, 
                specialties, 
                brand_values: brandValues,
                review_tone: reviewTone,
                target_keywords: targetKeywords,
                avoid_phrases: avoidPhrases
              })}
              disabled={savingSection === 'ai_personalization'}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              {savingSection === 'ai_personalization' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : successSection === 'ai_personalization' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Personalization</span>
              )}
            </button>
          </div>
        </section>

        {/* LANGUAGES CONFIG */}
        <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Languages className="w-5 h-5 text-emerald-600 shrink-0" />
            <h3 className="font-bold text-slate-800 text-sm tracking-wider uppercase">Language Configuration</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Primary Language</label>
                <select
                  value={primaryLanguage}
                  onChange={(e) => setPrimaryLanguage(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white cursor-pointer"
                >
                  <option value="en">English (Default)</option>
                  <option value="hi">Hindi (हिंदी)</option>
                  <option value="mr">Marathi (मराठी)</option>
                  <option value="ta">Tamil (தமிழ்)</option>
                  <option value="te">Telugu (తెలుగు)</option>
                  <option value="kn">Kannada (ಕನ್ನಡ)</option>
                </select>
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowChangeLang}
                    onChange={(e) => setAllowChangeLang(e.target.checked)}
                    className="w-4.5 h-4.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-600">Allow customers to toggle languages</span>
                </label>
              </div>
            </div>
            
            <button
              onClick={() => handleSave('language', { language: primaryLanguage })}
              disabled={savingSection === 'language'}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              {savingSection === 'language' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : successSection === 'language' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </section>

        {/* NOTIFICATIONS SECTION */}
        <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-5 h-5 text-emerald-600 shrink-0" />
            <h3 className="font-bold text-slate-800 text-sm tracking-wider uppercase">Alerts & Notifications</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Notification Email</label>
                <input
                  type="email"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">WhatsApp Alerts Number</label>
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+919876543210"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="w-4.5 h-4.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-600">Email Alerts</span>
                </label>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whatsappAlerts}
                    onChange={(e) => setWhatsappAlerts(e.target.checked)}
                    className="w-4.5 h-4.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-600">WhatsApp Alerts</span>
                </label>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Alert Threshold</label>
                <select
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(parseInt(e.target.value, 10))}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white cursor-pointer"
                >
                  <option value="3">3 Stars or below (Negative)</option>
                  <option value="2">2 Stars or below</option>
                  <option value="1">1 Star only</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={() => handleSave('notifications', { whatsapp_number: whatsappNumber, notification_email: notificationEmail })}
              disabled={savingSection === 'notifications'}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              {savingSection === 'notifications' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : successSection === 'notifications' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </section>

        {/* DEVELOPER API ACCESS */}
        <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600 shrink-0">
              <Code className="w-5 h-5" />
            </span>
            <h3 className="font-bold text-slate-800 text-sm tracking-wider uppercase">Developer API Access</h3>
          </div>

          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            Integrate your business reviews, traffic scans, and performance summary directly into external CRM or business intelligence tools.
          </p>

          {business.plan === 'growth' ? (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Your Bearer API Token
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={business.api_key || 'No API key generated yet.'}
                    className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none"
                  />
                  {business.api_key && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(business.api_key || '');
                        // Visual key copy confirmation
                        alert('API Key copied to clipboard!');
                      }}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-purple-650 hover:bg-purple-50/20 text-slate-500 hover:text-purple-700 transition-all cursor-pointer"
                    >
                      <Copy className="w-4.5 h-4.5" />
                    </button>
                  )}
                </div>
                <span className="text-[10px] font-bold text-slate-450 leading-normal block">
                  Authenticate your requests by adding the header <code className="bg-white px-1 py-0.5 rounded border text-purple-600 font-mono font-bold">Authorization: Bearer YOUR_API_TOKEN</code>.
                </span>
              </div>
 
              <div className="flex gap-4">
                <button
                  onClick={async () => {
                    const newKey = `rb_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
                    await handleSave('api', { api_key: newKey });
                  }}
                  disabled={savingSection === 'api'}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {savingSection === 'api' ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>{business.api_key ? 'Regenerate API Token' : 'Generate API Token'}</span>
                  )}
                </button>
              </div>
 
              {/* Mini Quick Reference Docs */}
              <div className="bg-purple-50/20 border border-purple-100 rounded-2xl p-4 space-y-2">
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                  Quick API Reference:
                </span>
                <ul className="space-y-1.5 text-[11px] text-slate-500 font-semibold list-disc list-inside">
                  <li><code className="text-purple-600 font-mono">GET /api/v1/summary</code> - Stats overview</li>
                  <li><code className="text-purple-655 font-mono">GET /api/v1/reviews?stars=5</code> - Filtered reviews</li>
                  <li><code className="text-purple-655 font-mono">GET /api/v1/scans?limit=25</code> - Pagination log</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-5 text-center flex flex-col items-center">
              <Lock className="w-8 h-8 text-slate-455 mb-3" />
              <h4 className="font-bold text-slate-800 text-xs">Developer API Gated</h4>
              <p className="text-[11px] text-slate-400 font-semibold mt-1 max-w-xs leading-normal">
                Access tokens for querying reviews and scan statistics are available only on the Growth tier. Contact the admin team to upgrade.
              </p>
              <a
                href={`/${locale}/dashboard/billing`}
                className="mt-4 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md hover:shadow-purple-100 cursor-pointer inline-block"
              >
                Contact for Upgrade
              </a>
            </div>
          )}
        </section>

        {/* DANGER ZONE */}
        <section className="bg-red-50/30 p-6 rounded-3xl border border-red-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2 text-red-700">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h3 className="font-bold text-sm tracking-wider uppercase">Danger Zone</h3>
          </div>

          <p className="text-xs text-red-650/80 font-semibold leading-relaxed">
            Actions in this section are highly sensitive. Please make sure of details before making updates.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleDeactivate}
              className="w-full sm:w-auto px-4.5 py-2.5 rounded-xl bg-white border border-red-200 hover:bg-red-55 text-red-700 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Deactivate Portal</span>
            </button>
            <button
              onClick={handleDeleteAccount}
              className="w-full sm:w-auto px-4.5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              <span>Delete All Store Data</span>
            </button>
          </div>
        </section>
      </div>

      {/* Right side Live Review Page Preview Panel */}
      <div className="lg:col-span-1 space-y-4">
        <div className="sticky top-24">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            <Eye className="w-4 h-4" />
            <span>Live Branding Preview</span>
          </div>

          {/* Miniature review page container frame */}
          <div 
            className="w-full rounded-3xl bg-white shadow-xl border border-slate-100 overflow-hidden flex flex-col scale-[0.9] origin-top md:scale-100 transition-all"
            style={{ '--brand': brandColor } as React.CSSProperties}
          >
            <div className="p-4 bg-slate-50 border-b border-slate-100 text-center">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Customer review page</span>
            </div>

            <div className="p-6 flex flex-col items-center text-center">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-14 h-14 rounded-full object-cover shadow-sm mb-3 bg-white" />
              ) : (
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg mb-3"
                  style={{ backgroundColor: brandColor }}
                >
                  {name.charAt(0).toUpperCase() || 'R'}
                </div>
              )}

              <h4 className="font-bold text-slate-800 text-sm">{name || 'Your Business Name'}</h4>
              <p className="text-[10px] text-slate-400 font-semibold mt-1 leading-tight">{tagline || 'How was your experience today?'}</p>

              {/* Star selector preview interactive states */}
              <div className="flex gap-1.5 my-6">
                {[1, 2, 3, 4, 5].map(s => (
                  <button
                    key={s}
                    onClick={() => setPreviewStars(s)}
                    className="focus:outline-none"
                    aria-label={`Preview ${s} Star`}
                  >
                    <Star 
                      className={`w-7 h-7 transition-colors shrink-0`}
                      fill={previewStars && s <= previewStars ? '#eab308' : 'none'}
                      color={previewStars && s <= previewStars ? '#eab308' : '#cbd5e1'}
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>

              {/* Dynamic Step visualizer */}
              {previewStars === null ? (
                <span className="text-[10px] font-bold text-slate-400">Click a star to test rating states</span>
              ) : previewStars >= 4 ? (
                <div className="w-full text-left bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2">
                  <span className="text-[10px] font-extrabold text-[var(--brand)]">AI Suggestions</span>
                  <div className="flex flex-col gap-1.5">
                    <div className="h-5 rounded-md bg-white border border-slate-150 text-[8px] flex items-center px-2 text-slate-500">
                      &quot;Great experience overall, would recommend!&quot;
                    </div>
                    <div className="h-5 rounded-md bg-white border border-slate-150 text-[8px] flex items-center px-2 text-slate-500">
                      &quot;The staff were helpful and service was prompt.&quot;
                    </div>
                  </div>
                  <div className="h-7 w-full rounded-lg text-white text-[10px] font-bold flex items-center justify-center mt-2 shadow-sm" style={{ backgroundColor: brandColor }}>
                    Post on Google
                  </div>
                </div>
              ) : (
                <div className="w-full text-left bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2">
                  <span className="text-[10px] font-extrabold text-red-600 block">Private feedback form</span>
                  <div className="h-10 rounded-lg bg-white border border-slate-150 text-[9px] p-2 text-slate-400">
                    What could we improve?
                  </div>
                  <div className="h-7 w-full rounded-lg text-white text-[10px] font-bold flex items-center justify-center mt-2 shadow-sm" style={{ backgroundColor: brandColor }}>
                    Send Feedback Privately
                  </div>
                </div>
              )}
            </div>
            
            {!(business.plan === 'growth' && hideBranding) && (
              <div className="py-2.5 bg-slate-50 border-t border-slate-100 text-center">
                <span className="text-[8px] font-bold text-slate-450 tracking-widest uppercase">Powered by ReviewPe</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
