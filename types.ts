export enum FlightPhase {
  TAKEOFF = 'TAKEOFF',
  LANDING = 'LANDING',
  DESCENT = 'DESCENT'
}
export type ViewState = 'PERFORMANCE' | 'WEATHER' | 'FLIGHTPLAN' | 'AI_COPILOT' | 'LIBRARY' | 'CHECKLIST';

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface ChecklistCategory {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface TakeoffInputs {
  runway: string;
  weightLbs: number;
  oatCelsius: number;
  altFt: number;
  windDir: number;
  windSpeed: number;
  flaps: 1 | 5 | 10 | 15;
  runwayCondition: 'DRY' | 'WET';
}

export interface PerformanceState {
  mode: 'TAKEOFF' | 'LANDING' | 'DESCENT';
  takeoffData: TakeoffInputs;
  landingData: LandingInputs;
  descentData: DescentInputs;
  takeoffResults: PerformanceResults | null;
  landingResults: PerformanceResults | null;
  descentResults: DescentResults | null;
}

export interface DescentInputs {
  cruiseAlt: number;
  targetAlt: number;
  speed: number; // Ground Speed or Indicated
}

export interface DescentResults {
  distance: number;
  tod: string; // "XX nm before target"
  visualPoint: string; // e.g., "Start approx 4 mins out"
  rateOfDescent: number;
  timeToDescent: number;
  briefing?: string;
}

export interface LandingInputs {
  runway: string;
  landingWeightLbs: number;
  flaps: 30 | 40;
  windSpeed: number;
  windDir: number;
  distanceNm: number;
}

export interface WeatherData {
  temp: number;
  windDir: number;
  windSpd: number;
  alt: number; // elevation
  qnh: number;
  icao: string;
}

export interface FlightPlanData {
  origin: string;
  dest: string;
  distance: number;
  fuel: number;
  tripFuel: number;
  reserve: number;
  zfw: number; // Zero Fuel Weight
  gw: number;  // Gross Weight for takeoff
  landingWeight: number;
}

export interface PerformanceResults {
  v1: number;
  vr: number;
  v2: number;
  vref: number;
  vapp: number;
  n1: number;
  briefing?: string;
}

export interface FlightPlanInputs {
  origin: string;
  dest: string;
  dist: string;
  pax: string;
  cargo: string;
  fuel: string;
  emptyWeight: string;
}

export interface FlightPlanState {
  inputs: FlightPlanInputs;
  results: { // UI Formatted results
    time: string;
    blockFuel: number;
    tripFuel: number;
    reserve: number;
    zfw: number;
    gw: number;
    landingWeight: number;
  } | null;
}

export interface WeatherState {
  searchIcao: string;
  data: WeatherData | null;
  sources: any[];
  error: string | null;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
