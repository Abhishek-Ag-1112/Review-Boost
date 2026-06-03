import { createClient, isMockMode, createAdminClient } from './supabase';

function getSupabaseClient() {
  if (typeof window === 'undefined') {
    return createAdminClient();
  }
  return createClient();
}

let clientDashboardDataCache: any = null;
let clientDashboardDataPromise: Promise<any> | null = null;

async function fetchClientDashboardData() {
  if (typeof window === 'undefined') return null;
  if (clientDashboardDataCache) return clientDashboardDataCache;
  if (clientDashboardDataPromise) return clientDashboardDataPromise;

  clientDashboardDataPromise = fetch('/api/dashboard/data')
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      return res.json();
    })
    .then(data => {
      clientDashboardDataCache = data;
      clientDashboardDataPromise = null;
      return data;
    })
    .catch(err => {
      console.error(err);
      clientDashboardDataPromise = null;
      return null;
    });

  return clientDashboardDataPromise;
}

let clientBusinessCache: any = null;
let clientBusinessPromise: Promise<any> | null = null;

// Call this to force a fresh fetch on next getFirstBusinessForOwner call
export function invalidateBusinessCache() {
  clientBusinessCache = null;
  clientBusinessPromise = null;
  clientDashboardDataCache = null;
  clientDashboardDataPromise = null;
}

async function fetchClientBusiness() {
  if (typeof window === 'undefined') return null;
  if (clientBusinessCache) return clientBusinessCache;
  if (clientBusinessPromise) return clientBusinessPromise;

  clientBusinessPromise = fetch('/api/business/mine')
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch user business');
      return res.json();
    })
    .then(data => {
      // Only cache if we got real data (not null)
      if (data && data.id) {
        clientBusinessCache = data;
      }
      clientBusinessPromise = null;
      return data;
    })
    .catch(err => {
      console.error(err);
      clientBusinessPromise = null;
      return null;
    });

  return clientBusinessPromise;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  google_place_id: string;
  google_review_url: string;
  logo_url: string | null;
  brand_color: string;
  tagline: string;
  category: 'restaurant' | 'retail' | 'salon' | 'clinic' | 'hotel' | 'other';
  language: string;
  plan: 'free' | 'starter' | 'growth';
  trial_started_at: string;
  trial_ended: boolean;
  whatsapp_number: string | null;
  notification_email: string | null;
  nfc_enabled: boolean;
  api_key?: string | null;
  payment_due_date?: string | null;
  payment_amount?: number | null;
  payment_status?: 'paid' | 'unpaid' | 'due_soon';
  is_active: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  business_id: string;
  stars: number;
  is_public: boolean;
  private_feedback?: string;
  customer_name?: string;
  customer_phone?: string;
  ai_suggestion_used?: string;
  custom_text?: string;
  language_used?: string;
  is_resolved: boolean;
  owner_note?: string;
  created_at: string;
}

// In-memory mock store for local demo/testing
const mockBusinesses: Record<string, Business> = {
  'chai-point-jaipur-a3f2': {
    id: 'b1111111-1111-1111-1111-111111111111',
    owner_id: 'u0000000-0000-0000-0000-000000000000',
    name: 'Chai Point Jaipur',
    slug: 'chai-point-jaipur-a3f2',
    google_place_id: 'ChIJ-x9F2u2zZTkR082K2x2W3lE',
    google_review_url: 'https://search.google.com/local/writereview?placeid=ChIJ-x9F2u2zZTkR082K2x2W3lE',
    logo_url: 'https://images.unsplash.com/photo-1593967858208-67ddb5b4cfee?w=128&h=128&fit=crop',
    brand_color: '#059669', // Emerald Green
    tagline: 'How was your experience today?',
    category: 'restaurant',
    language: 'en',
    plan: 'growth',
    trial_started_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    trial_ended: false,
    whatsapp_number: '+919876543210',
    notification_email: 'jaipur@chaipoint.com',
    nfc_enabled: true,
    payment_due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Due in 5 days
    payment_amount: 799,
    payment_status: 'due_soon',
    is_active: true,
    created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
  },
  'tress-lounge-pune-8f2a': {
    id: 'b2222222-2222-2222-2222-222222222222',
    owner_id: 'u0000000-0000-0000-0000-000000000000',
    name: 'Tress Lounge Pune',
    slug: 'tress-lounge-pune-8f2a',
    google_place_id: 'ChIJ577q_p_BwjsRn32H3t4sF2Q',
    google_review_url: 'https://search.google.com/local/writereview?placeid=ChIJ577q_p_BwjsRn32H3t4sF2Q',
    logo_url: null,
    brand_color: '#d97706', // Amber Gold
    tagline: 'Rate your styling experience!',
    category: 'salon',
    language: 'en',
    plan: 'free',
    trial_started_at: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString(), // 26 days ago (4 days left)
    trial_ended: false,
    whatsapp_number: '+919999999999',
    notification_email: 'pune@tresslounge.com',
    nfc_enabled: false,
    payment_due_date: null,
    payment_amount: 0,
    payment_status: 'paid',
    is_active: true,
    created_at: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString()
  },
  'pizza-hut-expired': {
    id: 'b3333333-3333-3333-3333-333333333333',
    owner_id: 'u0000000-0000-0000-0000-000000000000',
    name: 'Pizza Hut Express',
    slug: 'pizza-hut-expired',
    google_place_id: 'ChIJ-pizza-place-id',
    google_review_url: 'https://search.google.com/local/writereview?placeid=ChIJ-pizza-place-id',
    logo_url: null,
    brand_color: '#ef4444', // Red
    tagline: 'Rate our fresh pizza slice!',
    category: 'restaurant',
    language: 'en',
    plan: 'free',
    trial_started_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), // 35 days ago (expired)
    trial_ended: true,
    whatsapp_number: '+919999988888',
    notification_email: 'pizza@hut.com',
    nfc_enabled: false,
    payment_due_date: null,
    payment_amount: 0,
    payment_status: 'unpaid',
    is_active: false,
    created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
  }
};

