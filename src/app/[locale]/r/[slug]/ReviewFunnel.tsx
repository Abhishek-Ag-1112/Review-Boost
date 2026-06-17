'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Business } from '@/lib/db';
import { Sparkles, Star, ChevronDown, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';

interface ReviewFunnelProps {
  business: Business;
  currentLocale: string;
}

interface StarRatingProps {
  onSelectRating: (rating: number) => void;
  starsLabel: string;
}

const StarRating = React.memo(({ onSelectRating, starsLabel }: StarRatingProps) => {
  const [hoverStars, setHoverStars] = useState<number | null>(null);

  return (
    <div className="w-full flex flex-col items-center py-4">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
        {starsLabel}
      </span>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onSelectRating(star)}
            onMouseEnter={() => setHoverStars(star)}
            onMouseLeave={() => setHoverStars(null)}
            className="p-1 cursor-pointer transform hover:scale-110 active:scale-95 transition-all duration-150 focus:outline-none"
            aria-label={`Rate ${star} Stars`}
          >
            <Star 
              className="w-11 h-11 transition-colors duration-150"
              fill={hoverStars !== null && star <= hoverStars ? '#eab308' : 'none'}
              color={hoverStars !== null && star <= hoverStars ? '#eab308' : '#cbd5e1'}
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>
    </div>
  );
});
StarRating.displayName = 'StarRating';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी' },
  { code: 'mr', name: 'मराठी' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'kn', name: 'ಕನ್ನಡ' }
];

