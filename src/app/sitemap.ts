import { MetadataRoute } from 'next';
import { locales } from '@/i18n';
import { createAdminClient, isMockMode } from '@/lib/supabase';

// Generate sitemap dynamically on request
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.reviewpe.online';
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // 1. Add main root URL
  sitemapEntries.push({
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
  });

  // 2. Add localized routes for Home, Pricing, FAQ, Contact, and How to Use
  for (const locale of locales) {
    // Localized Home page
    sitemapEntries.push({
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    });

    // Localized Pricing page
    sitemapEntries.push({
      url: `${baseUrl}/${locale}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });

    // Localized FAQ page
    sitemapEntries.push({
      url: `${baseUrl}/${locale}/faq`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    });

    // Localized Contact page
    sitemapEntries.push({
      url: `${baseUrl}/${locale}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    });

    // Localized How to Use page
    sitemapEntries.push({
      url: `${baseUrl}/${locale}/how-to-use`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  // 3. Add dynamic business review routes (e.g., https://reviewpe.online/en/r/business-slug)
  let businessSlugs: { slug: string; created_at?: string }[] = [];

  if (!isMockMode) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('businesses')
        .select('slug, created_at')
        .eq('is_active', true)
        .eq('trial_ended', false);

      if (error) {
        console.error('Error fetching businesses for sitemap:', error);
      } else if (data) {
        businessSlugs = data;
      }
    } catch (err) {
      console.error('Failed to query businesses database for sitemap:', err);
    }
  }

  // Append business pages for all active locales
  for (const business of businessSlugs) {
    if (!business.slug) continue;

    for (const locale of locales) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}/r/${business.slug}`,
        lastModified: business.created_at ? new Date(business.created_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }
  }

  return sitemapEntries;
}
