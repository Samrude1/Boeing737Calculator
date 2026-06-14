import { FlightPhase, TakeoffInputs, LandingInputs, DescentInputs } from '../types';

/**
 * Fetches real-world METAR and airport data using Google Search grounding.
 * This ensures the data matches real-world weather tools used in FSX.
 */
export const fetchAirportWeather = async (icao: string) => {
  console.log(`[WeatherService] Fetching METAR for ${icao}...`);
  try {
    const response = await fetch('/api/weather', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ icao })
    });

    if (!response.ok) {
      throw new Error('Weather API request failed');
    }

    const json = await response.json();
    return { data: json.data, sources: json.sources };
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
  try {
    const response = await fetch('/api/briefing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phase, data, results })
    });

    if (!response.ok) {
      throw new Error('Briefing API request failed');
    }

    const json = await response.json();
    return json.text;
  } catch (error) {
    console.error("Briefing Error:", error);
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
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, message, flightContext })
    });

    if (!response.ok) {
      throw new Error('Chat API request failed');
    }

    const json = await response.json();
    return json.text;
  } catch (error) {
    console.error("Chat Error:", error);
    return "Standby, radio interference. Say again.";
  }
};

