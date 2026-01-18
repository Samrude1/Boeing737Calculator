import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`glass-panel rounded-xl p-6 ${className}`}>
      {title && (
        <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold mb-4 border-b border-slate-800 pb-2">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};
