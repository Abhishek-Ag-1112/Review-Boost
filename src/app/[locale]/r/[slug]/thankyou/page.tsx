import { notFound } from 'next/navigation';
import { getBusinessBySlug } from '@/lib/db';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ThankYouProps {
  params: {
    locale: string;
    slug: string;
  };
  searchParams: {
    stars?: string;
  };
}

export default async function ThankYouPage({ params, searchParams }: ThankYouProps) {
  const { slug, locale } = params;
  const starsVal = parseInt(searchParams.stars || '5', 10);
  
  const business = await getBusinessBySlug(slug);
  if (!business) {
    notFound();
  }

  const t = await getTranslations('review_page');
  const isHappy = starsVal >= 4;

  // Format dynamic translations
  const message = isHappy
    ? t('thankyou_happy').replace('[Business Name]', business.name)
    : t('thankyou_sad').replace('[Business Name]', business.name);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-[420px] rounded-3xl bg-white shadow-xl border border-slate-100 p-8 flex flex-col items-center text-center">
        
        {/* Business Logo */}
        <div className="mb-6 flex flex-col items-center">
          {business.logo_url ? (
            <div className="relative w-16 h-16 rounded-full border border-slate-100 overflow-hidden shadow-sm bg-white mb-3">
              <Image 
                src={business.logo_url} 
                alt={business.name} 
                fill 
                sizes="64px"
                className="object-cover" 
                priority
              />
            </div>
          ) : (
            <div 
              className="w-14 h-14 rounded-full flex items-center justify-center text-white font-extrabold text-xl mb-3 shadow-sm"
              style={{ backgroundColor: business.brand_color }}
            >
              {business.name.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-lg font-bold text-slate-800">{business.name}</h1>
        </div>

        {/* Success Icon */}
        <div className="relative mb-4">
          <div className="absolute inset-0 bg-emerald-100 rounded-full scale-125 blur-sm opacity-50 animate-pulse" />
          <CheckCircle2 className="w-16 h-16 text-emerald-500 relative" />
        </div>

        {/* Messages */}
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Thank You!
        </h2>
        <p className="text-sm text-slate-500 font-medium mt-3 leading-relaxed max-w-[280px]">
          {message}
        </p>

        {/* Exit banner */}
        {business.plan !== 'growth' && (
          <div className="mt-8 pt-6 border-t border-slate-100 w-full">
            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
              Powered by ReviewBoost
            </span>
          </div>
        )}
      </div>
    </main>
  );
}
