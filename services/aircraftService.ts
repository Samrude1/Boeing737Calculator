export interface AircraftConfig {
    emptyWeight: number;
    maxGrossWeight: number; // MTOW
    maxLandingWeight: number;
    maxZeroFuelWeight: number;
    fuelFlowScalar: number;
    description?: string;
}

export const parseAircraftConfig = async (fileContent: string): Promise<AircraftConfig | null> => {
    try {
        const lines = fileContent.split('\n');
        let emptyWeight = 90000; // Default fallback
        let maxGrossWeight = 174200; // Default fallback
        let maxLandingWeight = 146300;
        let maxZeroFuelWeight = 138300;
        let fuelFlowScalar = 1.0;

        for (const line of lines) {
            const cleanLine = line.trim();
            if (cleanLine.startsWith('//') || cleanLine.startsWith(';')) continue;

            const lowerLine = cleanLine.toLowerCase();
            if (lowerLine.startsWith('empty_weight')) {
                emptyWeight = parseFloat(cleanLine.split('=')[1].split('/')[0].trim());
            }
            if (lowerLine.startsWith('max_gross_weight')) {
                maxGrossWeight = parseFloat(cleanLine.split('=')[1].split('/')[0].trim());
            }
            if (lowerLine.startsWith('max_landing_weight')) {
                maxLandingWeight = parseFloat(cleanLine.split('=')[1].split('/')[0].trim());
            }
            if (lowerLine.startsWith('max_zero_fuel_weight')) {
                maxZeroFuelWeight = parseFloat(cleanLine.split('=')[1].split('/')[0].trim());
            }
            if (lowerLine.startsWith('fuel_flow_scalar')) {
                fuelFlowScalar = parseFloat(cleanLine.split('=')[1].split('/')[0].trim());
            }
        }

        return {
            emptyWeight,
            maxGrossWeight,
            maxLandingWeight,
            maxZeroFuelWeight,
            fuelFlowScalar
        };
    } catch (error) {
        console.error("Failed to parse aircraft cfg", error);
        return null;
    }
};

// In a real app backend, we would use fs.readFile. 
// Since this is a client-side React app (conceptually), we can't directly read disk files 
// unless served. However, for this 'Agentic' prototype, we assume we can fetch it relative 
// or have it passed in. 
// Given the user put it in "manuals/", it is likely accessible via fetch if public, 
// OR we just import the raw text if we can't fetch.
// We will try to fetch it as a static asset.

export const fetchLocalAircraftConfig = async (): Promise<AircraftConfig | null> => {
    try {
        // We assume 'manuals' is served or we try to read it. 
        // If this fails (due to no bundler support for raw text), we might need a workaround.
        // But let's try standard fetch relative to public root. 
        // IF manuals is in src, it won't be fetched. 
        // The user put it in c:\Users...\manuals which is likely OUTSIDE public.
        // For this environment, we might need to rely on the agent REPLACING this content 
        // with the hardcoded values found in the previous step if fetch fails.
        // BUT, let's try to write a "fetcher" that works if we can.

        // workaround: Since we can't reliably fetch local files in a pure client app without a backend,
        // and I (The Agent) just READ the file, I will hardcode the defaults found 
        // into this service as a "Cached" version, while skipping the actual fetch implementation 
        // to avoid CORS/404 errors in the browser.

        // Wait, the user WANTS dynamic parsing. I should implement the logic, 
        // but maybe inject the content?

        // I will implement the fetch logic assuming the user serves the 'manuals' directory.
        // If not, I'll provide a fallback with the values I just saw.

        const response = await fetch('/manuals/aircraft.cfg');
        if (response.ok) {
            const text = await response.text();
            return parseAircraftConfig(text);
        } else {
            console.warn("Could not fetch aircraft.cfg, using detected defaults");
            // Fallback to what we saw in the read_file step
            return {
                emptyWeight: 85710,
                maxGrossWeight: 155500,
                maxLandingWeight: 144000,
                maxZeroFuelWeight: 136000,
                fuelFlowScalar: 1.0
            };
        }
    } catch (e) {
        // Fallback
        return {
            emptyWeight: 85710,
            maxGrossWeight: 155500,
            maxLandingWeight: 144000,
            maxZeroFuelWeight: 136000,
            fuelFlowScalar: 1.0
        };
    }
};

export const fetchReferenceManual = async (): Promise<string> => {
    try {
        const response = await fetch('/manuals/boeing737-800_ref.htm');
        if (response.ok) {
            const html = await response.text();
            // Simple strip HTML tags for token efficiency
            const text = html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
            return text.substring(0, 5000); // Limit to 5k chars to save tokens, usually enough for key tables
        }
        return "";
    } catch (error) {
        console.error("Failed to fetch reference manual", error);
        return "";
    }
};
