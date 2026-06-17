import { createClient, isMockMode, createAdminClient } from './supabase';

function getSupabaseClient() {
  if (typeof window === 'undefined') {
    return createAdminClient();
  }
  return createClient();
}

let clientDashboardDataCache: any = null;
let clientDashboardDataPromiseMap: Record<string, Promise<any> | null> = {};

async function fetchClientDashboardData(locationId?: string) {
  if (typeof window === 'undefined') return null;
  const cacheKey = locationId || 'all';
  if (clientDashboardDataCache && clientDashboardDataCache._key === cacheKey) {
    return clientDashboardDataCache;
  }
  if (clientDashboardDataPromiseMap[cacheKey]) {
    return clientDashboardDataPromiseMap[cacheKey];
  }

  const url = locationId ? `/api/dashboard/data?locationId=${locationId}` : '/api/dashboard/data';
  const promise = fetch(url)
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      return res.json();
    })
    .then(data => {
      data._key = cacheKey;
      clientDashboardDataCache = data;
      clientDashboardDataPromiseMap[cacheKey] = null;
      return data;
    })
    .catch(err => {
      console.error(err);
      clientDashboardDataPromiseMap[cacheKey] = null;
      return null;
    });

  clientDashboardDataPromiseMap[cacheKey] = promise;
  return promise;
}

let clientBusinessCache: any = null;
let clientBusinessPromise: Promise<any> | null = null;

// Call this to force a fresh fetch on next getFirstBusinessForOwner call
export function invalidateBusinessCache() {
  clientBusinessCache = null;
  clientBusinessPromise = null;
  clientDashboardDataCache = null;
  clientDashboardDataPromiseMap = {};
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
  vibe?: string | null;
  theme?: string | null;
  ambiance?: string | null;
  staff_highlights?: string | null;
  specialties?: string | null;
  brand_values?: string | null;
  review_tone?: string | null;
  target_keywords?: string | null;
  avoid_phrases?: string | null;
  ai_suggestions_4_star?: string[] | null;
  ai_suggestions_5_star?: string[] | null;
  ai_suggestions_updated_at?: string | null;
  api_key?: string | null;
  payment_due_date?: string | null;
  payment_amount?: number | null;
  payment_status?: 'paid' | 'unpaid' | 'due_soon';
  is_active: boolean;
  hide_branding?: boolean;
  created_at: string;
  location_id?: string | null;
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
  location_id?: string | null;
}

