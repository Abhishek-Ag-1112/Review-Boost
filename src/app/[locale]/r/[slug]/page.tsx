import { notFound } from 'next/navigation';
import { getBusinessBySlug, getScansCountThisMonth } from '@/lib/db';
import ReviewFunnel from './ReviewFunnel';

// Force dynamic rendering — never cache this page
// Suspension/trial/payment status must be checked fresh on every visit
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ReviewPageProps {
  params: {
    locale: string;
    slug: string;
  };
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { slug, locale } = params;

  // Fetch business details
  const business = await getBusinessBySlug(slug);

  if (!business) {
    notFound();
  }

  // Trial ended check
  if (business.trial_ended) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-slate-100">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-800">Business Paused</h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            This business is currently paused. Ask them to reactivate.
          </p>
        </div>
      </div>
    );
  }

  // Deactivated store safety check
  if (!business.is_active) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl border border-slate-100">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 mb-4 border border-red-100 shadow-inner">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-rose-600 tracking-tight">&ldquo;not working&rdquo;</h2>
          <p className="mt-2.5 text-sm font-semibold text-slate-500 max-w-xs mx-auto leading-relaxed">
            This business review portal is no longer active.
          </p>
        </div>
      </div>
    );
  }

  // Overdue payment suspension check
  if (business.payment_status === 'unpaid' && business.payment_due_date) {
    const dueDate = new Date(business.payment_due_date);
    const today = new Date();
    dueDate.setHours(23, 59, 59, 999);
    
    if (today > dueDate) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-slate-100">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-slate-800">Review Portal Suspended</h2>
            <p className="mt-2 text-sm text-slate-500">
              This review funnel is temporarily suspended. Please visit the store directly to share your feedback.
            </p>
          </div>
        </div>
      );
    }
  }

  // Monthly scans limit verification for Free plans
  if (business.plan === 'free') {
    const scanCount = await getScansCountThisMonth(business.id);
    if (scanCount >= 50) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-slate-100">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-slate-800">Monthly Limit Reached</h2>
            <p className="mt-2 text-sm text-slate-500">
              This business&apos;s free review link has reached its monthly limit. Please visit them directly.
            </p>
          </div>
        </div>
      );
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-8">
      <ReviewFunnel business={business} currentLocale={locale} />
    </main>
  );
}
