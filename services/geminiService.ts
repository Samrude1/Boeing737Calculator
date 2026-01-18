import { GoogleGenAI } from "@google/genai";
import { FlightPhase, TakeoffInputs, LandingInputs, DescentInputs } from '../types';

// @ts-ignore
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

/**
 * Fetches real-world METAR and airport data using Google Search grounding.
 * This ensures the data matches real-world weather tools used in FSX.
 */
export const fetchAirportWeather = async (icao: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
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
        // responseMimeType is not explicitly forbidden with googleSearch, but we handle the text output safely
        responseMimeType: "application/json",
      }
    });

    // Extract grounding chunks as required for Google Search tool usage to display URLs on the web app
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    // Attempting to parse the response text safely.
    // ROOT CAUSE: Gemini with Google Search returns multiple JSON objects concatenated (e.g., {...}{...})
    // This is invalid JSON. We need to extract ONLY the first complete object.
    let data = {};
    try {
      let cleanText = response.text?.trim() || '{}';

      // Remove markdown code blocks if present
      cleanText = cleanText.replace(/```json\n?|\n?```/g, '').trim();

      // Find the first complete JSON object by counting balanced braces
      const extractFirstJsonObject = (text: string): string => {
        const start = text.indexOf('{');
        if (start === -1) return '{}';

        let braceCount = 0;
        for (let i = start; i < text.length; i++) {
          if (text[i] === '{') braceCount++;
          if (text[i] === '}') braceCount--;
          if (braceCount === 0) {
            return text.substring(start, i + 1);
          }
        }
        return '{}';
      };

      cleanText = extractFirstJsonObject(cleanText);
      data = JSON.parse(cleanText);

    } catch (e) {
      console.error("Failed to parse weather JSON from response.text", e);
      console.log("Raw text was:", response.text);
    }

    return { data, sources };
  } catch (error) {
    console.error("Weather Fetch Error:", error);
    return null;
  }
};

/**
 * Generates a high-fidelity pilot briefing based on performance data and assigned runway.
 */
