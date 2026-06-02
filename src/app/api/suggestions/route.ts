import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// 60-minute in-memory cache
interface CacheEntry {
  suggestions: string[];
  expiresAt: number;
}
const cache = new Map<string, CacheEntry>();

// Fallbacks for 6 supported languages
const fallbacks: Record<string, string[]> = {
  en: [
    "Great experience overall, would definitely recommend.",
    "The staff were helpful and the service was prompt.",
    "Good value for money, will be coming back.",
    "The atmosphere was wonderful and everything was extremely clean.",
    "Exceeded my expectations! Highly recommend this place."
  ],
  hi: [
    "कुल मिलाकर बहुत अच्छा अनुभव रहा, मैं निश्चित रूप से इसकी सिफारिश करूँगा।",
    "यहाँ के कर्मचारी बहुत मददगार थे और सर्विस भी काफी तेज़ थी।",
    "पैसे की पूरी वसूल सेवा है, यहाँ दोबारा ज़रूर आना चाहेंगे।",
    "यहाँ का माहौल बहुत बढ़िया था और सब कुछ बहुत साफ-सुथरा था।",
    "मेरी उम्मीदों से बेहतर! इस जगह को अत्यधिक अनुशंसित करता हूँ।"
  ],
  mr: [
    "एकूणच खूप चांगला अनुभव आला, मी नक्कीच शिफारस करेन.",
    "इथला कर्मचारी वर्ग खूप मदतीचा होता आणि सर्व्हिस देखील जलद होती.",
    "उत्कृष्ट सर्व्हिस आणि खिशाला परवडणारे दर, पुन्हा नक्की भेट देऊ.",
    "इथलं वातावरण खूप सुंदर होतं आणि सर्व काही अतिशय स्वच्छ होतं.",
    "माझ्या अपेक्षेपेक्षा जास्त उत्तम! या जागेची मी नक्कीच शिफारस करतो."
  ],
  ta: [
    "ஒட்டுமொத்தமாக சிறந்த அனுபவம், நிச்சயமாக பரிந்துரைக்கிறேன்.",
    "ஊழியர்கள் மிகவும் உதவியாக இருந்தனர், சேவை விரைவாக கிடைத்தது.",
    "செலவழித்த பணத்திற்கு தகுந்த தரம், மீண்டும் இங்கு வருவேன்.",
    "இங்குள்ள சூழல் மிகவும் அருமையாக இருந்தது, மிகவும் சுத்தமாக வைத்திருந்தார்கள்.",
    "எனது எதிர்பார்ப்புகளை விட சிறப்பாக இருந்தது! இந்த இடத்தை மிகவும் பரிந்துரைக்கிறேன்."
  ],
  te: [
    "మొత్తంమీద చాలా మంచి అనుభవం, ఖచ్చితంగా ఇతరులకు సిఫార్సు చేస్తాను.",
    "సిబ్బంది చాలా సహాయకారిగా ఉన్నారు, సేవ త్వరగా లభించింది.",
    "ఖర్చుకు తగిన నాణ్యత లభించింది, మళ్లీ ఇక్కడికి వస్తాను.",
    "ఇక్కడి వాతావరణం చాలా అద్భుతంగా ఉంది మరియు అంతా చాలా పరిశుభ్రంగా ఉంది.",
    "నా అంచనాలకు మించి ఉంది! ఈ ప్రదేశాన్ని నేను బాగా సిఫార్సు చేస్తున్నాను."
  ],
  kn: [
    "ಒಟ್ಟಾರೆಯಾಗಿ ಉತ್ತಮ ಅನುಭವ, ಖಂಡಿತವಾಗಿಯೂ ಶಿಫಾರಸು ಮಾಡುತ್ತೇನೆ.",
    "ಸಿಬ್ಬಂದಿ ತುಂಬಾ ಸಹಕಾರಿಯಾಗಿದ್ದರು ಮತ್ತು ಸೇವೆ ತ್ವರಿತವಾಗಿತ್ತು.",
    "ಉತ್ತಮ ಮೌಲ್ಯದ ಸೇವೆ, ಮತ್ತೊಮ್ಮೆ ಭೇಟಿ ನೀಡಲು ಇಷ್ಟಪಡುತ್ತೇನೆ.",
    "ಇಲ್ಲಿನ ಪರಿಸರ ತುಂಬಾ ಚೆನ್ನಾಗಿದೆ ಮತ್ತು ಎಲ್ಲವೂ ಅತ್ಯಂತ ಸ್ವಚ್ಛವಾಗಿತ್ತು.",
    "ನನ್ನ ನಿರೀಕ್ಷೆಗಿಂತಲೂ ಉತ್ತಮವಾಗಿತ್ತು! ಈ ಸ್ಥಳಕ್ಕೆ ಭೇಟಿ ನೀಡಲು ಹೆಚ್ಚು ಶಿಫಾರಸು ಮಾಡುತ್ತೇನೆ."
  ]
};

