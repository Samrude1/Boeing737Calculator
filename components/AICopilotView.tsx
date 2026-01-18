import React, { useState, useRef, useEffect } from 'react';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { MessageSquare, Send, User, Bot, ShieldCheck, Radio, RefreshCw } from 'lucide-react';
import { sendChatMessage } from '../services/geminiService';
import { fetchReferenceManual } from '../services/aircraftService';
import { WeatherData, FlightPlanData, PerformanceState, ChecklistCategory, ChatMessage } from '../types';
import { AircraftConfig } from '../services/aircraftService';

interface AICopilotViewProps {
    weatherData: WeatherData | null;
    flightPlanData: FlightPlanData | null;
    performanceState: PerformanceState;
    checklists: ChecklistCategory[];
    aircraftConfig: AircraftConfig | null;
    messages: ChatMessage[];
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export const AICopilotView: React.FC<AICopilotViewProps> = ({
    weatherData,
    flightPlanData,
    performanceState,
    checklists,
    aircraftConfig,
    messages,
    setMessages
}) => {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [manualContent, setManualContent] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load Manual
    useEffect(() => {
        const loadManual = async () => {
            const txt = await fetchReferenceManual();
            if (txt) setManualContent(txt);
        };
        loadManual();
    }, []);

    // Build context summary from current flight data
    const buildFlightContext = (): string => {
        const parts: string[] = [];

        // Inject Reference Manual if available
        if (manualContent) {
            parts.push(`AIRCRAFT REFERENCE MANUAL EXCERPT: ${manualContent.substring(0, 3000)}...`);
        }

        if (aircraftConfig) {
            parts.push(`STRUCTURAL LIMITS (B737-800): 
            - MTOW (Max Takeoff): ${aircraftConfig.maxGrossWeight} lbs
            - MLW (Max Landing): ${aircraftConfig.maxLandingWeight} lbs
            - MZFW (Max Zero Fuel): ${aircraftConfig.maxZeroFuelWeight} lbs
            - Empty Weight: ${aircraftConfig.emptyWeight} lbs`);
        }

        if (flightPlanData) {
            parts.push(`FLIGHT PLAN: ${flightPlanData.origin} → ${flightPlanData.dest}, Distance: ${flightPlanData.distance}nm, Fuel Onboard: ${flightPlanData.fuel}lbs (Trip: ${flightPlanData.tripFuel}lbs, Reserve: ${flightPlanData.reserve}lbs), ZFW: ${flightPlanData.zfw}lbs, Gross Weight: ${flightPlanData.gw}lbs, Landing Weight: ${flightPlanData.landingWeight}lbs`);
        }

        if (weatherData) {
            parts.push(`WEATHER at ${weatherData.icao}: OAT ${weatherData.temp}°C, Wind ${weatherData.windDir}°/${weatherData.windSpd}kts, Elevation ${weatherData.alt}ft, QNH ${weatherData.qnh}hPa`);
        }

        // --- FULL PERFORMANCE PROFILE (All Sheets) ---
        parts.push("--- MISSION PERFORMANCE PROFILE ---");

        // 1. Takeoff Sheet
        const t = performanceState.takeoffData;
        const tr = performanceState.takeoffResults;
        parts.push(`[DEPARTURE SHEET] Runway ${t.runway}, Weight ${t.weightLbs}lbs, Flaps ${t.flaps}, Condition: ${t.runwayCondition}. ${tr ? `Calculated: V1=${Math.round(tr.v1)}, Vr=${Math.round(tr.vr)}, V2=${Math.round(tr.v2)}, N1=${tr.n1.toFixed(1)}%` : '(Not yet calculated)'}`);

        // 2. Descent Sheet
        if (performanceState.descentResults) {
            const dr = performanceState.descentResults;
            parts.push(`[ENROUTE/DESCENT SHEET] TOD at ${dr.tod}, Start in ${dr.timeToDescent} mins, Rate: ${dr.rateOfDescent} ft/min.`);
        }

        // 3. Landing Sheet
        const l = performanceState.landingData;
        const lr = performanceState.landingResults;
        parts.push(`[ARRIVAL SHEET] Runway ${l.runway}, Weight ${l.landingWeightLbs}lbs, Flaps ${l.flaps}. ${lr ? `Calculated: Vref=${Math.round(lr.vref)}, Vapp=${Math.round(lr.vapp)}` : '(Not yet calculated)'}`);

        parts.push("--- END PROFILE ---");

        // Checklist Context
        if (checklists && checklists.length > 0) {
            const checklistStatus = checklists.map(cat => {
                const completed = cat.items.filter(i => i.checked).length;
                const total = cat.items.length;
                const status = completed === total ? 'COMPLETED' : `${completed}/${total}`;
                return `${cat.title}: ${status}`;
            });
            parts.push(`CHECKLIST STATUS: ${checklistStatus.join(', ')}`);
        }

        return parts.length > 0 ? parts.join('\n\n') : 'No flight data entered yet.';
    };

    const handleSend = async (overrideText?: string) => {
        const textToSend = overrideText || input;
        if (!textToSend.trim()) return;

        // Add user message
        const newHistory = [...messages, { role: 'user' as const, text: textToSend }];
        setMessages(newHistory);
        setInput('');
        setLoading(true);

        try {
            // Build Context
            const flightContext = buildFlightContext();

            // Format for Gemini
            const apiHistory = newHistory.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));

            const responseText = await sendChatMessage(apiHistory as any, textToSend, flightContext);

            setMessages(prev => [...prev, { role: 'model', text: responseText }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'model', text: "I lost contact with the server. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAction = (action: 'SAFETY' | 'ATC') => {
        if (action === 'SAFETY') {
            const dist = flightPlanData?.distance || 250;
            handleSend(`Please perform a technical safety check on my current flight. Check our calculated weights against our structural limits (MTOW/MLW/MZFW), analyze our fuel onboard against our trip distance (${dist}nm) for sufficient reserves, and verify if 8000ft is sufficient for our V-Speeds and weight.`);
        } else if (action === 'ATC') {
            handleSend(`Act as FSX ATC (Ground Control). I am at ${flightPlanData?.origin || 'ORIGIN'} and requesting IFR clearance to ${flightPlanData?.dest || 'DEST'}. Ready to copy.`);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-900/50 rounded-xl overflow-hidden animate-in fade-in duration-500 border border-slate-800">
            {/* Header */}
            <div className="bg-slate-900 p-4 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center border border-sky-500/30">
                        <Bot className="text-sky-400" size={24} />
                    </div>
                    <div>
                        <div className="font-bold text-slate-200">AI Co-Pilot</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Online • Context Active
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-sky-500/20 text-sky-400'}`}>
                            {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                        </div>
                        <div className={`p-3 rounded-2xl max-w-[80%] text-sm leading-relaxed ${msg.role === 'user'
                            ? 'bg-indigo-600 text-white rounded-tr-sm'
                            : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700'
                            }`}>
                            <div className="whitespace-pre-line">{msg.text}</div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400">
                            <Bot size={16} />
                        </div>
                        <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-sm border border-slate-700 flex gap-1">
                            <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100"></span>
                            <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3">
                {/* Quick Actions */}
                <div className="flex gap-2 justify-center flex-wrap">
                    <Button variant="ghost" className="text-xs text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20" onClick={() => handleSend("I have updated our mission parameters. Please look at our current flight plan and performance sheets and confirm you have the latest data.")}>
                        <RefreshCw size={14} className="mr-1" /> Sync Flight Data
                    </Button>
                    <Button variant="ghost" className="text-xs text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20" onClick={() => handleQuickAction('SAFETY')}>
                        <ShieldCheck size={14} className="mr-1" /> Safety Check
                    </Button>
                    <Button variant="ghost" className="text-xs text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20" onClick={() => handleQuickAction('ATC')}>
                        <Radio size={14} className="mr-1" /> ATC Practice
                    </Button>
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask about weather, performance, or flight plan..."
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 placeholder:text-slate-500"
                        disabled={loading}
                    />
                    <Button onClick={() => handleSend()} disabled={loading || !input.trim()}>
                        <Send size={18} />
                    </Button>
                </div>
            </div>
        </div>
    );
};