// Rich mockup reviews data
const mockReviews: Review[] = [
  {
    id: 'rev-1',
    business_id: 'b1111111-1111-1111-1111-111111111111',
    stars: 5,
    is_public: true,
    custom_text: 'Absolutely delicious masala chai and bun maska! The service is lightning fast and the staff is extremely polite. Highly recommended!',
    ai_suggestion_used: 'The staff were helpful and the service was prompt.',
    language_used: 'en',
    is_resolved: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  },
  {
    id: 'rev-2',
    business_id: 'b1111111-1111-1111-1111-111111111111',
    stars: 2,
    is_public: false,
    private_feedback: 'The tea was slightly cold, and the billing counter queue was too long. Took 15 minutes just to get a single kulhad chai.',
    customer_name: 'Rahul Sharma',
    customer_phone: '+919876543210',
    language_used: 'en',
    is_resolved: false,
    owner_note: '',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  },
  {
    id: 'rev-3',
    business_id: 'b1111111-1111-1111-1111-111111111111',
    stars: 4,
    is_public: true,
    custom_text: 'बहुत ही बढ़िया चाय और समोसे! माहौल बहुत अच्छा था, शाम को बैठने के लिए बेहतरीन जगह है।',
    ai_suggestion_used: 'कुल मिलाकर बहुत अच्छा अनुभव रहा, मैं निश्चित रूप से इसकी सिफारिश करूँगा।',
    language_used: 'hi',
    is_resolved: false,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
  },
  {
    id: 'rev-4',
    business_id: 'b1111111-1111-1111-1111-111111111111',
    stars: 1,
    is_public: false,
    private_feedback: 'Extremely rude manager at the counter. Refused to accept UPI payment and was very dismissive when I asked for a bill.',
    customer_name: 'Priyanka Patel',
    customer_phone: '+919988776655',
    language_used: 'en',
    is_resolved: true,
    owner_note: 'Called customer, offered free voucher, manager has been warned.',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
  },
  {
    id: 'rev-5',
    business_id: 'b1111111-1111-1111-1111-111111111111',
    stars: 5,
    is_public: true,
    custom_text: 'Clean place, awesome filter coffee and quick service. Best value in the area!',
    ai_suggestion_used: 'Good value for money, will be coming back.',
    language_used: 'en',
    is_resolved: false,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
  },
  {
    id: 'rev-6',
    business_id: 'b1111111-1111-1111-1111-111111111111',
    stars: 3,
    is_public: false,
    private_feedback: 'The seating was uncomfortable and the music was too loud. Hard to have a conversation.',
    customer_name: 'Amit Deshmukh',
    customer_phone: '',
    language_used: 'en',
    is_resolved: false,
    owner_note: 'Looking into sound absorption padding for tables.',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
  }
];

// Seeded mock scans history for charts
const mockScans: { scanned_at: string; scan_source: string }[] = [];

// Populate 30 days of scan history
const seedMockScans = () => {
  const sources = ['qr', 'qr', 'nfc', 'link', 'whatsapp'];
  const now = new Date();
  for (let i = 0; i < 180; i++) {
    const date = new Date();
    date.setDate(now.getDate() - Math.floor(Math.random() * 30));
    date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
    
    mockScans.push({
      scanned_at: date.toISOString(),
      scan_source: sources[Math.floor(Math.random() * sources.length)]
    });
  }
};
seedMockScans();

