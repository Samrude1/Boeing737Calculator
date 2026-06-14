import { ChecklistCategory } from '../types';

export const INITIAL_CHECKLISTS: ChecklistCategory[] = [
    {
        id: 'preflight',
        title: '1. PRE-FLIGHT & STARTUP',
        items: [
            { id: 'pf1', label: 'Parking Brake: SET', checked: false },
            { id: 'pf2', label: 'Battery & Avionics: ON', checked: false },
            { id: 'pf3', label: 'Fuel Quantity: CHECKED', checked: false },
            { id: 'pf4', label: 'Fuel Pumps: ALL ON', checked: false },
            { id: 'pf5', label: 'Throttles: IDLE', checked: false },
            { id: 'pf6', label: 'Engine Start: ENGAGE (Ctrl+E)', checked: false },
            { id: 'pf7', label: 'Generators: ON (Stable N2)', checked: false },
            { id: 'pf8', label: 'Pitot Heat: ON (Shift+H)', checked: false },
        ]
    },
    {
        id: 'before-takeoff',
        title: '2. BEFORE TAKEOFF',
        items: [
            { id: 'bto1', label: 'Flight Director: ON', checked: false },
            { id: 'bto2', label: 'Auto-Throttle: ARM', checked: false },
            { id: 'bto3', label: 'Flaps: SET (5 or 10)', checked: false },
            { id: 'bto4', label: 'Speed (IAS): SET 250 kts', checked: false },
            { id: 'bto5', label: 'Altitude: SET Initial Clearance', checked: false },
            { id: 'bto6', label: 'Heading: SET Runway Heading', checked: false },
            { id: 'bto7', label: 'Transponder: TA/RA', checked: false },
            { id: 'bto8', label: 'Landing Lights: ON', checked: false },
        ]
    },
    {
        id: 'climb-cruise',
        title: '3. CLIMB & CRUISE',
        items: [
            { id: 'cc1', label: 'Landing Gear: RETRACT (+ Rate)', checked: false },
            { id: 'cc2', label: 'Autopilot: ENGAGE (CMD A)', checked: false },
            { id: 'cc3', label: 'Flaps: RETRACT', checked: false },
            { id: 'cc4', label: 'Altimeter: SYNC (Press B)', checked: false },
            { id: 'cc5', label: '10,000ft: Landing Lights OFF', checked: false },
            { id: 'cc6', label: '10,000ft: Speed Increase', checked: false },
        ]
    },
    {
        id: 'descent',
        title: '4. DESCENT & APPROACH',
        items: [
            { id: 'd1', label: 'Engine Anti-Ice: ON (H) (if <10°C)', checked: false },
            { id: 'd2', label: 'Altimeter: SYNC to Local (B)', checked: false },
            { id: 'd3', label: 'Auto-Brake: SET (1-3)', checked: false },
            { id: 'd4', label: 'Speed: REDUCE to 210 kts', checked: false },
            { id: 'd5', label: 'NAV1 Radio: TUNED ILS', checked: false },
            { id: 'd6', label: 'Course (CRS): SET Runway Hdg', checked: false },
            { id: 'd7', label: 'Spoilers: ARM (Shift+/)', checked: false },
            { id: 'd8', label: 'Landing Lights: ON (<10k ft)', checked: false },
        ]
    },
    {
        id: 'final-landing',
        title: '5. FINAL LANDING',
        items: [
            { id: 'fl1', label: 'Approach Mode (APR): ARM', checked: false },
            { id: 'fl2', label: 'Landing Gear: DOWN', checked: false },
            { id: 'fl3', label: 'Flaps: FULL (30/40)', checked: false },
            { id: 'fl4', label: 'Autopilot: DISCONNECT (500ft)', checked: false },
            { id: 'fl5', label: 'Throttles: IDLE (Flare)', checked: false },
            { id: 'fl6', label: 'Reversers: ENGAGE (Touchdown)', checked: false },
        ]
    },
    {
        id: 'after-landing',
        title: '6. AFTER LANDING',
        items: [
            { id: 'al1', label: 'Flaps: RETRACT', checked: false },
            { id: 'al2', label: 'Spoilers: RETRACT', checked: false },
            { id: 'al3', label: 'Auto-Brake: OFF', checked: false },
            { id: 'al4', label: 'Lights: Strobe OFF / Taxi ON', checked: false },
        ]
    }
];
