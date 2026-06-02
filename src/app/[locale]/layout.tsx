import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Inter } from 'next/font/google';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const titles: Record<string, string> = {
    en: 'ReviewBoost - Smart Google Review Funnel for Indian Businesses',
    hi: 'ReviewBoost - भारतीय व्यवसायों के लिए स्मार्ट गूगल रिव्यू फ़नल',
    mr: 'ReviewBoost - भारतीय व्यवसायांसाठी स्मार्ट गुगल रिव्ह्यू फनेल',
    ta: 'ReviewBoost - இந்திய வணிகங்களுக்கான ஸ்மார்ட் கூகிள் விமர்சன ஃபனல்',
    te: 'ReviewBoost - భారతీయ వ్యాపారాల కోసం స్మార్ట్ గూగుల్ రివ్యూ ఫన్నెల్',
    kn: 'ReviewBoost - ಭಾರತೀಯ ಉದ್ಯಮಗಳಿಗಾಗಿ ಸ್ಮಾರ್ಟ್ ಗೂಗಲ್ ವಿಮರ್ಶೆ ಫನೆಲ್'
  };

  const descriptions: Record<string, string> = {
    en: 'Convert happy customers into Google reviews automatically. Capture private feedback from unhappy customers instantly. Built for India.',
    hi: 'खुश ग्राहकों को स्वचालित रूप से Google समीक्षाओं में बदलें। नाखुश ग्राहकों से तुरंत निजी प्रतिक्रिया प्राप्त करें।',
    mr: 'आनंदी ग्राहकांना स्वयंचलितपणे गुगल रिव्ह्यूमध्ये बदला. नाराज ग्राहकांकडून त्वरित खाजगी अभिप्राय मिळवा.',
    ta: 'மகிழ்ச்சியான வாடிக்கையாளர்களை தானாகவே கூகிள் விமர்சனங்களாக மாற்றவும். அதிருப்தி வாடிக்கையாளர்களிடமிருந்து உடனடியாக தனிப்பட்ட கருத்துக்களைப் பெறவும்.',
    te: 'సంతోషకరమైన కస్టమర్‌లను స్వయంచాలకంగా గూగుల్ రివ్యూలుగా మార్చండి. అసంతృప్తిగా ఉన్న కస్టమర్ల నుండి వెంటనే ప్రైవేట్ అభిప్రాయాన్ని పొందండి.',
    kn: 'ಸಂತೋಷದ ಗ್ರಾಹಕರನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಗೂಗಲ್ ವಿಮರ್ಶೆಗಳಾಗಿ ಪರಿವರ್ತಿಸಿ. ಅತೃಪ್ತ ಗ್ರಾಹಕರಿಂದ ತಕ್ಷಣವೇ ಖಾಸಗಿ ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ಪಡೆಯಿರಿ.'
  };

  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
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