export async function getBusinessBySlug(slug: string): Promise<Business | null> {
  if (isMockMode) {
    if (!mockBusinesses[slug]) {
      mockBusinesses[slug] = {
        id: `b1111111-1111-1111-1111-111111111111`, // keep it matched for mock data
        owner_id: 'mock-owner',
        name: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        slug: slug,
        google_place_id: 'ChIJ-mock-place-id',
        google_review_url: 'https://search.google.com/local/writereview?placeid=ChIJ-mock-place-id',
        logo_url: null,
        brand_color: '#059669', // Emerald
        tagline: 'We value your honest feedback!',
        category: 'restaurant',
        language: 'en',
        plan: slug.includes('starter') ? 'starter' : 'growth',
        trial_started_at: new Date().toISOString(),
        trial_ended: false,
        whatsapp_number: '+919876543210',
        notification_email: 'owner@example.com',
        nfc_enabled: true,
        is_active: !slug.includes('inactive'),
        created_at: new Date().toISOString()
      };
    }
    return mockBusinesses[slug];
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching business by slug:', error);
    return null;
  }
  return data as Business;
}

export async function getFirstBusinessForOwner(ownerId: string): Promise<Business | null> {
  if (typeof window !== 'undefined') {
    return fetchClientBusiness();
  }

  if (isMockMode) {
    // Return first business or build a default
    const keys = Object.keys(mockBusinesses);
    if (keys.length > 0) return mockBusinesses[keys[0]];
    return getBusinessBySlug('chai-point-jaipur-a3f2');
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', ownerId)
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching owner business:', error);
    return null;
  }
  return data as Business;
}

export async function logScan(businessId: string, scanSource: 'qr' | 'nfc' | 'link' | 'whatsapp', userAgent?: string, referrer?: string): Promise<boolean> {
  if (isMockMode) {
    mockScans.push({
      scanned_at: new Date().toISOString(),
      scan_source: scanSource
    });
    return true;
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('qr_scans')
    .insert({
      business_id: businessId,
      scan_source: scanSource,
      user_agent: userAgent || null,
      referrer: referrer || null
    });

  if (error) {
    console.error('Error logging scan:', error);
    return false;
  }
  return true;
}

export async function getScansCountThisMonth(businessId: string): Promise<number> {
  if (isMockMode) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    return mockScans.filter(s => new Date(s.scanned_at) >= startOfMonth).length;
  }

  const supabase = getSupabaseClient();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from('qr_scans')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .gte('scanned_at', startOfMonth.toISOString());

  if (error) {
    console.error('Error counting monthly scans:', error);
    return 0;
  }
  return count || 0;
}

export async function createReview(reviewData: Partial<Review>): Promise<Review | null> {
  const newReview: Review = {
    id: reviewData.id || `rev-${Math.random().toString(36).substring(2, 11)}`,
    business_id: reviewData.business_id || '',
    stars: reviewData.stars || 5,
    is_public: reviewData.is_public || false,
    private_feedback: reviewData.private_feedback,
    customer_name: reviewData.customer_name,
    customer_phone: reviewData.customer_phone,
    ai_suggestion_used: reviewData.ai_suggestion_used,
    custom_text: reviewData.custom_text,
    language_used: reviewData.language_used || 'en',
    is_resolved: false,
    created_at: new Date().toISOString()
  };

  if (isMockMode) {
    mockReviews.unshift(newReview);
    return newReview;
  }

  const insertPayload = { ...newReview };
  delete (insertPayload as any).id;

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('reviews')
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    console.error('Error saving review:', error);
    return null;
  }
  return data as Review;
}

export async function createBusiness(businessData: Partial<Business>): Promise<Business | null> {
  const id = businessData.id || `bus-${Math.random().toString(36).substring(2, 11)}`;
  const slug = businessData.slug || '';
  
  const newBusiness: Business = {
    id,
    owner_id: businessData.owner_id || 'u0000000-0000-0000-0000-000000000000',
    name: businessData.name || '',
    slug,
    google_place_id: businessData.google_place_id || '',
    google_review_url: businessData.google_review_url || '',
    logo_url: businessData.logo_url || null,
    brand_color: businessData.brand_color || '#000000',
    tagline: businessData.tagline || 'How was your experience today?',
    category: businessData.category || 'other',
    language: businessData.language || 'en',
    plan: businessData.plan || 'free',
    trial_started_at: businessData.trial_started_at || new Date().toISOString(),
    trial_ended: businessData.trial_ended !== undefined ? businessData.trial_ended : false,
    whatsapp_number: businessData.whatsapp_number || null,
    notification_email: businessData.notification_email || null,
    nfc_enabled: false,
    is_active: true,
    created_at: new Date().toISOString()
  };

  if (isMockMode) {
    mockBusinesses[slug] = newBusiness;
    return newBusiness;
  }

  const insertPayload = { ...newBusiness };
  delete (insertPayload as any).id;
  delete (insertPayload as any).nfc_enabled;

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('businesses')
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    console.error('Error saving business:', error);
    return null;
  }
  return data as Business;
}

