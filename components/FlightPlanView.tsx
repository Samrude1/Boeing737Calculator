import React, { useState, useEffect, useRef } from 'react';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Map, Clock, Save, Download, Loader2, Fuel, Weight, FileText } from 'lucide-react';
import { FlightPlanState } from '../types';
import { fetchSimBriefData } from '../services/simbriefService';
import { fetchLocalAircraftConfig, AircraftConfig } from '../services/aircraftService';
import { parseFSXPlan } from '../services/planParser';

interface FlightPlanViewProps {
    state: FlightPlanState;
    onUpdate: (state: FlightPlanState) => void;
}

export const FlightPlanView: React.FC<FlightPlanViewProps> = ({ state, onUpdate }) => {
    const [sbUsername, setSbUsername] = useState('');
    const [loadingSb, setLoadingSb] = useState(false);
    const [sbError, setSbError] = useState<string | null>(null);
    const [aircraftConfig, setAircraftConfig] = useState<AircraftConfig | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial Load of Aircraft Config
    useEffect(() => {
        const loadCfg = async () => {
            const cfg = await fetchLocalAircraftConfig();
            if (cfg) {
                setAircraftConfig(cfg);
                const currentEmpty = Number(state.inputs.emptyWeight);
                if (!currentEmpty || currentEmpty === 91300) {
                    updateInputs({ emptyWeight: cfg.emptyWeight.toString() });
                }
            }
        };
        loadCfg();
    }, []);

    // Helper to update specific input fields
    const updateInputs = (updates: any) => {
        onUpdate({
            ...state,
            inputs: { ...state.inputs, ...updates }
        });
    };

    const handleSimBriefImport = async () => {
        if (!sbUsername) return;
        setLoadingSb(true);
        setSbError(null);

        const data = await fetchSimBriefData(sbUsername);

        if (data) {
            // User Request: "We must use our fsx default plane numbers"
            // Do not overwrite Empty Weight with SimBrief data. Keep the local config value.
            const { emptyWeight, ...importData } = data;
            updateInputs(importData);
        } else {
            setSbError('Failed to fetch. Check username/plan.');
        }
        setLoadingSb(false);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            if (!content) return;

            const plan = parseFSXPlan(content);
            if (plan) {
                // Auto-estimate fuel based on new distance
                // Use scalar if available
                const baseBurn = aircraftConfig ? 15 : 18;
                const scalar = aircraftConfig?.fuelFlowScalar || 1.0;

                // Safety: Add 5% or fixed reserve
                const estimatedFuel = Math.round((plan.distance * baseBurn * scalar) + 4000);

                updateInputs({
                    origin: plan.origin,
                    dest: plan.dest,
                    dist: plan.distance.toString(),
                    fuel: estimatedFuel.toString() // Auto-fill FSX calibrated fuel
                });
            }
        };
        reader.readAsText(file);
    };

    // Standard B737-800 Constants
    const DEFAULT_PAYLOAD = 22850; // User's requested default

    const [showLoadSheet, setShowLoadSheet] = useState(false);

    const calculateLoadSheet = () => {
        // Inputs
        const totalFuel = Number(state.inputs.fuel) || 0;

        // --- FUEL LOGIC (Wings first, then Center) ---
        // Capacity: Left/Right = 8630 lbs, Center = 28803 lbs
        const maxWing = 8630;
        let left = 0, right = 0, center = 0;

        // Distribute evenly to wings first
        const wingNeeded = Math.min(totalFuel, maxWing * 2);
        left = wingNeeded / 2;
        right = wingNeeded / 2;

        // Remainder to center
        if (totalFuel > maxWing * 2) {
            center = totalFuel - (maxWing * 2);
        }

        return { fuel: { left, right, center } };
    };

    const calculate = () => {
        const dist = Number(state.inputs.dist) || 0;
        const fuel = Number(state.inputs.fuel) || 0;
        const oew = Number(state.inputs.emptyWeight) || (aircraftConfig?.emptyWeight || 91300);

        // Use user input payload or default
        // We recycle 'cargo' field in state to store this fixed payload for now to avoid breaking types
        // Or better, just strictly use what's in the input field
        const payload = DEFAULT_PAYLOAD;

        // Time & Fuel Estimations
        const timeHours = dist / 440;

        // Use Scalar if available. 
        // Real-world and realistic planners show ~24-25 lbs/nm for the 737-800 including climb/descent.
        const baseBurn = 25;
        const scalar = aircraftConfig?.fuelFlowScalar || 1.0;
        const taxiFuel = 800; // Standard taxi/APU fuel for FSX 737
        const tripFuel = (dist * baseBurn * scalar);

        const zfw = oew + payload;
        const gw = zfw + fuel;
        const landingWeight = gw - (tripFuel + taxiFuel);

        // Required fuel for safety: Trip + Taxi + Reserve
        const minRequired = Math.round(tripFuel + taxiFuel + 4000);

        // Weight Limits
        const maxTakeoffWeight = aircraftConfig?.maxGrossWeight || 155500;
        const maxLandingWeight = aircraftConfig?.maxLandingWeight || 144000;

        const results = {
            time: `${Math.floor(timeHours)}h ${Math.round((timeHours % 1) * 60)} m`,
            blockFuel: fuel,
            tripFuel: Math.round(tripFuel),
            taxiFuel: taxiFuel,
            reserve: 4000,
            recommended: minRequired,
            isSufficient: fuel >= minRequired,
            zfw: zfw,
            gw: gw,
            landingWeight: landingWeight,
            isOverweight: gw > maxTakeoffWeight,
            isOverLandingWeight: landingWeight > maxLandingWeight,
            maxGW: maxTakeoffWeight,
            maxLW: maxLandingWeight
        };

        // Push to Global State
        onUpdate({
            ...state,
            results
        });
    };

    const estimateFuel = () => {
        const dist = Number(state.inputs.dist) || 0;
        const baseBurn = 25;
        const scalar = aircraftConfig?.fuelFlowScalar || 1.0;
        const tripFuel = dist * baseBurn * scalar;
        const taxiFuel = 800;

        // Match the import logic: Trip + Taxi + 4000 lbs reserve
        updateInputs({ fuel: Math.round(tripFuel + taxiFuel + 4000).toString() });
    };

    const results = state.results;
    const loadSheet = calculateLoadSheet();

    // Set default payload on init if empty
    useEffect(() => {
        if (!state.inputs.cargo) {
            updateInputs({ cargo: DEFAULT_PAYLOAD.toString(), pax: '0' });
        }
    }, []);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Map className="text-sky-500" />
                    Flight Plan & Weights
                </h2>
                <p className="text-slate-500">Step 1: Define your route and payload to determine Gross Weight.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="flex flex-col gap-4" title="1. Route & Payload">
                    {/* SimBrief Import */}
                    <div className="flex flex-col gap-2 mb-2">
                        <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800 flex items-end gap-2">
                            <Input
                                label="Import from SimBrief"
                                placeholder="SimBrief Username"
                                value={sbUsername}
                                onChange={e => setSbUsername(e.target.value)}
                                containerClassName="flex-1"
                            />
                            <Button
                                className="mb-[2px] w-12"
                                onClick={handleSimBriefImport}
                                disabled={loadingSb || !sbUsername}
                                title="Import Flight Plan"
                            >
                                {loadingSb ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                            </Button>
                        </div>

                        {/* FSX File Uplodad */}
                        <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-mono ml-1">Import FSX .PLN File</span>
                            <div className="flex gap-2">
                                <input
                                    type="file"
                                    accept=".pln,.txt,.xml"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                                <Button
                                    variant="secondary"
                                    onClick={() => fileInputRef.current?.click()}
                                    title="Load .PLN File"
                                >
                                    <FileText size={16} className="mr-2" /> Load Local Plan
                                </Button>
                            </div>
                        </div>
                    </div>
                    {sbError && <div className="text-xs text-red-400 -mt-2 mb-2">{sbError}</div>}

                    <div className="my-1 border-t border-slate-800/50"></div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Origin (ICAO)" value={state.inputs.origin} onChange={e => updateInputs({ origin: e.target.value.toUpperCase() })} placeholder="EFHK" />
                        <Input label="Dest (ICAO)" value={state.inputs.dest} onChange={e => updateInputs({ dest: e.target.value.toUpperCase() })} placeholder="ESSA" />
                    </div>

                    <Input label="Distance (NM)" type="number" value={state.inputs.dist} onChange={e => updateInputs({ dist: e.target.value })} placeholder="250" />

                    <div className="flex gap-2 items-end">
                        <Input label="Fuel (Lbs)" type="number" value={state.inputs.fuel} onChange={e => updateInputs({ fuel: e.target.value })} containerClassName="flex-1" />
                        <Button variant="secondary" onClick={estimateFuel} className="mb-[2px] px-3" title="Estimate Fuel">
                            <Clock size={16} />
                        </Button>
                    </div>

                    {/* Fixed Reference Inputs */}
                    <div className="my-2 border-t border-slate-800/50"></div>
                    <div className="grid grid-cols-2 gap-4 opacity-75">
                        <Input
                            label="Empty Weight (Fixed)"
                            value={state.inputs.emptyWeight}
                            disabled
                            className="text-slate-500 cursor-not-allowed border-slate-800 bg-slate-900/30"
                            title="Fixed FSX Default Weight"
                        />
                        <Input
                            label="Payload (Fixed)"
                            value={DEFAULT_PAYLOAD}
                            disabled
                            className="text-slate-500 cursor-not-allowed border-slate-800 bg-slate-900/30"
                            title="Fixed FSX Default Payload"
                        />
                    </div>

                    <Button onClick={calculate} className="mt-4">
                        <Save size={18} /> CALCULATE & SAVE
                    </Button>
                </Card>

                {/* RIGHT COLUMN */}
                <div className="flex flex-col gap-6">
                    {/* RESULTS */}
                    {results && (
                        <Card className="flex flex-col gap-6 bg-slate-900/80" title="2. Calculation Results">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-800/50 p-4 rounded-lg">
                                    <div className="text-xs text-slate-500 uppercase font-bold">Planned Fuel (Block)</div>
                                    <div className="text-xl font-mono text-sky-400">{results.blockFuel.toLocaleString()} <span className="text-xs">LBS</span></div>
                                    <div className="text-[10px] text-slate-500">Trip: {results.tripFuel.toLocaleString()} | Taxi: {results.taxiFuel?.toLocaleString() || '800'} | Res: {results.reserve.toLocaleString()}</div>
                                    {!results.isSufficient && (
                                        <div className="mt-2 text-[10px] text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20 font-bold animate-pulse">
                                            ⚠️ INSUFFICIENT FUEL! Recommended: {results.recommended.toLocaleString()} lbs
                                        </div>
                                    )}
                                </div>
                                <div className="bg-slate-800/50 p-4 rounded-lg">
                                    <div className="text-xs text-slate-500 uppercase font-bold">Est. Time</div>
                                    <div className="text-xl font-mono text-emerald-400">{results.time}</div>
                                </div>
                                <div className="bg-slate-800/50 p-4 rounded-lg">
                                    <div className="text-xs text-slate-500 uppercase font-bold">Zero Fuel Wgt</div>
                                    <div className="text-xl font-mono text-slate-200">{results.zfw.toLocaleString()} <span className="text-xs">LBS</span></div>
                                    <div className="text-[10px] text-slate-500">(Empty + Payload)</div>
                                </div>
                                <div className={`bg-slate-800/50 p-4 rounded-lg ${results.isOverLandingWeight ? 'border border-red-500/50 bg-red-500/5' : ''}`}>
                                    <div className={`text-xs uppercase font-bold ${results.isOverLandingWeight ? 'text-red-400' : 'text-slate-500'}`}>Est Landing Wgt</div>
                                    <div className={`text-xl font-mono ${results.isOverLandingWeight ? 'text-red-400' : 'text-purple-400'}`}>{results.landingWeight.toLocaleString()} <span className="text-xs">LBS</span></div>
                                    <div className="text-[10px] text-slate-500">Max: {results.maxLW.toLocaleString()}</div>
                                </div>
                                <div className={`col-span-2 bg-slate-800/50 p-4 rounded-lg border ${results.isOverweight ? 'border-red-500 bg-red-500/10' : 'border-sky-500/30'}`}>
                                    <div className={`text-xs uppercase font-bold ${results.isOverweight ? 'text-red-400' : 'text-sky-500'}`}>Gross Weight (Takeoff)</div>
                                    <div className={`text-2xl font-mono font-bold ${results.isOverweight ? 'text-red-400' : 'text-white'}`}>{results.gw.toLocaleString()} <span className="text-xs">LBS</span></div>
                                    <div className="text-[10px] text-slate-500">{results.isOverweight ? '⚠️ EXCEEDS MAXIMUM TAKEOFF WEIGHT' : 'Sent to Performance Calculator'}</div>
                                    <div className="text-[10px] text-slate-500">Max MTOW: {results.maxGW.toLocaleString()}</div>
                                </div>
                            </div>
                            <div className="text-xs text-slate-600 font-mono px-2">
                                Formula: {Number(state.inputs.emptyWeight).toLocaleString()} (Empty) + {DEFAULT_PAYLOAD.toLocaleString()} (Payload) + {Number(state.inputs.fuel).toLocaleString()} (Fuel) = {results.gw.toLocaleString()} LBS
                            </div>
                        </Card>
                    )}

                    {/* LOADING ASSISTANT (Live View) */}
                    {(Number(state.inputs.fuel) > 0) && (
                        <Card title="3. FSX Fuel Loader" className="bg-slate-950 border border-sky-500/30 shadow-2xl relative overflow-hidden animate-in slide-in-from-right-4 duration-500">
                            <div className="absolute top-0 left-0 w-1 h-full bg-sky-500"></div>
                            <p className="text-xs text-slate-400 mb-4">Enter exact tank values into FSX 'Fuel & Payload'.</p>

                            <div className="space-y-4">
                                {/* FUEL */}
                                <div className="bg-slate-900/50 p-3 rounded border border-slate-800/50">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-xs font-bold text-sky-400 uppercase flex items-center gap-2">
                                            <Fuel size={12} /> Fuel Distribution
                                        </h4>
                                        <div className="text-xs font-mono text-white bg-sky-600 px-2 rounded opacity-50">
                                            Total: {Number(state.inputs.fuel).toLocaleString()}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                        <div className="flex flex-col gap-1">
                                            <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Left</div>
                                            <div className="font-mono text-xl font-bold text-white bg-slate-800 border border-slate-700/50 rounded py-2 shadow-inner">
                                                {Math.round(loadSheet.fuel.left)}
                                            </div>
                                            <div className="text-[9px] text-slate-600">Max 8630</div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Center</div>
                                            <div className="font-mono text-xl font-bold text-white bg-slate-800 border border-slate-700/50 rounded py-2 shadow-inner">
                                                {Math.round(loadSheet.fuel.center)}
                                            </div>
                                            <div className="text-[9px] text-slate-600">Overflow</div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Right</div>
                                            <div className="font-mono text-xl font-bold text-white bg-slate-800 border border-slate-700/50 rounded py-2 shadow-inner">
                                                {Math.round(loadSheet.fuel.right)}
                                            </div>
                                            <div className="text-[9px] text-slate-600">Max 8630</div>
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-slate-500 mt-3 text-center italic">
                                        * Wings are always filled first to maximum capacity.
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};
