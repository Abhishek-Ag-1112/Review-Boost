import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';

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

function shuffleAndSelect<T>(array: T[], count: number): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export async function POST(request: NextRequest) {
  try {
    const { stars, category, business_name, language, business_id } = await request.json();

    if (!stars || !category || !business_name || !language) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const fallbackList = fallbacks[language] || fallbacks.en;

    // Cache lookup logic via Supabase
    let business: any = null;
    let supabase: any = null;

    if (business_id) {
      try {
        supabase = createAdminClient();
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', business_id)
          .single();
        if (data && !error) {
          business = data;

          // Check if suggestions are cached and updated today
          const cached = stars === 4 ? business.ai_suggestions_4_star : business.ai_suggestions_5_star;
          if (cached && Array.isArray(cached) && cached.length > 0 && business.ai_suggestions_updated_at) {
            const lastUpdate = new Date(business.ai_suggestions_updated_at);
            const now = new Date();
            const isSameDay = lastUpdate.getUTCFullYear() === now.getUTCFullYear() &&
                              lastUpdate.getUTCMonth() === now.getUTCMonth() &&
                              lastUpdate.getUTCDate() === now.getUTCDate();
            if (isSameDay) {
              console.log('Suggestions served from database cache for business:', business_id);
              const shuffled = shuffleAndSelect(cached, 5);
              return NextResponse.json({ suggestions: shuffled });
            }
          }
        }
      } catch (dbErr) {
        console.error('Error fetching business for cache check:', dbErr);
      }
    }

    // Prepare Groq call
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      console.warn('GROQ_API_KEY is missing from environment variables. Serving language fallbacks.');
      return NextResponse.json({ suggestions: fallbackList });
    }
    
    // Construct personalization parameters if present
    let personalization = '';
    let rules = `Rules:
- Each suggestion must be 1-2 sentences only
- Sound natural, not corporate or fake
- Each suggestion must focus on a different aspect (e.g. quality, staff, ambiance, value, cleanliness, speed)
- Do NOT use exclamation marks more than once per suggestion
- Do NOT start all suggestions with 'I'`;

    if (business) {
      if (business.vibe) personalization += `Vibe: ${business.vibe}. `;
      if (business.theme) personalization += `Theme: ${business.theme}. `;
      if (business.ambiance) personalization += `Ambiance: ${business.ambiance}. `;
      if (business.staff_highlights) personalization += `Staff/Service Highlights: ${business.staff_highlights}. `;
      if (business.specialties) personalization += `Specialties/Bestsellers: ${business.specialties}. `;
      if (business.brand_values) personalization += `Unique Brand Values: ${business.brand_values}. `;
      
      if (business.review_tone) {
        rules += `\n- The tone of the review must be strictly '${business.review_tone}'.`;
      }
      if (business.target_keywords) {
        rules += `\n- Try to naturally weave in keywords/phrases like: ${business.target_keywords}.`;
      }
      if (business.avoid_phrases) {
        rules += `\n- STRICTLY AVOID using or referring to any of the following: ${business.avoid_phrases}.`;
      }
    }

    const systemPrompt = "You are a helpful assistant that generates authentic customer review suggestions.";
    const userPrompt = `Generate exactly 15 short, authentic customer review suggestions for a ${category} called '${business_name}'. The customer rated it ${stars} out of 5 stars.
Write in ${language} language using native script where applicable.
${personalization ? `Include these specific details to make the review highly personalized and authentic: ${personalization}` : ''}
${rules}
Respond ONLY with a valid JSON array of exactly 15 strings. No preamble, no explanation, no markdown.
Example: ["suggestion 1", "suggestion 2", "suggestion 3", ..., "suggestion 15"]`;

    console.log('Generating 15 fresh suggestions with Groq for business:', business_id || business_name);

    let textResponse = '';
    const modelsToTry = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'];

    for (const model of modelsToTry) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqApiKey}`
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 1500
          })
        });

        if (response.ok) {
          const resJson = await response.json();
          textResponse = resJson.choices?.[0]?.message?.content?.trim() || '';
          if (textResponse) break;
        } else {
          console.warn(`Groq model ${model} failed with status ${response.status}:`, await response.text());
        }
      } catch (callErr) {
        console.warn(`Groq model ${model} fetch error:`, callErr);
      }
    }

    if (!textResponse) {
      throw new Error('All Groq models failed to return response');
    }

    // Strip out markdown code blocks or thought blocks if the model wrapped it
    if (textResponse.includes('<think>')) {
      textResponse = textResponse.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    }
    if (textResponse.startsWith('```')) {
      textResponse = textResponse
        .replace(/^```(?:json)?/, '')
        .replace(/```$/, '')
        .trim();
    }

    let parsedSuggestions: string[];
    try {
      parsedSuggestions = JSON.parse(textResponse);
      if (!Array.isArray(parsedSuggestions) || parsedSuggestions.length < 5) {
        throw new Error('Not an array or contains less than 5 items');
      }
    } catch (e) {
      console.warn('Groq response parsing failed, returning fallback list.', textResponse);
      parsedSuggestions = fallbackList;
    }

    // Cache the fresh suggestions in Supabase
    if (business && supabase) {
      try {
        const updatePayload: any = {
          ai_suggestions_updated_at: new Date().toISOString()
        };
        if (stars === 4) {
          updatePayload.ai_suggestions_4_star = parsedSuggestions;
        } else if (stars === 5) {
          updatePayload.ai_suggestions_5_star = parsedSuggestions;
        }

        await supabase
          .from('businesses')
          .update(updatePayload)
          .eq('id', business.id);
        console.log('Suggestions cached in database successfully.');
      } catch (cacheErr) {
        console.error('Failed to cache suggestions in DB:', cacheErr);
      }
    }

    const shuffled = shuffleAndSelect(parsedSuggestions, 5);
    return NextResponse.json({ suggestions: shuffled });
  } catch (error) {
    console.error('API Suggestions Error:', error);
    return NextResponse.json({ suggestions: fallbacks.en });
  }
}