// Phase 2: Summary metrics getter
export async function getDashboardSummary(businessId: string) {
  if (isMockMode) {
    const totalScans = mockScans.length;
    const totalReviews = mockReviews.length;
    
    let sum = 0;
    mockReviews.forEach(r => sum += r.stars);
    const averageStars = totalReviews > 0 ? parseFloat((sum / totalReviews).toFixed(1)) : 0.0;
    
    const publicCount = mockReviews.filter(r => r.is_public).length;
    const redirectRate = totalReviews > 0 ? Math.round((publicCount / totalReviews) * 100) : 0;
    
    const unresolvedFeedbackCount = mockReviews.filter(r => !r.is_public && !r.is_resolved).length;
    
    return {
      totalScans,
      totalReviews,
      averageStars,
      redirectRate,
      unresolvedFeedbackCount
    };
  }

  if (typeof window !== 'undefined') {
    const data = await fetchClientDashboardData();
    return data ? data.summary : { totalScans: 0, totalReviews: 0, averageStars: 0.0, redirectRate: 0, unresolvedFeedbackCount: 0 };
  }

  const supabase = getSupabaseClient();
  
  // Total scans
  const { count: scansCount } = await supabase.from('qr_scans').select('*', { count: 'exact', head: true }).eq('business_id', businessId);
  // Reviews counts & average
  const { data: reviewsData } = await supabase.from('reviews').select('stars, is_public, is_resolved').eq('business_id', businessId);
  
  const totalScans = scansCount || 0;
  const totalReviews = reviewsData?.length || 0;
  let starsSum = 0;
  let publicCount = 0;
  let unresolvedCount = 0;

  reviewsData?.forEach(r => {
    starsSum += r.stars;
    if (r.is_public) publicCount++;
    if (!r.is_public && !r.is_resolved) unresolvedCount++;
  });

  const averageStars = totalReviews > 0 ? parseFloat((starsSum / totalReviews).toFixed(1)) : 0.0;
  const redirectRate = totalReviews > 0 ? Math.round((publicCount / totalReviews) * 100) : 0;

  return {
    totalScans,
    totalReviews,
    averageStars,
    redirectRate,
    unresolvedFeedbackCount: unresolvedCount
  };
}

// Phase 2: Inbox reviews retrieval
export async function getReviewsInbox(
  businessId: string,
  options: {
    search?: string;
    stars?: number;
    isPublic?: boolean;
    isResolved?: boolean;
    sort?: 'newest' | 'oldest' | 'stars_desc' | 'stars_asc';
  }
) {
  const { search, stars, isPublic, isResolved, sort = 'newest' } = options;

  if (isMockMode) {
    let filtered = [...mockReviews];

    // Filter by type
    if (isPublic !== undefined) {
      filtered = filtered.filter(r => r.is_public === isPublic);
    }
    
    // Filter by resolution status for private feedback
    if (isResolved !== undefined && isPublic === false) {
      filtered = filtered.filter(r => r.is_resolved === isResolved);
    }

    // Filter by rating
    if (stars !== undefined) {
      filtered = filtered.filter(r => r.stars === stars);
    }

    // Filter by search string
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(r => 
        (r.custom_text && r.custom_text.toLowerCase().includes(q)) ||
        (r.private_feedback && r.private_feedback.toLowerCase().includes(q)) ||
        (r.customer_name && r.customer_name.toLowerCase().includes(q)) ||
        (r.customer_phone && r.customer_phone.includes(q))
      );
    }

    // Sort
    if (sort === 'newest') {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sort === 'oldest') {
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sort === 'stars_desc') {
      filtered.sort((a, b) => b.stars - a.stars);
    } else if (sort === 'stars_asc') {
      filtered.sort((a, b) => a.stars - b.stars);
    }

    return filtered;
  }

  if (typeof window !== 'undefined') {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (stars !== undefined) params.append('stars', stars.toString());
    if (isPublic !== undefined) params.append('isPublic', isPublic.toString());
    if (isResolved !== undefined) params.append('isResolved', isResolved.toString());
    if (sort) params.append('sort', sort);

    const res = await fetch(`/api/dashboard/reviews?${params.toString()}`);
    if (!res.ok) return [];
    return res.json();
  }

  const supabase = getSupabaseClient();
  let query = supabase.from('reviews').select('*').eq('business_id', businessId);

  if (isPublic !== undefined) {
    query = query.eq('is_public', isPublic);
  }
  if (isResolved !== undefined && isPublic === false) {
    query = query.eq('is_resolved', isResolved);
  }
  if (stars !== undefined) {
    query = query.eq('stars', stars);
  }
  if (search) {
    query = query.or(`custom_text.ilike.%${search}%,private_feedback.ilike.%${search}%,customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%`);
  }

  // Sort logic
  if (sort === 'newest') query = query.order('created_at', { ascending: false });
  else if (sort === 'oldest') query = query.order('created_at', { ascending: true });
  else if (sort === 'stars_desc') query = query.order('stars', { ascending: false });
  else if (sort === 'stars_asc') query = query.order('stars', { ascending: true });

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching inbox reviews:', error);
    return [];
  }
  return data as Review[];
}

