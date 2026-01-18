import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    suffix?: string;
    containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, suffix, className = '', containerClassName = '', ...props }) => {
    return (
        <div className={`flex flex-col gap-1 ${containerClassName}`}>
            {label && <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">{label}</label>}
            <div className="relative group">
                <input
                    className={`w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 transition-all font-mono ${className}`}
                    {...props}
                />
                {suffix && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-mono pointer-events-none">
                        {suffix}
                    </span>
                )}
            </div>
            {error && <span className="text-xs text-red-500 ml-1">{error}</span>}
        </div>
    );
};
