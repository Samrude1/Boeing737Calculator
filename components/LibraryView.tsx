import React from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { BookOpen, FileText, Download } from 'lucide-react';

const MANUALS = [
    { name: 'FSX Start Guide', file: 'FSX_Start.pdf', desc: 'Steam Edition Setup & FAQ' },
    { name: 'FSX Checklist', file: 'checklist.pdf', desc: 'B737-800 Standard Procedures' },
    { name: 'Quick Reference (QRC)', file: 'FSX_QRC.pdf', desc: 'Key Commands & Shortcuts' },
    { name: 'Insider Information', file: 'fsx_man.pdf', desc: 'Notices & Tips' },
    { name: 'Acceleration Pack', file: 'fsxx_man.pdf', desc: 'Expansion Features' },
    { name: 'Multiplayer Guide', file: 'FSX_Multi.pdf', desc: 'Online Operations' },
];

export const LibraryView: React.FC = () => {
    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold flex items-center gap-3">
                <BookOpen className="text-sky-500" />
                Document Library
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MANUALS.map((manual, idx) => (
                    <Card key={idx} className="hover:border-sky-500/50 transition-colors group cursor-pointer" title="PDF Document">
                        <div className="flex items-start justify-between">
                            <div className="p-3 bg-slate-800 rounded-lg text-slate-400 group-hover:text-sky-400group-hover:bg-sky-500/10 transition-colors">
                                <FileText size={28} />
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-slate-200 mt-4 group-hover:text-sky-400 transition-colors">{manual.name}</h3>
                        <p className="text-sm text-slate-500 mt-1 min-h-[40px]">{manual.desc}</p>

                        <div className="mt-6">
                            <a href={`/manuals/${manual.file}`} target="_blank" rel="noopener noreferrer" className="w-full block">
                                <Button variant="secondary" className="w-full">
                                    <BookOpen size={16} /> OPEN
                                </Button>
                            </a>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