// Phase 2: Action to resolve private reviews
export async function resolvePrivateFeedback(reviewId: string, isResolved: boolean, ownerNote?: string) {
  if (isMockMode) {
    const idx = mockReviews.findIndex(r => r.id === reviewId);
    if (idx !== -1) {
      mockReviews[idx].is_resolved = isResolved;
      if (ownerNote !== undefined) {
        mockReviews[idx].owner_note = ownerNote;
      }
      return mockReviews[idx];
    }
    return null;
  }

  const supabase = getSupabaseClient();
  const updatePayload: any = { is_resolved: isResolved };
  if (ownerNote !== undefined) {
    updatePayload.owner_note = ownerNote;
  }

  const { data, error } = await supabase
    .from('reviews')
    .update(updatePayload)
    .eq('id', reviewId)
    .select()
    .single();

  if (error) {
    console.error('Error resolving review:', error);
    return null;
  }
  return data as Review;
}

// Phase 2: Update settings profiles
export async function updateBusinessSettings(businessId: string, data: Partial<Business>) {
  if (isMockMode) {
    const slug = Object.keys(mockBusinesses).find(k => mockBusinesses[k].id === businessId);
    if (slug) {
      mockBusinesses[slug] = {
        ...mockBusinesses[slug],
        ...data
      };
      return mockBusinesses[slug];
    }
    return null;
  }

  const updatePayload = { ...data };
  delete (updatePayload as any).id;
  delete (updatePayload as any).nfc_enabled;

  const supabase = getSupabaseClient();
  const { data: updated, error } = await supabase
    .from('businesses')
    .update(updatePayload)
    .eq('id', businessId)
    .select()
    .single();

  if (error) {
    console.error('Error updating business settings:', error);
    return null;
  }
  return updated as Business;
}

// Phase 2: Analytics daily scans
export async function getAnalyticsDailyScans(businessId: string, days = 30) {
  const datesMap: Record<string, number> = {};
  const now = new Date();
  
  // Pre-fill days with 0
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    datesMap[dateStr] = 0;
  }

  if (isMockMode) {
    mockScans.forEach(s => {
      const dateStr = s.scanned_at.split('T')[0];
      if (datesMap[dateStr] !== undefined) {
        datesMap[dateStr]++;
      }
    });
  } else {
    if (typeof window !== 'undefined') {
      const data = await fetchClientDashboardData();
      return data ? data.dailyScans : [];
    }

    const supabase = getSupabaseClient();
    const startDate = new Date();
    startDate.setDate(now.getDate() - days);
    
    const { data } = await supabase
      .from('qr_scans')
      .select('scanned_at')
      .eq('business_id', businessId)
      .gte('scanned_at', startDate.toISOString());

    data?.forEach(s => {
      const dateStr = s.scanned_at.split('T')[0];
      if (datesMap[dateStr] !== undefined) {
        datesMap[dateStr]++;
      }
    });
  }

  return Object.keys(datesMap).map(date => ({
    date,
    scans: datesMap[date]
  }));
}

// Phase 2: Star distribution counts
export async function getStarDistribution(businessId: string) {
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  if (isMockMode) {
    mockReviews.forEach(r => {
      distribution[r.stars]++;
    });
  } else {
    if (typeof window !== 'undefined') {
      const data = await fetchClientDashboardData();
      return data ? data.starBreakdown : [];
    }

    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from('reviews')
      .select('stars')
      .eq('business_id', businessId);

    data?.forEach(r => {
      if (distribution[r.stars] !== undefined) {
        distribution[r.stars]++;
      }
    });
  }

  return Object.keys(distribution).map(star => ({
    stars: parseInt(star, 10),
    count: distribution[parseInt(star, 10)]
  }));
}