export async function POST(request: NextRequest) {
  try {
    const { stars, category, business_name, language } = await request.json();

    if (!stars || !category || !business_name || !language) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const cacheKey = `${stars}_${category}_${language}_${business_name.toLowerCase().trim()}`;
    const now = Date.now();

    // Check Cache
    const cached = cache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return NextResponse.json({ suggestions: cached.suggestions });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    const fallbackList = fallbacks[language] || fallbacks.en;

    // If API Key is missing, bypass Claude and return fallback suggestions immediately
    if (!apiKey || apiKey.includes('your-anthropic-api-key') || apiKey === '') {
      return NextResponse.json({ suggestions: fallbackList });
    }

    const anthropic = new Anthropic({ apiKey });

    // Request from Anthropic Claude Haiku
    const systemPrompt = "You are a helpful assistant that generates authentic customer review suggestions.";
    const userPrompt = `Generate exactly 5 short, authentic customer review suggestions for a ${category} called '${business_name}'. The customer rated it ${stars} out of 5 stars.
Write in ${language} language using native script where applicable.
Rules:
- Each suggestion must be 1-2 sentences only
- Sound natural, not corporate or fake
- Each suggestion must focus on a different aspect (e.g. quality, staff, ambiance, value, cleanliness, speed)
- Do NOT use exclamation marks more than once per suggestion
- Do NOT start all suggestions with 'I'
Respond ONLY with a valid JSON array of exactly 5 strings. No preamble, no explanation, no markdown.
Example: ["suggestion one", "suggestion two", "suggestion three", "suggestion four", "suggestion five"]`;

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 450,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    });

    let textResponse = '';
    if (response.content[0].type === 'text') {
      textResponse = response.content[0].text.trim();
    }

    // Strip out markdown code blocks if the model wrapped it
    if (textResponse.startsWith('```')) {
      textResponse = textResponse
        .replace(/^```json/, '')
        .replace(/^```/, '')
        .replace(/```$/, '')
        .trim();
    }

    let parsedSuggestions: string[];
    try {
      parsedSuggestions = JSON.parse(textResponse);
      if (!Array.isArray(parsedSuggestions) || parsedSuggestions.length !== 5) {
        throw new Error('Not an array of size 5');
      }
    } catch (e) {
      console.warn('Claude response parsing failed, returning fallback list.', textResponse);
      parsedSuggestions = fallbackList;
    }

    // Cache the response for 60 minutes
    cache.set(cacheKey, {
      suggestions: parsedSuggestions,
      expiresAt: now + 60 * 60 * 1000
    });

    return NextResponse.json({ suggestions: parsedSuggestions });
  } catch (error) {
    console.error('API Suggestions Error:', error);
    // Graceful fallback response on error
    return NextResponse.json({ 
      suggestions: fallbacks.en 
    });
  }
}
