import React, { useState } from 'react';
import { Plane, CloudRain, MessageSquare, Settings, Menu, BookOpen, CheckSquare, Moon, Sun } from 'lucide-react';
import { ViewState } from '../types';

interface LayoutProps {
    children: React.ReactNode;
    currentView: ViewState;
    onViewChange: (view: ViewState) => void;
    theme: 'day' | 'night';
    onThemeToggle: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange, theme, onThemeToggle }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false); // Start collapsed on mobile

    const NavItem = ({ view, icon: Icon, label }: { view: ViewState | 'SETTINGS'; icon: any; label: string }) => (
        <button
            onClick={() => view !== 'SETTINGS' && onViewChange(view as ViewState)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === view
                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.15)]'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
        >
            <Icon size={20} />
            {sidebarOpen && <span className="font-bold text-sm tracking-wide">{label}</span>}
        </button>
    );

    return (
        <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-200 font-sans transition-colors duration-500">
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-64' : 'w-16 md:w-20'} bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 z-20 flex-shrink-0`}>
                <div className="p-6 flex items-center justify-between border-b border-slate-800/50">
                    {sidebarOpen ? (
                        <div className="flex items-center gap-2 text-sky-400">
                            <Plane className="rotate-[-45deg]" strokeWidth={2.5} />
                            <h1 className="font-bold text-xl tracking-tight text-white">SkyGuide</h1>
                        </div>
                    ) : (
                        <div className="w-full flex justify-center text-sky-400"><Plane className="rotate-[-45deg]" /></div>
                    )}

                    <div className="flex items-center gap-2">
                        {/* Theme Toggle */}
                        {sidebarOpen && (
                            <button onClick={onThemeToggle} className="text-slate-500 hover:text-amber-400 transition-colors">
                                {theme === 'day' ? <Moon size={18} /> : <Sun size={18} />}
                            </button>
                        )}
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-500 hover:text-white">
                            <Menu size={20} />
                        </button>
                    </div>
                </div>

                <nav className="flex-1 p-4 flex flex-col gap-2">
                    <div className="mb-4 text-xs font-bold text-slate-600 uppercase tracking-wider px-4">Flight Deck</div>
                    <NavItem view="FLIGHTPLAN" icon={Plane} label="Flight Plan" />
                    <NavItem view="WEATHER" icon={CloudRain} label="Weather" />
                    <NavItem view="PERFORMANCE" icon={Plane} label="Performance" />
                    <NavItem view="CHECKLIST" icon={CheckSquare} label="Checklists" />
                    <div className="my-4 border-t border-slate-800/50"></div>
                    <NavItem view="LIBRARY" icon={BookOpen} label="Documents" />
                    <NavItem view="AI_COPILOT" icon={MessageSquare} label="AI Co-Pilot" />
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className={`flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 ${!sidebarOpen && 'justify-center'}`}>
                        <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-xs shadow-lg">
                            C
                        </div>
                        {sidebarOpen && (
                            <div className="overflow-hidden">
                                <div className="text-sm font-bold text-white truncate">Captain</div>
                                <div className="text-xs text-slate-500 truncate">B737-800 Rated</div>
                            </div>
                        )}
                        {sidebarOpen && <Settings className="ml-auto text-slate-500 hover:text-white cursor-pointer" size={16} />}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative min-w-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 pointer-events-none"></div>
                <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};