// Phase 2: Scan source breakdown counts
export async function getScanSourceBreakdown(businessId: string) {
  const breakdown: Record<string, number> = { qr: 0, nfc: 0, link: 0, whatsapp: 0 };

  if (isMockMode) {
    mockScans.forEach(s => {
      const src = s.scan_source;
      if (breakdown[src] !== undefined) {
        breakdown[src]++;
      }
    });
  } else {
    if (typeof window !== 'undefined') {
      const data = await fetchClientDashboardData();
      return data ? data.sourceBreakdown : [];
    }

    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from('qr_scans')
      .select('scan_source')
      .eq('business_id', businessId);

    data?.forEach(s => {
      const src = s.scan_source;
      if (breakdown[src] !== undefined) {
        breakdown[src]++;
      }
    });
  }

  return Object.keys(breakdown).map(source => ({
    source,
    count: breakdown[source]
  }));
}

// Phase 2: Peak scans hourly heatmap
export async function getPeakScansHeatmap(businessId: string) {
  // Array matrix: 7 days of week (0=Sun...6=Sat) x 24 hours of day
  const heatmap = Array(7).fill(0).map(() => Array(24).fill(0));

  if (isMockMode) {
    mockScans.forEach(s => {
      const d = new Date(s.scanned_at);
      const day = d.getDay();
      const hour = d.getHours();
      heatmap[day][hour]++;
    });
  } else {
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from('qr_scans')
      .select('scanned_at')
      .eq('business_id', businessId);

    data?.forEach(s => {
      const d = new Date(s.scanned_at);
      const day = d.getDay();
      const hour = d.getHours();
      heatmap[day][hour]++;
    });
  }

  return heatmap;
}

// Phase 3: Seeded mock locations for Growth plans
const mockLocations: any[] = [
  {
    id: 'loc-1',
    business_id: 'b1111111-1111-1111-1111-111111111111',
    name: 'Branch - Vaishali Nagar',
    google_place_id: 'ChIJ-vaishali-place-id',
    google_review_url: 'https://search.google.com/local/writereview?placeid=ChIJ-vaishali-place-id',
    slug: 'chai-point-vaishali-nagar-a12b',
    is_active: true,
    scans_count: 42,
    avg_rating: 4.8,
    created_at: new Date().toISOString()
  },
  {
    id: 'loc-2',
    business_id: 'b1111111-1111-1111-1111-111111111111',
    name: 'Branch - Malviya Nagar',
    google_place_id: 'ChIJ-malviya-place-id',
    google_review_url: 'https://search.google.com/local/writereview?placeid=ChIJ-malviya-place-id',
    slug: 'chai-point-malviya-nagar-e34f',
    is_active: true,
    scans_count: 28,
    avg_rating: 4.6,
    created_at: new Date().toISOString()
  }
];

// Phase 3: Seeded mock NFC cards for Growth plans
const mockNfcCards: any[] = [
  {
    id: 'nfc-1',
    business_id: 'b1111111-1111-1111-1111-111111111111',
    location_id: 'loc-1',
    card_uid: 'NFC-FRONT-001',
    label: 'Front counter card',
    is_active: true,
    tap_count: 52,
    conversion_rate: 68,
    created_at: new Date().toISOString()
  },
  {
    id: 'nfc-2',
    business_id: 'b1111111-1111-1111-1111-111111111111',
    location_id: null,
    card_uid: 'NFC-TAB4-002',
    label: 'Table 4 tag',
    is_active: true,
    tap_count: 18,
    conversion_rate: 82,
    created_at: new Date().toISOString()
  }
];

export async function getLocations(businessId: string) {
  if (isMockMode) {
    return mockLocations.filter(l => l.business_id === businessId);
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('business_id', businessId);

  if (error) {
    console.error('Error fetching locations:', error);
    return [];
  }
  return data;
}

export async function createLocation(businessId: string, name: string, googlePlaceId: string, slug: string) {
  const newLocation = {
    id: `loc-${Math.random().toString(36).substring(2, 11)}`,
    business_id: businessId,
    name,
    google_place_id: googlePlaceId,
    google_review_url: `https://search.google.com/local/writereview?placeid=${googlePlaceId}`,
    slug,
    is_active: true,
    created_at: new Date().toISOString()
  };

  if (isMockMode) {
    mockLocations.push({ ...newLocation, scans_count: 0, avg_rating: 0 });
    return newLocation;
  }

  const insertPayload = { ...newLocation };
  delete (insertPayload as any).id;

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('locations')
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    console.error('Error creating location:', error);
    return null;
  }
  return data;
}