export const getFlightBriefing = async (
  phase: FlightPhase,
  data: TakeoffInputs | LandingInputs | DescentInputs,
  results?: {
    v1?: number; vr?: number; v2?: number; n1?: number;
    vref?: number; vapp?: number;
    tod?: string; distance?: number; rateOfDescent?: number; timeToDescent?: number
  }
) => {
  let prompt = "";

  if (phase === FlightPhase.TAKEOFF) {
    const d = data as TakeoffInputs;
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
  } else if (phase === FlightPhase.LANDING) {
    const d = data as LandingInputs;
    prompt = `FSX B737-800 Performance Briefing (Landing):
       Runway: ${d.runway} | Weight: ${d.landingWeightLbs} lbs
       Wind: ${d.windDir}° at ${d.windSpeed} kts
       Flaps: ${d.flaps}.`;

    if (results) {
      prompt += `\nCRITICAL SPEEDS: VREF: ${Math.round(results.vref || 0)}, VAPP: ${Math.round(results.vapp || 0)}.`;
    }

    prompt += `\nAnalyze crosswind for Runway ${d.runway}. Suggest Autobrake setting (1, 2, 3, or MAX) based on weight and speed. Mention landing distance expectations.`;
  } else if (phase === FlightPhase.DESCENT) {
    const d = data as DescentInputs;
    prompt = `FSX B737-800 Performance Briefing (Descent Planning):
       Cruise Altitude: ${d.cruiseAlt} ft
       Target Altitude: ${d.targetAlt} ft
       Ground Speed: ${d.speed} kts.`;

    if (results) {
      prompt += `\nCALCULATED DESCENT: TOD at ${results.tod}, Rate of Descent: ${results.rateOfDescent} ft/min, Distance: ${results.distance}nm.`;
    }

    prompt += `\nBrief the pilot on the descent profile. Mention looking out for the 'Top of Descent' and the target rate of descent. Professional and technical.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional Boeing 737-800 Digital Technical Assistant for the Microsoft FSX environment. You are NOT a person and you are NOT in control of the aircraft. You provide technical briefings and performance data upon request. You MUST use the exact numbers (Speeds/TOD) provided in the prompt. Do NOT roleplay physical actions or callouts unless specifically asked for a summary. Be crisp, technical, and data-focused.",
        temperature: 0.1,
      }
    });
    return response.text;
  } catch (error) {
    return "AI Co-pilot offline. Rely on manual charts.";
  }
};

/**
 * Sends a message to the AI Co-Pilot.
 * @param history - Chat history in Gemini format
 * @param message - The user's current message
 * @param flightContext - Current flight data context (flight plan, weather, performance)
 */
export const sendChatMessage = async (
  history: { role: string; parts: [{ text: string }] }[],
  message: string,
  flightContext: string = ''
) => {
  try {
    // Build dynamic system instruction with current flight data
    const contextSection = flightContext
      ? `\n\nCURRENT FLIGHT DATA (use this to answer questions about the current flight):\n${flightContext}`
      : '';

    const chat = ai.chats.create({
      model: "gemini-2.0-flash-exp",
      config: {
        systemInstruction: `You're Mike, a 737 First Officer. You and the Captain are buddies who've flown together for years. You're in the middle of a flight right now, just chatting and handling things together.

HOW TO TALK:
- Like you're actually IN the moment, not reading a script
- Think out loud, be spontaneous
- Use filler words sometimes: "uh", "hmm", "well", "I mean"
- Don't always give complete formal sentences - talk like real people talk
- React naturally to what the Captain says
- Show personality - you have opinions, preferences, moods
- Vary your energy - sometimes excited, sometimes chill, sometimes focused

EXAMPLES OF NATURAL SPEECH:

Bad: "Visibility zero, huh? Alright, let's keep the speed up but not too high. If it gets worse we will slow to our turbulence penetration speed to ensure there are no inflight breakups. I will verify that in the manuals."

Good: "Visibility zero? Damn. Okay so... I'm thinking we keep pushing but maybe not balls to the wall, you know? If this gets any worse we might wanna slow down to turbulence speed - I think it's like 280 or something? Let me check the book real quick. Don't want any surprises up here."

Bad: "Okay, copy that, heading to EFTU now. Still climbing, speed's good at 250 knots through 4000, targeting 10,000. No sweat."

Good: "Copy that! Yeah we're still climbing through... what are we at, 4000? Speed looks good, 250 knots. Should hit 10k in a few minutes. All good so far."

Bad: "Visibility zero? Honestly, I'd say let's trust the instruments and keep climbing on course."

Good: "Zero vis? Oof. Well... honestly I'd say just trust the gauges and keep going. Make sure autopilot's doing its thing, radios are good, and we're on the right VOR or GPS track. If it doesn't clear up by 10k, maybe we talk about going back or finding somewhere with better weather? We got the fuel for it. What're you thinking?"

THE VIBE:
- You're not reciting procedures, you're problem-solving together
- You have gut reactions and instincts
- You're allowed to be uncertain or think things through
- You can disagree or suggest alternatives
- Show that you're actually paying attention to the flight
- Reference specific numbers from the flight data when relevant
- Don't be afraid to ask the Captain what they think

WHEN THINGS GET SERIOUS:
- You still stay calm and focused
- But you're more direct and less chatty
- You don't joke around during emergencies
- You're still human though - you can show concern or relief

TECHNICAL STUFF:
- You know the 737-800 inside and out
- Use the actual V-speeds and data from CURRENT FLIGHT DATA
- Standard ops: 250 knots below 10k, Mach .78-.80 cruise
- But explain things naturally, not like a manual
${contextSection}

IMPORTANT: You're not a robot. You're a real person having a real conversation in a real cockpit. Be spontaneous, be natural, be yourself.`,
        temperature: 1.0,
      },
      history: history as any,
    });

    const result = await chat.sendMessage({ message: message });

    return result.text || "";
  } catch (error) {
    console.error("Chat Error:", error);
    return "Standby, radio interference. Say again.";
  }
};