export default function ReviewFunnel({ business, currentLocale }: ReviewFunnelProps) {
  const t = useTranslations();

  // State variables
  const [stars, setStars] = useState<number | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Rating, 2: Form, 3: Thank you

  // Form states
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [customText, setCustomText] = useState('');
  const [suggestionUsed, setSuggestionUsed] = useState<string>('');

  // Private feedback states
  const [privateFeedback, setPrivateFeedback] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);

  // Set page brand styling dynamically
  const brandColor = business.brand_color || '#000000';

  // 1. Asynchronously log scan on mount (fire and forget)
  useEffect(() => {
    // Get query params if we want to detect NFC scan source
    let source = 'qr';
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('source') === 'nfc') {
        source = 'nfc';
      }
    }

    fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessId: business.id,
        scanSource: source,
        locationId: (business as any).location_id || null
      })
    }).catch((err) => console.error('Failed to log scan:', err));
  }, [business.id]);

  // 2. Fetch AI Suggestions on Happy Path selection
  const fetchSuggestions = async (selectedStars: number) => {
    setLoadingSuggestions(true);
    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stars: selectedStars,
          category: business.category,
          business_name: business.name,
          language: currentLocale,
          business_id: business.id
        })
      });
      const data = await response.json();
      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      // fallback suggestions
      setSuggestions([
        "Great experience overall, would definitely recommend.",
        "The staff were helpful and the service was prompt.",
        "Good value for money, will be coming back."
      ]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleStarClick = (rating: number) => {
    setStars(rating);
    if (rating >= 4) {
      fetchSuggestions(rating);
    }
    setStep(2);
  };

  const handleLanguageChange = (newLocale: string) => {
    const segments = window.location.pathname.split('/');
    // Check if pathname contains a locale prefix
    const hasLocale = languages.some(l => l.code === segments[1]);
    if (hasLocale) {
      segments[1] = newLocale;
    } else {
      segments.unshift(newLocale);
    }
    window.location.pathname = segments.join('/');
  };

  const handleSuggestionClick = (chip: string) => {
    setSuggestionUsed(chip);
    setCustomText(chip);
  };

  // Submit happy path (4-5 stars)
  const submitHappyPath = async (isSkip = false) => {
    setIsSubmitting(true);
    const finalReviewText = isSkip ? '' : customText;

    try {
      // Save review to DB in background
      fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          stars,
          isPublic: true,
          aiSuggestionUsed: isSkip ? '' : suggestionUsed,
          customText: finalReviewText,
          languageUsed: currentLocale,
          locationId: (business as any).location_id || null
        })
      }).catch((err) => console.error('Error saving review in background:', err));

      if (!isSkip && finalReviewText) {
        // Copy the review text to the clipboard
        try {
          await navigator.clipboard.writeText(finalReviewText);
        } catch (copyErr) {
          console.error('Clipboard copy failed:', copyErr);
        }

        // Show the beautiful instructions modal
        setShowCopyModal(true);
        setIsSubmitting(false);

        // Wait 1 second (1000ms), then redirect directly to the Google Review page in the same window
        setTimeout(() => {
          window.location.href = business.google_review_url;
        }, 500);

        return;
      }

      // If skipping or no text, redirect to Google Review directly in the same tab
      window.location.href = business.google_review_url;
    } catch (err) {
      console.error('Error submitting happy review:', err);
      window.location.href = business.google_review_url;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit private path (1-3 stars)
  const submitPrivatePath = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!privateFeedback || privateFeedback.trim().length === 0) {
      setFormError(t('review_page.feedback_placeholder'));
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      // 1. Save to reviews table
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          stars,
          isPublic: false,
          privateFeedback,
          customerName,
          customerPhone,
          languageUsed: currentLocale,
          locationId: (business as any).location_id || null
        })
      });

      const savedReview = await res.json();

      // 2. Trigger notification
      if (savedReview && savedReview.id) {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessId: business.id,
            reviewId: savedReview.id
          })
        });
      }

      window.location.href = `/${currentLocale}/r/${business.slug}/thankyou?stars=${stars}`;
    } catch (err) {
      console.error('Error saving private feedback:', err);
      window.location.href = `/${currentLocale}/r/${business.slug}/thankyou?stars=${stars}`;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div
        className="w-full max-w-[420px] rounded-3xl bg-white shadow-xl border border-slate-100 overflow-hidden flex flex-col transition-all duration-300"
        style={{ '--brand': brandColor } as React.CSSProperties}
      >
        {/* Header bar with Language Toggle */}
        <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-1.5 select-none">
            <img src="/icon.png" alt="ReviewPe Icon" className="w-6 h-6 object-contain rounded-md" />
            <span className="font-extrabold text-slate-800 tracking-tight text-sm">Review<span className="text-emerald-600">Pe</span></span>
          </div>
          {/* Language selector toggle */}
          {business.plan !== 'free' && (
            <div className="relative group">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-sm font-medium text-slate-600 hover:border-slate-300 transition-colors shadow-sm">
                <span>{languages.find(l => l.code === currentLocale)?.name || 'Language'}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <div className="absolute right-0 mt-1.5 w-32 rounded-xl bg-white shadow-lg border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-1">
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${currentLocale === lang.code ? 'font-bold text-[var(--brand)]' : 'text-slate-600'}`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Panel Content */}
        <div className="p-6 flex-1 flex flex-col items-center">
          {/* Business Branding */}
          <div className="mb-6 flex flex-col items-center text-center">
            {business.logo_url ? (
              <div className="relative w-20 h-20 rounded-full border border-slate-100 overflow-hidden shadow-md bg-white mb-3">
                <Image
                  src={business.logo_url}
                  alt={business.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-extrabold text-2xl mb-3 shadow-md"
                style={{ backgroundColor: brandColor }}
              >
                {business.name.charAt(0).toUpperCase()}
              </div>
            )}
            <h1 className="text-xl font-bold text-slate-800">{business.name}</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              {business.tagline || t('review_page.tagline_default')}
            </p>
          </div>

          {/* STEP 1: Star selection screen */}
          {step === 1 && (
            <StarRating 
              onSelectRating={handleStarClick}
              starsLabel={t('review_page.stars_label')}
            />
          )}

          {/* STEP 2A: Happy Path (4-5 Stars) */}
          {step === 2 && stars && stars >= 4 && (
            <div className="w-full flex flex-col">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="flex items-center gap-1 text-xs font-semibold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full">
                  {stars} <Star className="w-3.5 h-3.5 fill-current" />
                </span>
                <span className="text-slate-300">|</span>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-[var(--brand)] hover:underline"
                >
                  Change rating
                </button>
              </div>

              <h2 className="text-lg font-bold text-slate-800 text-center mb-4">
                {t('review_page.happy_heading')}
              </h2>

              {/* Suggestions Engine */}
              {business.plan !== 'free' && (
                <div className="mb-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--brand)] mb-2.5">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Suggestions</span>
                  </div>

                  {loadingSuggestions ? (
                    <div className="flex justify-center py-4">
                      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className={`text-left p-3 text-xs rounded-xl border transition-all duration-150 hover:bg-slate-50 ${suggestionUsed === suggestion ? 'border-[var(--brand)] bg-indigo-50/20 shadow-sm' : 'border-slate-200 text-slate-600'}`}
                        >
                          &quot;{suggestion}&quot;
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400 mt-2 italic text-center">
                    {t('review_page.suggestion_disclaimer')}
                  </p>
                </div>
              )}

              {/* Editable review text */}
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Write your review here..."
                rows={4}
                className="w-full text-base p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent transition-all mb-4 text-slate-700 bg-slate-50/50"
              />

              {/* Post button */}
              <button
                onClick={() => submitHappyPath(false)}
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl text-white font-bold shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2 transform active:translate-y-px"
                style={{ backgroundColor: brandColor }}
              >
                <span>{t('common.post_on_google')}</span>
              </button>

              {/* Skip Option */}
              <button
                onClick={() => submitHappyPath(true)}
                className="w-full text-center text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors mt-4 py-2"
              >
                {t('common.skip_to_google')}
              </button>
            </div>
          )}

          {/* STEP 2B: Private Path (1-3 Stars) */}
          {step === 2 && stars && stars <= 3 && (
            <form onSubmit={submitPrivatePath} className="w-full flex flex-col">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="flex items-center gap-1 text-xs font-semibold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full">
                  {stars} <Star className="w-3.5 h-3.5 fill-current" />
                </span>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-[var(--brand)] hover:underline"
                >
                  Change rating
                </button>
              </div>

              <h2 className="text-lg font-bold text-slate-800 text-center">
                {t('review_page.sad_heading')}
              </h2>
              <p className="text-sm text-slate-500 text-center mt-1 mb-4">
                {t('review_page.sad_subtext')}
              </p>

              <textarea
                value={privateFeedback}
                onChange={(e) => setPrivateFeedback(e.target.value)}
                placeholder={t('review_page.feedback_placeholder')}
                rows={4}
                required
                className="w-full text-base p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent transition-all mb-3 text-slate-700 bg-slate-50/50"
              />

              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={t('review_page.name_label')}
                className="w-full text-base px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent transition-all mb-3 text-slate-700 bg-slate-50/50"
              />

              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder={t('review_page.phone_label')}
                className="w-full text-base px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent transition-all mb-4 text-slate-700 bg-slate-50/50"
              />

              {formError && (
                <div className="flex items-center gap-1.5 text-red-500 text-xs font-semibold mb-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !privateFeedback.trim()}
                className="w-full h-12 rounded-xl text-white font-bold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 flex items-center justify-center gap-2 transform active:translate-y-px"
                style={{ backgroundColor: brandColor }}
              >
                <span>{t('review_page.feedback_submit')}</span>
              </button>

              {/* MANDATORY LEGAL COMPLIANCE LINK - MUST NEVER BE REMOVED OR HIDDEN */}
              <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                <a
                  href={business.google_review_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-slate-500 hover:text-[var(--brand)] hover:underline inline-flex items-center gap-1 transition-all"
                >
                  <span>{t('review_page.google_link_text')}</span>
                  <span className="text-slate-400">→</span>
                </a>
              </div>
            </form>
          )}

          {/* STEP 3: Thank You Screen */}
          {step === 3 && (
            <div className="w-full py-6 flex flex-col items-center text-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4 animate-bounce" />
              <h2 className="text-xl font-bold text-slate-800">
                Thank You!
              </h2>
              <p className="text-sm text-slate-500 mt-2 max-w-[300px]">
                {stars && stars >= 4
                  ? t('review_page.thankyou_happy').replace('[Business Name]', business.name)
                  : t('review_page.thankyou_sad').replace('[Business Name]', business.name)
                }
              </p>
            </div>
          )}
        </div>

        {/* Footer Powered By */}
        {!(business.plan === 'growth' && business.hide_branding) && (
          <div className="py-3 bg-slate-50 border-t border-slate-100 text-center">
            <span className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase">
              Powered by ReviewPe
            </span>
          </div>
        )}
      </div>

      {/* Copy to Clipboard Instructions Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-[4px] flex items-center justify-center p-4 z-[9999] animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-[360px] shadow-2xl border border-slate-100 flex flex-col items-center text-center transform scale-100 transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-7 h-7 animate-bounce" />
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Review Copied!
            </h3>

            <p className="text-sm text-slate-500 mb-4 leading-relaxed">
              Redirecting you to Google... Simply **paste** your copied review into the Google review box.
            </p>

            {/* Preview Box */}
            <div className="w-full bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs text-slate-600 text-left mb-2 max-h-[100px] overflow-y-auto italic font-medium leading-relaxed">
              &quot;{customText}&quot;
            </div>
          </div>
        </div>
      )}
    </>
  );
}
