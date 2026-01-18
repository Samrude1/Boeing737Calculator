import React, { useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { usePerformance } from '../hooks/usePerformance';
import { TakeoffInputs, LandingInputs, WeatherData, FlightPlanData, PerformanceState, DescentInputs, DescentResults } from '../types';
import { RotateCw, PlaneTakeoff, Info, PlaneLanding, Wind, ArrowDown } from 'lucide-react';

interface PerformanceViewProps {
    weatherData?: WeatherData | null;
    flightPlanData?: FlightPlanData | null;
    state: PerformanceState;
    onUpdate: (newState: PerformanceState) => void;
}

export const PerformanceView: React.FC<PerformanceViewProps> = ({ weatherData, flightPlanData, state, onUpdate }) => {
    const { calculateTakeoff, calculateLanding, calculateDescent, results: hookResults, loading } = usePerformance();


    // Sync hook results to parent state
    useEffect(() => {
        if (hookResults) {
            if ((hookResults as any).descentBriefing) {
                const altitudeDiff = state.descentData.cruiseAlt - state.descentData.targetAlt;
                const distance = (altitudeDiff / 1000) * 3;
                const rateOfDescent = (state.descentData.speed / 2) * 10;
                const timeToDescent = distance / (state.descentData.speed / 60);

                onUpdate({
                    ...state,
                    descentResults: {
                        distance,
                        tod: `${Math.round(distance)} NM`,
                        visualPoint: `Start descent approximately ${Math.round(timeToDescent)} minutes before target.`,
                        rateOfDescent,
                        timeToDescent,
                        briefing: hookResults.briefing
                    }
                });
            } else if (hookResults.v1 > 0) {
                onUpdate({ ...state, takeoffResults: hookResults });
            } else if (hookResults.vref > 0) {
                onUpdate({ ...state, landingResults: hookResults });
            }
        }
    }, [hookResults]);

    const handleCalculate = () => {
        if (state.mode === 'TAKEOFF') calculateTakeoff(state.takeoffData);
        else if (state.mode === 'LANDING') calculateLanding(state.landingData);
        else if (state.mode === 'DESCENT') calculateDescent(state.descentData);
    };

    // Helpers to update specific parts of state
    const updateTakeoff = (updates: Partial<TakeoffInputs>) => onUpdate({ ...state, takeoffData: { ...state.takeoffData, ...updates } });
    const updateLanding = (updates: Partial<LandingInputs>) => onUpdate({ ...state, landingData: { ...state.landingData, ...updates } });
    const updateDescent = (updates: Partial<DescentInputs>) => onUpdate({ ...state, descentData: { ...state.descentData, ...updates } });
    const setMode = (mode: 'TAKEOFF' | 'LANDING' | 'DESCENT') => onUpdate({ ...state, mode });

    // Auto-sync Weather Data
    useEffect(() => {
        if (weatherData) {
            updateTakeoff({
                oatCelsius: weatherData.temp,
                windDir: weatherData.windDir,
                windSpeed: weatherData.windSpd,
                altFt: weatherData.alt
            });
            updateLanding({
                windDir: weatherData.windDir,
                windSpeed: weatherData.windSpd
            });
        }
    }, [weatherData]);

    // Auto-sync Flight Plan Data
    useEffect(() => {
        if (flightPlanData) {
            if (state.takeoffData.weightLbs !== flightPlanData.gw) {
                updateTakeoff({ weightLbs: flightPlanData.gw });
            }
            if (state.landingData.landingWeightLbs !== flightPlanData.landingWeight) {
                updateLanding({ landingWeightLbs: flightPlanData.landingWeight });
            }
        }
    }, [flightPlanData]);

    // Wind Component Logic
    const getWindComponents = (runwayStr: string, windDir: number, windSpd: number) => {
        // Parse Runway Heading (e.g. "27R" -> 270, "09" -> 90)
        const match = runwayStr.match(/^(\d{2})/);
        if (!match) return null;

        let rwyHeading = parseInt(match[1]) * 10;

        // Calculate difference
        let angleDiff = Math.abs(windDir - rwyHeading);
        // Normalize to 0-180
        if (angleDiff > 180) angleDiff = 360 - angleDiff;

        // Convert to radians for Math functions
        const rads = angleDiff * (Math.PI / 180);

        const headwind = Math.cos(rads) * windSpd;
        const crosswind = Math.sin(rads) * windSpd;

        return {
            headwind: Math.round(headwind),
            crosswind: Math.round(crosswind),
            isTailwind: headwind < 0
        };
    };

    const currentWindComponents = state.mode !== 'DESCENT' ? getWindComponents(
        state.mode === 'TAKEOFF' ? state.takeoffData.runway : state.landingData.runway,
        state.mode === 'TAKEOFF' ? state.takeoffData.windDir : state.landingData.windDir,
        state.mode === 'TAKEOFF' ? state.takeoffData.windSpeed : state.landingData.windSpeed
    ) : null;

    const ResultCard = ({ label, value, unit, color = 'text-sky-400' }: any) => (
        <div className="bg-slate-900/50 rounded-lg p-4 flex flex-col items-center justify-center border border-slate-800">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</span>
            <span className={`text-4xl font-bold font-mono ${color}`}>{value || '---'}</span>
            <span className="text-slate-600 text-xs mt-1">{unit}</span>
        </div>
    );

    const activeResults = state.mode === 'TAKEOFF' ? state.takeoffResults :
        state.mode === 'LANDING' ? state.landingResults :
            state.descentResults;
    const descentResults = state.descentResults;

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                    <button
                        onClick={() => setMode('TAKEOFF')}
                        className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${state.mode === 'TAKEOFF' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                    >
                        <PlaneTakeoff size={16} /> TAKEOFF
                    </button>
                    <button
                        onClick={() => setMode('LANDING')}
                        className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${state.mode === 'LANDING' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                    >
                        <PlaneLanding size={16} /> LANDING
                    </button>
                    <button
                        onClick={() => setMode('DESCENT')}
                        className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${state.mode === 'DESCENT' ? 'bg-purple-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                    >
                        <ArrowDown size={16} /> DESCENT
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Inputs */}
                <Card className="lg:col-span-4 flex flex-col gap-4" title={state.mode === 'TAKEOFF' ? "Takeoff Parameters" : state.mode === 'LANDING' ? "Landing Parameters" : "Descent Planning"}>
                    {state.mode === 'TAKEOFF' && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Runway" value={state.takeoffData.runway} onChange={e => updateTakeoff({ runway: e.target.value.toUpperCase() })} />
                                <Input label="Flaps" type="number" value={state.takeoffData.flaps} onChange={e => updateTakeoff({ flaps: Number(e.target.value) as any })} />
                            </div>
                            <Input label="Gross Weight" suffix="LBS" type="number" value={state.takeoffData.weightLbs} onChange={e => updateTakeoff({ weightLbs: Number(e.target.value) })} />
                            <div className="grid grid-cols-3 gap-3">
                                <Input label="Wind" placeholder="DIR" type="number" value={state.takeoffData.windDir} onChange={e => updateTakeoff({ windDir: Number(e.target.value) })} />
                                <Input label="@" placeholder="SPD" type="number" value={state.takeoffData.windSpeed} onChange={e => updateTakeoff({ windSpeed: Number(e.target.value) })} />
                                <Input label="OAT" suffix="°C" type="number" value={state.takeoffData.oatCelsius} onChange={e => updateTakeoff({ oatCelsius: Number(e.target.value) })} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Runway Condition</span>
                                <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                                    {(['DRY', 'WET'] as const).map(condition => (
                                        <button key={condition} onClick={() => updateTakeoff({ runwayCondition: condition })} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${state.takeoffData.runwayCondition === condition ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>{condition}</button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {state.mode === 'LANDING' && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Runway" placeholder="e.g 27R" value={state.landingData.runway} onChange={e => updateLanding({ runway: e.target.value.toUpperCase() })} />
                                <div className="flex flex-col gap-2">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Flaps</span>
                                    <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800 h-[42px]">
                                        {[30, 40].map(f => (
                                            <button key={f} onClick={() => updateLanding({ flaps: f as any })} className={`flex-1 text-xs font-bold rounded-md transition-all ${state.landingData.flaps === f ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>{f}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {flightPlanData?.dest && (
                                <div className="text-xs text-slate-500 px-1">Arrival at <span className="text-emerald-400 font-bold">{flightPlanData.dest}</span></div>
                            )}
                            <Input label="Landing Weight" suffix="LBS" type="number" value={state.landingData.landingWeightLbs} onChange={e => updateLanding({ landingWeightLbs: Number(e.target.value) })} />
                            <div className="grid grid-cols-2 gap-3">
                                <Input label="Wind Dir" placeholder="DIR" type="number" value={state.landingData.windDir} onChange={e => updateLanding({ windDir: Number(e.target.value) })} />
                                <Input label="Wind Spd" placeholder="SPD" type="number" value={state.landingData.windSpeed} onChange={e => updateLanding({ windSpeed: Number(e.target.value) })} />
                            </div>
                        </>
                    )}

                    {state.mode === 'DESCENT' && (
                        <Card title="Top of Descent" className="relative">
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Cruise Alt" suffix="FT" type="number" value={state.descentData.cruiseAlt} onChange={e => updateDescent({ cruiseAlt: Number(e.target.value) })} />
                                <Input label="Target Alt" suffix="FT" type="number" value={state.descentData.targetAlt} onChange={e => updateDescent({ targetAlt: Number(e.target.value) })} />
                            </div>
                            <Input label="Ground Speed" suffix="KTS" type="number" value={state.descentData.speed} onChange={e => updateDescent({ speed: Number(e.target.value) })} />
                            <div className="text-xs text-slate-500 mt-2">
                                Calculates Top of Descent (TOD) point based on 3:1 glide path rule.
                            </div>
                        </Card>
                    )}

                    {/* Wind Components Display */}
                    {currentWindComponents && (
                        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800 flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2">
                                <Wind size={14} className="text-slate-500" />
                                <span className="text-slate-400 font-bold uppercase">Components</span>
                            </div>
                            <div className="flex gap-4 font-mono font-bold">
                                <span className={currentWindComponents.isTailwind ? 'text-red-400' : 'text-emerald-400'}>
                                    {currentWindComponents.isTailwind ? 'Tail' : 'Head'} {Math.abs(currentWindComponents.headwind)}
                                </span>
                                <span className="text-sky-400">
                                    X-Wind {Math.abs(currentWindComponents.crosswind)}
                                </span>
                            </div>
                        </div>
                    )}

                    <Button className={`mt-4 py-4 text-lg ${state.mode === 'LANDING' ? 'bg-emerald-600 hover:bg-emerald-500' : state.mode === 'DESCENT' ? 'bg-purple-600 hover:bg-purple-500' : ''}`} isLoading={loading} onClick={handleCalculate}>
                        <RotateCw size={20} /> CALCULATE
                    </Button>
                </Card>

                {/* Results */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <Card title="Calculated Output">
                        {state.mode === 'TAKEOFF' && (
                            <div className="grid grid-cols-3 gap-6">
                                <ResultCard label="V1 Decision" value={(activeResults as any)?.v1?.toFixed(0)} unit="KNOTS" color="text-sky-400" />
                                <ResultCard label="VR Rotate" value={(activeResults as any)?.vr?.toFixed(0)} unit="KNOTS" color="text-green-500" />
                                <ResultCard label="V2 Safety" value={(activeResults as any)?.v2?.toFixed(0)} unit="KNOTS" color="text-sky-400" />
                            </div>
                        )}

                        {state.mode === 'LANDING' && (
                            <div className="grid grid-cols-2 gap-6">
                                <ResultCard label={`VREF ${state.landingData.flaps}`} value={(activeResults as any)?.vref?.toFixed(0)} unit="KNOTS" color="text-emerald-400" />
                                <ResultCard label="VAPP Target" value={(activeResults as any)?.vapp?.toFixed(0)} unit="KNOTS" color="text-white" />
                            </div>
                        )}

                        {state.mode === 'DESCENT' && (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                <ResultCard label="Distance to Start" value={(activeResults as any)?.tod} unit="DISTANCE" color="text-purple-400" />
                                <ResultCard label="Rate of Descent" value={(activeResults as any)?.rateOfDescent} unit="FT/MIN" color="text-white" />
                                <ResultCard label="Time" value={Math.round((activeResults as any)?.timeToDescent || 0)} unit="MINUTES" color="text-slate-300" />
                            </div>
                        )}

                        {state.mode === 'TAKEOFF' && (
                            <div className="mt-6 flex justify-between items-center bg-slate-900/40 p-4 rounded-lg border border-slate-800">
                                <div className="flex gap-8">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-500 font-bold uppercase">N1 Target</span>
                                        <span className="text-2xl font-mono text-orange-400 font-bold">{(activeResults as any)?.n1 ? (activeResults as any).n1.toFixed(1) + '%' : '---'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-500 font-bold uppercase">Trim</span>
                                        <span className="text-2xl font-mono text-slate-300 font-bold">5.25</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeResults?.briefing && (
                            <div className="mt-4 flex items-center gap-2 text-sky-400 bg-sky-500/10 px-3 py-1 rounded text-xs font-bold border border-sky-500/20">
                                <Info size={14} /> BRIEFING READY
                            </div>
                        )}
                        {state.mode === 'DESCENT' && descentResults && (
                            <div className="mt-4 flex items-center gap-2 text-purple-400 bg-purple-500/10 px-3 py-3 rounded text-sm font-bold border border-purple-500/20">
                                <Info size={16} /> <span className="font-mono">{descentResults.visualPoint}</span>
                            </div>
                        )}
                    </Card>

                    {activeResults?.briefing && (
                        <Card title="AI Co-Pilot Briefing" className="flex-1 bg-slate-900/80">
                            <div className="prose prose-invert prose-sm max-w-none text-slate-300 whitespace-pre-line font-mono leading-relaxed">
                                {activeResults.briefing}
                            </div>
                        </Card>
                    )}
                </div>
            </div>

            {/* Mission Data Overview Table */}
            {(state.takeoffResults || state.landingResults || state.descentResults) && (
                <Card title="Mission Reference Data" className="mt-4 border-t border-slate-700">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-400">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-900/50">
                                <tr>
                                    <th className="px-4 py-3 rounded-tl-lg">Phase</th>
                                    <th className="px-4 py-3">Rwy/Target</th>
                                    <th className="px-4 py-3">Input</th>
                                    <th className="px-4 py-3">Weight/Alt</th>
                                    <th className="px-4 py-3 text-sky-400">V1/TOD</th>
                                    <th className="px-4 py-3 text-green-400">VR/ROD</th>
                                    <th className="px-4 py-3 text-sky-400">V2</th>
                                    <th className="px-4 py-3 text-emerald-400">VREF</th>
                                    <th className="px-4 py-3 text-white">VAPP</th>
                                    <th className="px-4 py-3 rounded-tr-lg">N1</th>
                                </tr>
                            </thead>
                            <tbody>
                                {state.takeoffResults && (
                                    <tr className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                                        <td className="px-4 py-3 font-bold text-sky-500">TAKEOFF</td>
                                        <td className="px-4 py-3 font-mono">{state.takeoffData.runway}</td>
                                        <td className="px-4 py-3 font-mono">{state.takeoffData.flaps}</td>
                                        <td className="px-4 py-3 font-mono">{(state.takeoffData.weightLbs / 1000).toFixed(1)}k</td>
                                        <td className="px-4 py-3 font-mono font-bold text-sky-400">{state.takeoffResults.v1.toFixed(0)}</td>
                                        <td className="px-4 py-3 font-mono font-bold text-green-400">{state.takeoffResults.vr.toFixed(0)}</td>
                                        <td className="px-4 py-3 font-mono font-bold text-sky-400">{state.takeoffResults.v2.toFixed(0)}</td>
                                        <td className="px-4 py-3 font-mono opacity-20">-</td>
                                        <td className="px-4 py-3 font-mono opacity-20">-</td>
                                        <td className="px-4 py-3 font-mono text-orange-400">{state.takeoffResults.n1.toFixed(1)}%</td>
                                    </tr>
                                )}
                                {state.descentResults && (
                                    <tr className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                                        <td className="px-4 py-3 font-bold text-purple-500">DESCENT</td>
                                        <td className="px-4 py-3 font-mono">{state.descentData.targetAlt}ft</td>
                                        <td className="px-4 py-3 font-mono">{state.descentData.speed}kts</td>
                                        <td className="px-4 py-3 font-mono">{(state.descentData.cruiseAlt / 1000).toFixed(0)}k</td>
                                        <td className="px-4 py-3 font-mono font-bold text-purple-400">{state.descentResults.distance}nm</td>
                                        <td className="px-4 py-3 font-mono font-bold text-white">-{state.descentResults.rateOfDescent}</td>
                                        <td className="px-4 py-3 font-mono opacity-20">-</td>
                                        <td className="px-4 py-3 font-mono opacity-20">-</td>
                                        <td className="px-4 py-3 font-mono opacity-20">-</td>
                                        <td className="px-4 py-3 font-mono opacity-20">-</td>
                                    </tr>
                                )}
                                {state.landingResults && (
                                    <tr className="hover:bg-slate-800/20 transition-colors">
                                        <td className="px-4 py-3 font-bold text-emerald-500">LANDING</td>
                                        <td className="px-4 py-3 font-mono">{state.landingData.runway}</td>
                                        <td className="px-4 py-3 font-mono">{state.landingData.flaps}</td>
                                        <td className="px-4 py-3 font-mono">{(state.landingData.landingWeightLbs / 1000).toFixed(1)}k</td>
                                        <td className="px-4 py-3 font-mono opacity-20">-</td>
                                        <td className="px-4 py-3 font-mono opacity-20">-</td>
                                        <td className="px-4 py-3 font-mono opacity-20">-</td>
                                        <td className="px-4 py-3 font-mono font-bold text-emerald-400">{state.landingResults.vref.toFixed(0)}</td>
                                        <td className="px-4 py-3 font-mono font-bold text-white">{state.landingResults.vapp.toFixed(0)}</td>
                                        <td className="px-4 py-3 font-mono opacity-20">-</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
};
