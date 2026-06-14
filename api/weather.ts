import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  // Basic CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'API key is missing on the server.' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const { icao } = req.body;

    if (!icao || typeof icao !== 'string' || icao.length > 10) {
      return res.status(400).json({ error: 'Valid ICAO code is required' });
    }

    console.log(`[WeatherService] Fetching METAR for ${icao}...`);
    
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Find the current real-world METAR weather and airport elevation for ${icao}. 
      Return a JSON object with these keys: 
      "temp" (number, celsius), 
      "windDir" (number, degrees), 
      "windSpd" (number, knots), 
      "alt" (number, elevation in feet), 
      "qnh" (number, hPa/mb).
      Please provide ONLY the JSON object.`,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    let data = {};
    try {
      let cleanText = response.text?.trim() || '{}';
      cleanText = cleanText.replace(/```json\n?|\n?```/g, '').trim();

      const extractFirstJsonObject = (text: string): string => {
        const start = text.indexOf('{');
        if (start === -1) return '{}';
        let braceCount = 0;
        for (let i = start; i < text.length; i++) {
          if (text[i] === '{') braceCount++;
          if (text[i] === '}') braceCount--;
          if (braceCount === 0) return text.substring(start, i + 1);
        }
        return '{}';
      };

      cleanText = extractFirstJsonObject(cleanText);
      data = JSON.parse(cleanText);

    } catch (e) {
      console.error("Failed to parse weather JSON from response.text", e);
    }

    return res.status(200).json({ data, sources });
  } catch (error: any) {
    console.error("Weather Fetch Error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
