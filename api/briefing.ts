import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
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
    const { phase, data, results } = req.body;

    if (!phase || !data) {
      return res.status(400).json({ error: 'Phase and data are required' });
    }

    let prompt = "";

    if (phase === 'TAKEOFF') {
      const d = data;
      prompt = `FSX B737-800 Performance Briefing (Takeoff):
         Runway: ${d.runway} (Assumed 8000ft if unknown)
         Weight: ${d.weightLbs} lbs
         OAT: ${d.oatCelsius}°C | Alt: ${d.altFt} ft
         Wind: ${d.windDir}° at ${d.windSpeed} kts
         Flaps: ${d.flaps} | Condition: ${d.runwayCondition}.`;

      if (results) {
        prompt += `\nCRITICAL SPEEDS: V1: ${Math.round(results.v1 || 0)}, VR: ${Math.round(results.vr || 0)}, V2: ${Math.round(results.v2 || 0)}, N1: ${results.n1?.toFixed(1)}%.`;
      }

      prompt += `\nBrief the departure. Include standard FSX callouts like '80 knots', 'V1', 'Rotate', and 'Positive Rate' in your professional summary. Focus on the B737-800 flight characteristics.`;
    } else if (phase === 'LANDING') {
      const d = data;
      prompt = `FSX B737-800 Performance Briefing (Landing):
         Runway: ${d.runway} | Weight: ${d.landingWeightLbs} lbs
         Wind: ${d.windDir}° at ${d.windSpeed} kts
         Flaps: ${d.flaps}.`;

      if (results) {
        prompt += `\nCRITICAL SPEEDS: VREF: ${Math.round(results.vref || 0)}, VAPP: ${Math.round(results.vapp || 0)}.`;
      }

      prompt += `\nAnalyze crosswind for Runway ${d.runway}. Suggest Autobrake setting (1, 2, 3, or MAX) based on weight and speed. Mention landing distance expectations.`;
    } else if (phase === 'DESCENT') {
      const d = data;
      prompt = `FSX B737-800 Performance Briefing (Descent Planning):
         Cruise Altitude: ${d.cruiseAlt} ft
         Target Altitude: ${d.targetAlt} ft
         Ground Speed: ${d.speed} kts.`;

      if (results) {
        prompt += `\nCALCULATED DESCENT: TOD at ${results.tod}, Rate of Descent: ${results.rateOfDescent} ft/min, Distance: ${results.distance}nm.`;
      }

      prompt += `\nBrief the pilot on the descent profile. Mention looking out for the 'Top of Descent' and the target rate of descent. Professional and technical.`;
    } else {
        return res.status(400).json({ error: 'Invalid flight phase' });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional Boeing 737-800 Digital Technical Assistant for the Microsoft FSX environment. You are NOT a person and you are NOT in control of the aircraft. You provide technical briefings and performance data upon request. You MUST use the exact numbers (Speeds/TOD) provided in the prompt. Do NOT roleplay physical actions or callouts unless specifically asked for a summary. Be crisp, technical, and data-focused.",
        temperature: 0.1,
      }
    });

    return res.status(200).json({ text: response.text });
  } catch (error: any) {
    console.error("Briefing Error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
