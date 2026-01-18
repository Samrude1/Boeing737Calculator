import React, { useState } from 'react';
import { Check, RotateCcw, ChevronDown, ChevronRight, CheckSquare } from 'lucide-react';
import { Card } from './ui/Card';
import { ChecklistCategory } from '../types';

interface ChecklistViewProps {
    checklists: ChecklistCategory[];
    onToggle: (categoryId: string, itemId: string) => void;
    onReset: () => void;
}

export const ChecklistView: React.FC<ChecklistViewProps> = ({ checklists, onToggle, onReset }) => {
    const [expandedCategory, setExpandedCategory] = useState<string | null>('preflight');

    const toggleCategory = (id: string) => {
        setExpandedCategory(expandedCategory === id ? null : id);
    };

    const getProgress = (category: ChecklistCategory) => {
        const completed = category.items.filter(i => i.checked).length;
        return { completed, total: category.items.length, percentage: (completed / category.items.length) * 100 };
    };

    const overallProgress = () => {
        let totalItems = 0;
        let completedItems = 0;
        checklists.forEach(c => {
            totalItems += c.items.length;
            completedItems += c.items.filter(i => i.checked).length;
        });
        return Math.round((completedItems / totalItems) * 100);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <CheckSquare className="text-sky-500" />
                    Checklists
                </h2>
                <div className="flex items-center gap-4">
                    <div className="text-sm font-mono text-slate-400">
                        OVERALL: <span className="text-white font-bold">{overallProgress()}%</span>
                    </div>
                    <button
                        onClick={onReset}
                        className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors"
                    >
                        <RotateCcw size={14} /> RESET ALL
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {checklists.map(category => {
                    const stats = getProgress(category);
                    const isComplete = stats.completed === stats.total;
                    const isExpanded = expandedCategory === category.id;

                    return (
                        <Card key={category.id} className={`overflow-hidden transition-all duration-300 border ${isComplete ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-slate-800 bg-slate-900/50'}`}>
                            {/* Header */}
                            <button
                                onClick={() => toggleCategory(category.id)}
                                className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${isComplete ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                                        {isComplete ? <Check size={18} strokeWidth={3} /> : (isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />)}
                                    </div>
                                    <div className="text-left">
                                        <div className={`font-bold text-lg tracking-wide ${isComplete ? 'text-emerald-400' : 'text-slate-200'}`}>
                                            {category.title}
                                        </div>
                                        <div className="text-xs text-slate-500 font-mono mt-1">
                                            {stats.completed}/{stats.total} COMPLETED
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${isComplete ? 'bg-emerald-500' : 'bg-sky-500'}`}
                                        style={{ width: `${stats.percentage}%` }}
                                    ></div>
                                </div>
                            </button>

                            {/* Items */}
                            {isExpanded && (
                                <div className="border-t border-slate-800/50 bg-slate-950/30">
                                    {category.items.map(item => (
                                        <div
                                            key={item.id}
                                            onClick={() => onToggle(category.id, item.id)}
                                            className="flex items-center justify-between p-4 border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 cursor-pointer group"
                                        >
                                            <span className={`font-medium transition-colors ${item.checked ? 'text-slate-400 line-through decoration-slate-600' : 'text-slate-200 group-hover:text-white'}`}>
                                                {item.label}
                                            </span>

                                            <div className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${item.checked
                                                    ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                                                    : 'border-slate-600 bg-slate-900 group-hover:border-slate-400'
                                                }`}>
                                                {item.checked && <Check size={14} className="text-white" strokeWidth={4} />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};
