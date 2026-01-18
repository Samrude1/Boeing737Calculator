export interface ParsedPlan {
    origin: string;
    dest: string;
    distance: number;
    waypoints: number;
}

// Convert FSX DMS format to Decimal Degrees
// Format: N60° 19' 02.00",E024° 57' 48.00",+000179.00
// Or: N60* 19.33', E24* 57.80', +000179.00
const parseCoordinate = (coordStr: string): { lat: number, lon: number } | null => {
    try {
        const parts = coordStr.split(',');
        if (parts.length < 2) return null;

        const parseDMS = (dms: string) => {
            // Remove quotes, degrees symbol, etc
            let s = dms.replace(/["°'deg]/g, ' ').trim();
            const direction = s.charAt(0); // N, S, E, W
            s = s.substring(1).trim();

            const nums = s.split(/\s+/).map(Number);
            let deg = nums[0] || 0;
            let min = nums[1] || 0;
            let sec = nums[2] || 0;

            let decimal = deg + (min / 60) + (sec / 3600);
            if (direction === 'S' || direction === 'W') decimal *= -1;

            return decimal;
        };

        return {
            lat: parseDMS(parts[0]),
            lon: parseDMS(parts[1])
        };

    } catch (e) {
        console.error("Coord parse error", e);
        return null;
    }
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3440.065; // Radius of earth in NM
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
};

export const parseFSXPlan = (xmlContent: string): ParsedPlan | null => {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

        const origin = xmlDoc.querySelector("DepartureID")?.textContent || "";
        const dest = xmlDoc.querySelector("DestinationID")?.textContent || "";

        // Coordinates for Distance
        const depLLA = xmlDoc.querySelector("DepartureLLA")?.textContent || "";
        const destLLA = xmlDoc.querySelector("DestinationLLA")?.textContent || "";

        let distance = 0;
        if (depLLA && destLLA) {
            const p1 = parseCoordinate(depLLA);
            const p2 = parseCoordinate(destLLA);
            if (p1 && p2) {
                distance = calculateDistance(p1.lat, p1.lon, p2.lat, p2.lon);
            }
        }

        const waypoints = xmlDoc.querySelectorAll("ATCWaypoint").length;

        return {
            origin,
            dest,
            distance,
            waypoints
        };

    } catch (error) {
        console.error("PLN Parse Error", error);
        return null;
    }
};
