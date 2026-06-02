import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

export const locales = ['en', 'hi', 'mr', 'ta', 'te', 'kn'] as const;
export type Locale = typeof locales[number];

export default getRequestConfig(async ({locale}) => {
  console.log('>>> next-intl getRequestConfig received locale:', locale);
  
  // Resolve active locale with fallback to 'en'
  const activeLocale = locale && locales.includes(locale as any) ? locale : 'en';
  console.log('>>> resolved active locale for next-intl:', activeLocale);

  return {
    locale: activeLocale,
    messages: (await import(`../messages/${activeLocale}.json`)).default
  };
});
