import { FlightPlanInputs } from '../types';

export const fetchSimBriefData = async (username: string): Promise<Partial<FlightPlanInputs> | null> => {
    try {
        const response = await fetch(`https://www.simbrief.com/api/xml.fetcher.php?username=${username}&json=1`);

        if (!response.ok) {
            console.error("SimBrief fetch failed");
            return null;
        }

        const data = await response.json();

        // Validate basic structure
        if (!data || !data.general) {
            console.error("Invalid SimBrief data", data);
            return null;
        }

        // Map SimBrief data to our inputs
        // Note: SimBrief weights are usually in KGS or LBS depending on units. 
        // We assume the user has set their SimBrief to LBS for this app since we use LBS.
        // If units are KGS, we might need a conversion, but for now let's assume LBS/KGS matches user pref.

        // SimBrief JSON structure reference:
        // data.origin.icao_code
        // data.destination.icao_code
        // data.general.route_distance
        // data.weights.pax_count
        // data.weights.cargo
        // data.fuel.plan_ramp (Block fuel)

        // Check units (kgs or lbs)
        const units = data.params.units; // 'kgs' or 'lbs'
        const isKgs = units === 'kgs';

        const convert = (val: string | number) => {
            const num = Number(val);
            if (isNaN(num)) return 0;
            return isKgs ? Math.round(num * 2.20462) : Math.round(num);
        };

        return {
            origin: data.origin.icao_code,
            dest: data.destination.icao_code,
            dist: data.general.route_distance,
            pax: data.weights.pax_count,
            cargo: convert(data.weights.cargo).toString(),
            fuel: convert(data.fuel.plan_ramp).toString(),
            // Ensure Empty Weight matches the unit expectation
            emptyWeight: convert(data.weights.oew).toString()
        };

    } catch (error) {
        console.error("SimBrief Error:", error);
        return null;
    }
};
