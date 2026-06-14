import { useState } from 'react'; import { FlightPhase, TakeoffInputs, LandingInputs, DescentInputs, PerformanceResults } from '../types'; import { getFlightBriefing as fetchBriefing } from '../services/geminiService';

export const usePerformance = () => {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<PerformanceResults | null>(null);

    const calculateTakeoff = async (data: TakeoffInputs) => {
        setLoading(true);
        try {
            const baseV1 = data.flaps === 1 ? 142 : data.flaps === 5 ? 138 : 134;
            const weightFactor = (data.weightLbs - 100000) / 10000;
            let v1 = baseV1 + weightFactor * 1.6;

            // Adjust for Wet Runway
            if (data.runwayCondition === 'WET') {
                v1 -= 5;
            }
            const vr = v1 + 4;
            const v2 = vr + 11;
            const n1 = 92.2 + (data.oatCelsius > 20 ? (data.oatCelsius - 20) * 0.15 : 0);

            // Briefing
            const briefing = await fetchBriefing(FlightPhase.TAKEOFF, data, { v1, vr, v2, n1 });

            setResults({ v1, vr, v2, vref: 0, vapp: 0, n1, briefing });
        } finally {
            setLoading(false);
        }
    };

    const calculateLanding = async (data: LandingInputs) => {
        setLoading(true);
        try {
            const weightFactor = (data.landingWeightLbs - 100000) / 10000;
            // Increased base values by 3kts to compensate for FSX default flight model quirks
            const vref = (data.flaps === 30 ? 139 : 134) + weightFactor * 1.4;
            const vapp = vref + Math.min(20, Math.max(5, data.windSpeed / 2));

            // Briefing
            const briefing = await fetchBriefing(FlightPhase.LANDING, data, { vref, vapp });

            setResults({ v1: 0, vr: 0, v2: 0, vref, vapp, n1: 0, briefing });
        } finally {
            setLoading(false);
        }
    };

    const calculateDescent = async (data: DescentInputs) => {
        setLoading(true);
        try {
            const altitudeDiff = data.cruiseAlt - data.targetAlt;
            const distance = (altitudeDiff / 1000) * 3; // 3:1 Rule
            const rateOfDescent = (data.speed / 2) * 10; // Rule of thumb: GS/2 * 10
            const timeToDescent = distance / (data.speed / 60);

            const tod = `${Math.round(distance)} NM`;
            const visualPoint = `Start descent approximately ${Math.round(timeToDescent)} minutes before the target.`;

            // Briefing
            const briefing = await fetchBriefing(FlightPhase.DESCENT, data, { tod, distance, rateOfDescent, timeToDescent });

            const descentResult = { distance, tod, visualPoint, rateOfDescent, timeToDescent, briefing };

            // We use a specific structure in results to help PerformanceView identify it
            setResults({
                v1: -1, vr: 0, v2: 0, vref: 0, vapp: 0, n1: 0,
                briefing: briefing, // Store briefing here too for generic access
                descentBriefing: briefing // Custom field for detection
            } as any);
        } finally {
            setLoading(false);
        }
    };

    return {
        calculateTakeoff,
        calculateLanding,
        calculateDescent,
        results,
        loading
    };
};