export async function getNfcCards(businessId: string) {
  if (isMockMode) {
    return mockNfcCards.filter(c => c.business_id === businessId);
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('nfc_cards')
    .select('*, locations(name)')
    .eq('business_id', businessId);

  if (error) {
    console.error('Error fetching NFC cards:', error);
    return [];
  }
  return data;
}

export async function createNfcCard(businessId: string, label: string, uid: string, locationId: string | null) {
  const newCard = {
    id: `nfc-${Math.random().toString(36).substring(2, 11)}`,
    business_id: businessId,
    location_id: locationId,
    card_uid: uid,
    label,
    is_active: true,
    created_at: new Date().toISOString()
  };

  if (isMockMode) {
    mockNfcCards.push({ ...newCard, tap_count: 0, conversion_rate: 0 });
    return newCard;
  }

  const insertPayload = { ...newCard };
  delete (insertPayload as any).id;

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('nfc_cards')
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    console.error('Error registering NFC card:', error);
    return null;
  }
  return data;
}

export async function getNfcCardByUid(uid: string) {
  if (isMockMode) {
    return mockNfcCards.find(c => c.card_uid === uid) || null;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('nfc_cards')
    .select('*')
    .eq('card_uid', uid)
    .single();

  if (error) {
    console.error('Error fetching NFC card by UID:', error);
    return null;
  }
  return data;
}

export async function incrementNfcTapCount(cardId: string) {
  if (isMockMode) {
    const card = mockNfcCards.find(c => c.id === cardId);
    if (card) {
      if (card.tap_count !== undefined) {
        card.tap_count++;
      } else {
        card.tap_count = 1;
      }
      return true;
    }
    return false;
  }

  const supabase = getSupabaseClient();
  const { data: card } = await supabase.from('nfc_cards').select('tap_count').eq('id', cardId).single();
  if (card) {
    await supabase.from('nfc_cards').update({ tap_count: (card.tap_count || 0) + 1 }).eq('id', cardId);
  }
  return true;
}

export async function getBusinessByApiKey(apiKey: string) {
  if (isMockMode) {
    if (apiKey.startsWith('rb_live_')) {
      const keys = Object.keys(mockBusinesses);
      if (keys.length > 0) return mockBusinesses[keys[0]];
      return getBusinessBySlug('chai-point-jaipur-a3f2');
    }
    return null;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('api_key', apiKey)
    .single();

  if (error) {
    console.error('API key verification error:', error);
    return null;
  }
  return data as Business;
}

export async function deleteLocation(locationId: string): Promise<boolean> {
  if (isMockMode) {
    const index = mockLocations.findIndex(l => l.id === locationId);
    if (index !== -1) {
      mockLocations.splice(index, 1);
      return true;
    }
    return false;
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('locations')
    .delete()
    .eq('id', locationId);

  if (error) {
    console.error('Error deleting location:', error);
    return false;
  }
  return true;
}

export async function toggleLocationActive(locationId: string, isActive: boolean): Promise<boolean> {
  if (isMockMode) {
    const loc = mockLocations.find(l => l.id === locationId);
    if (loc) {
      loc.is_active = isActive;
      return true;
    }
    return false;
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('locations')
    .update({ is_active: isActive })
    .eq('id', locationId);

  if (error) {
    console.error('Error toggling location status:', error);
    return false;
  }
  return true;
}

export async function deleteNfcCard(cardId: string): Promise<boolean> {
  if (isMockMode) {
    const index = mockNfcCards.findIndex(c => c.id === cardId);
    if (index !== -1) {
      mockNfcCards.splice(index, 1);
      return true;
    }
    return false;
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('nfc_cards')
    .delete()
    .eq('id', cardId);

  if (error) {
    console.error('Error deleting NFC card:', error);
    return false;
  }
  return true;
}

export async function toggleNfcCardActive(cardId: string, isActive: boolean): Promise<boolean> {
  if (isMockMode) {
    const card = mockNfcCards.find(c => c.id === cardId);
    if (card) {
      card.is_active = isActive;
      return true;
    }
    return false;
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('nfc_cards')
    .update({ is_active: isActive })
    .eq('id', cardId);

  if (error) {
    console.error('Error toggling NFC card status:', error);
    return false;
  }
  return true;
}

export async function resolveNfcRedirect(uid: string, userAgent?: string, referrer?: string): Promise<string | null> {
  if (isMockMode) {
    const card = mockNfcCards.find(c => c.card_uid === uid);
    if (!card || !card.is_active) return null;

    // Increment and log
    card.tap_count = (card.tap_count || 0) + 1;
    mockScans.push({
      scanned_at: new Date().toISOString(),
      scan_source: 'nfc'
    });

    const bus = Object.values(mockBusinesses).find(b => b.id === card.business_id) || mockBusinesses['chai-point-jaipur-a3f2'];
    
    if (card.location_id) {
      const loc = mockLocations.find(l => l.id === card.location_id);
      return `/${bus.language || 'en'}/r/${loc?.slug || bus.slug}?source=nfc`;
    }
    return `/${bus.language || 'en'}/r/${bus.slug}?source=nfc`;
  }

  const supabase = getSupabaseClient();
  
  // 1. Fetch card details
  const { data: card, error: cardError } = await supabase
    .from('nfc_cards')
    .select('*')
    .eq('card_uid', uid)
    .eq('is_active', true)
    .single();

  if (cardError || !card) {
    console.error('NFC card lookup error or inactive:', cardError);
    return null;
  }

  // 2. Increment tap count & log scan
  await incrementNfcTapCount(card.id).catch(err => console.error(err));
  await logScan(card.business_id, 'nfc', userAgent, referrer).catch(err => console.error(err));

  // 3. Resolve destination
  if (card.location_id) {
    const { data: loc } = await supabase
      .from('locations')
      .select('slug')
      .eq('id', card.location_id)
      .single();

    const { data: bus } = await supabase
      .from('businesses')
      .select('language')
      .eq('id', card.business_id)
      .single();

    return `/${bus?.language || 'en'}/r/${loc?.slug || 'error'}?source=nfc`;
  } else {
    const { data: bus } = await supabase
      .from('businesses')
      .select('slug, language')
      .eq('id', card.business_id)
      .single();

    return `/${bus?.language || 'en'}/r/${bus?.slug || 'error'}?source=nfc`;
  }
}

export async function getScans(businessId: string) {
  if (isMockMode) {
    return [...mockScans].sort((a, b) => new Date(b.scanned_at).getTime() - new Date(a.scanned_at).getTime());
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('qr_scans')
    .select('*')
    .eq('business_id', businessId)
    .order('scanned_at', { ascending: false });

  if (error) {
    console.error('Error fetching scans:', error);
    return [];
  }
  return data;
}

export async function getAllBusinesses(): Promise<Business[]> {
  if (isMockMode) {
    return Object.values(mockBusinesses);
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('businesses')
    .select('*');

  if (error) {
    console.error('Error fetching all businesses:', error);
    return [];
  }
  return data as Business[];
}

// ============================================================
// UPGRADE REQUESTS
// ============================================================

export interface UpgradeRequest {
  id: string;
  business_id: string;
  business_name: string;
  current_plan: string;
  requested_plan: 'starter' | 'growth';
  contact_email: string | null;
  contact_phone: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

// In-memory mock store for upgrade requests
const mockUpgradeRequests: UpgradeRequest[] = [];

export async function createUpgradeRequest(data: {
  business_id: string;
  business_name: string;
  current_plan: string;
  requested_plan: 'starter' | 'growth';
  contact_email?: string | null;
  contact_phone?: string | null;
}): Promise<UpgradeRequest | null> {
  const newRequest: UpgradeRequest = {
    id: `ur-${Math.random().toString(36).substring(2, 11)}`,
    business_id: data.business_id,
    business_name: data.business_name,
    current_plan: data.current_plan,
    requested_plan: data.requested_plan,
    contact_email: data.contact_email || null,
    contact_phone: data.contact_phone || null,
    status: 'pending',
    created_at: new Date().toISOString()
  };

  if (isMockMode) {
    mockUpgradeRequests.unshift(newRequest);
    return newRequest;
  }

  const supabase = getSupabaseClient();
  const insertPayload = { ...newRequest };
  delete (insertPayload as any).id;

  const { data: inserted, error } = await supabase
    .from('upgrade_requests')
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    console.error('Error creating upgrade request:', error);
    return null;
  }
  return inserted as UpgradeRequest;
}

export async function getAllUpgradeRequests(): Promise<UpgradeRequest[]> {
  if (isMockMode) {
    return [...mockUpgradeRequests];
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('upgrade_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching upgrade requests:', error);
    return [];
  }
  return data as UpgradeRequest[];
}

export async function updateUpgradeRequestStatus(
  id: string,
  status: 'approved' | 'rejected'
): Promise<UpgradeRequest | null> {
  if (isMockMode) {
    const idx = mockUpgradeRequests.findIndex(r => r.id === id);
    if (idx !== -1) {
      mockUpgradeRequests[idx].status = status;
      return mockUpgradeRequests[idx];
    }
    return null;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('upgrade_requests')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating upgrade request:', error);
    return null;
  }
  return data as UpgradeRequest;
}



