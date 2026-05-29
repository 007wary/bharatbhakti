const GEMINI_API_KEY = 'AIzaSyAUH5qqZrRedFvYX6fiaK_kgueMANbGeE4';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

export const generateRashifal = async (sign) => {
  try {
    const prompt = `You are a Vedic astrology expert. Give a detailed daily horoscope for ${sign} in 4-5 sentences. Cover: general energy, love, career, health. Be positive, spiritual, and grounded. Reply in English only. No intro, just the horoscope directly.`;

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
      }),
    });

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Unable to fetch rashifal. Please try again.';
  } catch (e) {
    return 'Unable to fetch rashifal. Please try again.';
  }
};