// Cleaned up mock store for production deployment
const mockBusinesses: Record<string, Business> = {};
const mockReviews: Review[] = [
  {
    id: 'rev-1',
    business_id: 'b1111111-1111-1111-1111-111111111111',
    stars: 5,
    is_public: true,
    custom_text: "Perfect tea! Vaishali Nagar branch is very clean and staff is polite.",
    language_used: 'en',
    is_resolved: false,
    location_id: 'loc-1',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'rev-2',
    business_id: 'b1111111-1111-1111-1111-111111111111',
    stars: 3,
    is_public: false,
    private_feedback: "Malviya Nagar branch is crowded and waiting time is too long.",
    customer_name: "Amit Sharma",
    customer_phone: "+919876543211",
    language_used: 'en',
    is_resolved: false,
    location_id: 'loc-2',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'rev-3',
    business_id: 'b1111111-1111-1111-1111-111111111111',
    stars: 5,
    is_public: true,
    custom_text: "Excellent service and packaging. Best ginger chai in town!",
    language_used: 'en',
    is_resolved: false,
    location_id: null,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'rev-4',
    business_id: 'b1111111-1111-1111-1111-111111111111',
    stars: 1,
    is_public: false,
    private_feedback: "Rude staff at Vaishali counter, refused to take voucher.",
    customer_name: "Rahul Verma",
    customer_phone: "+919999888877",
    language_used: 'en',
    is_resolved: false,
    location_id: 'loc-1',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'rev-5',
    business_id: 'b1111111-1111-1111-1111-111111111111',
    stars: 4,
    is_public: true,
    custom_text: "Nice tea, great atmosphere at Malviya Nagar branch.",
    language_used: 'en',
    is_resolved: false,
    location_id: 'loc-2',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];
const mockScans: { scanned_at: string; scan_source: string; location_id?: string | null }[] = [];
// Self-executing setup to seed random scans over the last 30 days
(() => {
  const sources = ['qr', 'nfc', 'link', 'whatsapp'];
  const locations = ['loc-1', 'loc-2', null];
  const now = Date.now();
  for (let i = 0; i < 150; i++) {
    const randomDaysAgo = Math.random() * 30;
    const scanned_at = new Date(now - randomDaysAgo * 24 * 60 * 60 * 1000).toISOString();
    const scan_source = sources[Math.floor(Math.random() * sources.length)];
    const location_id = locations[Math.floor(Math.random() * locations.length)];
    mockScans.push({ scanned_at, scan_source, location_id });
  }
})();

export async function getBusinessBySlug(slug: string): Promise<Business | null> {
  if (isMockMode) {
    // Check if the slug is a mock location
    const mockLoc = mockLocations.find(l => l.slug === slug);
    if (mockLoc) {
      const parentBusiness = mockBusinesses['chai-point-jaipur-a3f2'] || {
        id: mockLoc.business_id,
        owner_id: 'mock-owner',
        name: 'Chai Point',
        slug: 'chai-point-jaipur-a3f2',
        google_place_id: 'ChIJ-mock-place-id',
        google_review_url: 'https://search.google.com/local/writereview?placeid=ChIJ-mock-place-id',
        logo_url: null,
        brand_color: '#059669',
        tagline: 'We value your honest feedback!',
        category: 'restaurant',
        language: 'en',
        plan: 'growth',
        trial_started_at: new Date().toISOString(),
        trial_ended: false,
        whatsapp_number: '+919876543210',
        notification_email: 'owner@example.com',
        nfc_enabled: true,
        is_active: true,
        hide_branding: false,
        created_at: new Date().toISOString()
      };

      return {
        ...parentBusiness,
        name: `${parentBusiness.name} - ${mockLoc.name.replace('Branch - ', '')}`,
        google_place_id: mockLoc.google_place_id,
        google_review_url: mockLoc.google_review_url,
        is_active: parentBusiness.is_active && mockLoc.is_active,
        slug: mockLoc.slug,
        location_id: mockLoc.id
      };
    }

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
        hide_branding: false,
        created_at: new Date().toISOString()
      };
    }
    return mockBusinesses[slug];
  }

  const supabase = getSupabaseClient();
  
  // 1. Try finding in businesses table
  const { data: businessData, error: businessError } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (businessData) {
    return businessData as Business;
  }

  // 2. If not found, try finding in locations table
  const { data: locationData, error: locationError } = await supabase
    .from('locations')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (locationData) {
    // Fetch parent business
    const { data: parentData, error: parentError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', locationData.business_id)
      .single();

    if (parentData) {
      return {
        ...parentData,
        name: `${parentData.name} - ${locationData.name}`,
        google_place_id: locationData.google_place_id,
        google_review_url: locationData.google_review_url,
        is_active: parentData.is_active && locationData.is_active,
        slug: locationData.slug,
        location_id: locationData.id
      } as Business;
    }
  }

  if (businessError || locationError) {
    console.error('Error fetching by slug:', businessError || locationError);
  }

  return null;
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

export async function logScan(businessId: string, scanSource: 'qr' | 'nfc' | 'link' | 'whatsapp', userAgent?: string, referrer?: string, locationId?: string): Promise<boolean> {
  if (isMockMode) {
    mockScans.push({
      scanned_at: new Date().toISOString(),
      scan_source: scanSource,
      location_id: locationId || null
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
      referrer: referrer || null,
      location_id: locationId || null
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
    created_at: new Date().toISOString(),
    location_id: reviewData.location_id || null
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
export async function getDashboardSummary(businessId: string, locationId?: string) {
  if (isMockMode) {
    let filteredReviews = mockReviews;
    let filteredScans = mockScans;
    if (locationId) {
      if (locationId === 'main') {
        filteredReviews = mockReviews.filter(r => !r.location_id);
        filteredScans = mockScans.filter(s => !s.location_id);
      } else {
        filteredReviews = mockReviews.filter(r => r.location_id === locationId);
        filteredScans = mockScans.filter(s => s.location_id === locationId);
      }
    }
    const totalScans = filteredScans.length;
    const totalReviews = filteredReviews.length;
    
    let sum = 0;
    filteredReviews.forEach(r => sum += r.stars);
    const averageStars = totalReviews > 0 ? parseFloat((sum / totalReviews).toFixed(1)) : 0.0;
    
    const publicCount = filteredReviews.filter(r => r.is_public).length;
    const redirectRate = totalReviews > 0 ? Math.round((publicCount / totalReviews) * 100) : 0;
    
    const unresolvedFeedbackCount = filteredReviews.filter(r => !r.is_public && !r.is_resolved).length;
    
    return {
      totalScans,
      totalReviews,
      averageStars,
      redirectRate,
      unresolvedFeedbackCount
    };
  }

  if (typeof window !== 'undefined') {
    const data = await fetchClientDashboardData(locationId);
    return data ? data.summary : { totalScans: 0, totalReviews: 0, averageStars: 0.0, redirectRate: 0, unresolvedFeedbackCount: 0 };
  }

  const supabase = getSupabaseClient();
  
  // Total scans
  let scansQuery = supabase.from('qr_scans').select('*', { count: 'exact', head: true }).eq('business_id', businessId);
  if (locationId) {
    if (locationId === 'main') {
      scansQuery = scansQuery.is('location_id', null);
    } else {
      scansQuery = scansQuery.eq('location_id', locationId);
    }
  }
  const { count: scansCount } = await scansQuery;
  
  // Reviews counts & average
  let reviewsQuery = supabase.from('reviews').select('stars, is_public, is_resolved').eq('business_id', businessId);
  if (locationId) {
    if (locationId === 'main') {
      reviewsQuery = reviewsQuery.is('location_id', null);
    } else {
      reviewsQuery = reviewsQuery.eq('location_id', locationId);
    }
  }
  const { data: reviewsData } = await reviewsQuery;
  
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
    locationId?: string;
  }
) {
  const { search, stars, isPublic, isResolved, sort = 'newest', locationId } = options;

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

    // Filter by location
    if (locationId) {
      if (locationId === 'main') {
        filtered = filtered.filter(r => !r.location_id);
      } else {
        filtered = filtered.filter(r => r.location_id === locationId);
      }
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
    if (locationId) params.append('locationId', locationId);

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
  if (locationId) {
    if (locationId === 'main') {
      query = query.is('location_id', null);
    } else {
      query = query.eq('location_id', locationId);
    }
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
export async function getAnalyticsDailyScans(businessId: string, days = 30, locationId?: string) {
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
    let filteredScans = mockScans;
    if (locationId) {
      if (locationId === 'main') {
        filteredScans = mockScans.filter(s => !s.location_id);
      } else {
        filteredScans = mockScans.filter(s => s.location_id === locationId);
      }
    }
    filteredScans.forEach(s => {
      const dateStr = s.scanned_at.split('T')[0];
      if (datesMap[dateStr] !== undefined) {
        datesMap[dateStr]++;
      }
    });
  } else {
    if (typeof window !== 'undefined') {
      const data = await fetchClientDashboardData(locationId);
      return data ? data.dailyScans : [];
    }

    const supabase = getSupabaseClient();
    const startDate = new Date();
    startDate.setDate(now.getDate() - days);
    
    let query = supabase
      .from('qr_scans')
      .select('scanned_at')
      .eq('business_id', businessId)
      .gte('scanned_at', startDate.toISOString());

    if (locationId) {
      if (locationId === 'main') {
        query = query.is('location_id', null);
      } else {
        query = query.eq('location_id', locationId);
      }
    }

    const { data } = await query;

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
export async function getStarDistribution(businessId: string, locationId?: string) {
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  if (isMockMode) {
    let filteredReviews = mockReviews;
    if (locationId) {
      if (locationId === 'main') {
        filteredReviews = mockReviews.filter(r => !r.location_id);
      } else {
        filteredReviews = mockReviews.filter(r => r.location_id === locationId);
      }
    }
    filteredReviews.forEach(r => {
      distribution[r.stars]++;
    });
  } else {
    if (typeof window !== 'undefined') {
      const data = await fetchClientDashboardData(locationId);
      return data ? data.starBreakdown : [];
    }

    const supabase = getSupabaseClient();
    let query = supabase
      .from('reviews')
      .select('stars')
      .eq('business_id', businessId);

    if (locationId) {
      if (locationId === 'main') {
        query = query.is('location_id', null);
      } else {
        query = query.eq('location_id', locationId);
      }
    }

    const { data } = await query;

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
export async function getScanSourceBreakdown(businessId: string, locationId?: string) {
  const breakdown: Record<string, number> = { qr: 0, nfc: 0, link: 0, whatsapp: 0 };

  if (isMockMode) {
    let filteredScans = mockScans;
    if (locationId) {
      if (locationId === 'main') {
        filteredScans = mockScans.filter(s => !s.location_id);
      } else {
        filteredScans = mockScans.filter(s => s.location_id === locationId);
      }
    }
    filteredScans.forEach(s => {
      const src = s.scan_source;
      if (breakdown[src] !== undefined) {
        breakdown[src]++;
      }
    });
  } else {
    if (typeof window !== 'undefined') {
      const data = await fetchClientDashboardData(locationId);
      return data ? data.sourceBreakdown : [];
    }

    const supabase = getSupabaseClient();
    let query = supabase
      .from('qr_scans')
      .select('scan_source')
      .eq('business_id', businessId);

    if (locationId) {
      if (locationId === 'main') {
        query = query.is('location_id', null);
      } else {
        query = query.eq('location_id', locationId);
      }
    }

    const { data } = await query;

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
export async function getPeakScansHeatmap(businessId: string, locationId?: string) {
  // Array matrix: 7 days of week (0=Sun...6=Sat) x 24 hours of day
  const heatmap = Array(7).fill(0).map(() => Array(24).fill(0));

  if (isMockMode) {
    let filteredScans = mockScans;
    if (locationId) {
      if (locationId === 'main') {
        filteredScans = mockScans.filter(s => !s.location_id);
      } else {
        filteredScans = mockScans.filter(s => s.location_id === locationId);
      }
    }
    filteredScans.forEach(s => {
      const d = new Date(s.scanned_at);
      const day = d.getDay();
      const hour = d.getHours();
      heatmap[day][hour]++;
    });
  } else {
    const supabase = getSupabaseClient();
    let query = supabase
      .from('qr_scans')
      .select('scanned_at')
      .eq('business_id', businessId);

    if (locationId) {
      query = query.eq('location_id', locationId);
    }

    const { data } = await query;

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
  requested_plan: 'free' | 'starter' | 'growth';
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
  requested_plan: 'free' | 'starter' | 'growth';
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



