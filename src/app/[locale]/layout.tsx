import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Inter } from 'next/font/google';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const titles: Record<string, string> = {
    en: 'AI Suggestion for Google Map Review | ReviewPe.online',
    hi: 'ReviewPe - भारतीय व्यवसायों के लिए स्मार्ट गूगल रिव्यू फ़नल',
    mr: 'ReviewPe - भारतीय व्यवसायांसाठी स्मार्ट गुगल रिव्ह्यू फनेल',
    ta: 'ReviewPe - இந்திய வணிகங்களுக்கான ஸ்மார்ட் கூகிள் விமர்சன ஃபனல்',
    te: 'ReviewPe - భారతీయ వ్యాపారాల కోసం స్మార్ట్ గూగుల్ రివ్యూ ఫన్నెల్',
    kn: 'ReviewPe - ಭಾರತೀಯ ಉದ್ಯಮಗಳಿಗಾಗಿ ಸ್ಮಾರ್ಟ್ ಗೂಗಲ್ ವಿಮರ್ಶೆ ಫನೆಲ್'
  };

  const descriptions: Record<string, string> = {
    en: 'Boost local SEO for shops, restaurants and hotels. Simplify your Google Map ratings with one-tap AI-assisted review suggestions. Try it free.',
    hi: 'ग्राहकों को हमारी स्थानीय भाषा के AI सुझावों का उपयोग करके सेकंडों में विस्तृत Google समीक्षा लिखने के लिए सशक्त बनाएं।',
    mr: 'ग्राहकांना आमच्या स्थानिक भाषेतील AI सूचना वापरून सेकंदात सविस्तर गुगल रिव्ह्यू लिहिण्यास सक्षम करा.',
    ta: 'வாடிக்கையாளர்கள் தங்களது சொந்த மொழியில் AI பரிந்துரைகளை பயன்படுத்தி சில நொடிகளில் விரிவான கூகிள் விமர்சனம் எழுத உதவுங்கள்.',
    te: 'స్థానిక భాషా AI సూచనలను ఉపయోగించి కస్టమర్‌లు క్షణాల్లో వివరణాತ್ಮక గూగుల్ సమీక్షలను వ్రాసేలా చేయండి.',
    kn: 'ಗ್ರಾಹಕರು ತಮ್ಮ ಪ್ರಾದೇಶಿಕ ಭಾಷೆಯ AI ಸಲಹೆಗಳನ್ನು ಬಳಸಿಕೊಂಡು ಕೆಲವೇ ಸೆಕೆಂಡುಗಳಲ್ಲಿ ವಿವರವಾದ ಗೂಗಲ್ ವಿಮರ್ಶೆಗಳನ್ನು ಬರೆಯಲು ಸಹಾಯ ಮಾಡಿ.'
  };

  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    icons: {
      icon: '/icon.png',
      shortcut: '/favicon.ico',
      apple: '/icon.png',
    }
  };
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-800 antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
