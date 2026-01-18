import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Search, CloudRain, Wind, Thermometer, ArrowUp, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { fetchAirportWeather } from '../services/geminiService';
import { WeatherState } from '../types';

interface WeatherViewProps {
    state: WeatherState;
    onUpdate: (state: WeatherState) => void;
    defaultIcao?: string;
}

export const WeatherView: React.FC<WeatherViewProps> = ({ state, onUpdate, defaultIcao }) => {
    const [loading, setLoading] = useState(false);

    // Auto-fill from props if state empty
    useEffect(() => {
        if (!state.searchIcao && defaultIcao) {
            onUpdate({ ...state, searchIcao: defaultIcao });
        }
    }, [defaultIcao]);

    const handleSearch = async () => {
        const icao = state.searchIcao;
        if (!icao || icao.length < 3) return;
        setLoading(true);
        // Reset error/data locally in thought process, but we update state at end or on error
        onUpdate({ ...state, error: null, data: null });

        try {
            const result = await fetchAirportWeather(icao);

            if (result && result.data && (result.data as any).temp !== undefined) {
                const weather = result.data as any;
                onUpdate({
                    ...state,
                    error: null,
                    data: {
                        icao: icao.toUpperCase(),
                        temp: weather.temp,
                        windDir: weather.windDir,
                        windSpd: weather.windSpd,
                        alt: weather.alt,
                        qnh: weather.qnh || 1013
                    },
                    sources: result.sources || []
                });
            } else {
                onUpdate({ ...state, error: "Could not retrieve valid weather data. Please try again.", data: null });
            }
        } catch (e) {
            onUpdate({ ...state, error: "Network or API Error", data: null });
        } finally {
            setLoading(false);
        }
    };

    const WeatherCard = ({ icon: Icon, label, value, unit, color = "text-slate-200" }: any) => (
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center gap-2">
            <div className={`p-2 rounded-full bg-slate-800 ${color}`}>
                <Icon size={20} />
            </div>
            <div className="flex flex-col items-center">
                <span className="text-xs text-slate-500 font-bold uppercase">{label}</span>
                <span className="text-2xl font-bold font-mono">{value !== undefined ? value : '--'}</span>
                <span className="text-[10px] text-slate-600 font-mono">{unit}</span>
            </div>
        </div>
    );

    const { data, error, sources, searchIcao } = state;

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <CloudRain className="text-sky-500" />
                    Weather Station
                </h2>
                <p className="text-slate-500">Real-time METAR grounding for accurate performance calculations.</p>
            </div>

            <Card className="flex flex-col gap-6">
                <div className="flex gap-4">
                    <Input
                        placeholder="Enter ICAO (e.g. KJFK)"
                        value={searchIcao}
                        onChange={e => onUpdate({ ...state, searchIcao: e.target.value.toUpperCase() })}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        className="flex-1 text-lg"
                        label="Airport Search"
                    />
                    <Button onClick={handleSearch} isLoading={loading} className="mt-5 h-[42px] px-6">
                        <Search size={18} /> FETCH
                    </Button>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg flex items-center gap-3">
                        <AlertTriangle size={20} />
                        {error}
                    </div>
                )}
            </Card>

            {data && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <WeatherCard
                        icon={Wind}
                        label="Wind"
                        value={`${data.windDir}° / ${data.windSpd}`}
                        unit="KTS"
                        color="text-sky-400"
                    />
                    <WeatherCard
                        icon={Thermometer}
                        label="Temp"
                        value={data.temp}
                        unit="°CELSIUS"
                        color="text-orange-400"
                    />
                    <WeatherCard
                        icon={ArrowUp}
                        label="Elevation"
                        value={data.alt}
                        unit="FEET"
                        color="text-emerald-400"
                    />
                    <WeatherCard
                        icon={CloudRain}
                        label="QNH"
                        value={data.qnh || 1013}
                        unit="HPA"
                        color="text-purple-400"
                    />
                </div>
            )}

            {sources.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Grounding Sources</h3>
                    <div className="flex flex-wrap gap-2">
                        {sources.map((source: any, idx: number) => (
                            <a
                                key={idx}
                                href={source.web?.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-sky-400 px-3 py-2 rounded-lg text-xs transition-colors border border-slate-800"
                            >
                                <LinkIcon size={12} />
                                {source.web?.title?.substring(0, 20)}...
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
