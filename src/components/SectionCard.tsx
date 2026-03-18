import React, { useState } from 'react';

interface SectionCardProps {
  title: string;
  id: string;
  children: React.ReactNode;
}

export default function SectionCard({ title, id, children }: SectionCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`bg-white border border-slate-200 rounded-lg shadow-sm mb-6 overflow-hidden ${isCollapsed ? 'collapsed' : ''}`} id={id}>
      <div 
        className="bg-indigo-950 text-white px-5 py-3.5 font-bold text-base flex justify-between items-center cursor-pointer select-none hover:bg-indigo-900 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <span>{title}</span>
        <span className={`text-xs opacity-80 transition-transform duration-300 ${isCollapsed ? '-rotate-90' : ''}`}>▼</span>
      </div>
      {!isCollapsed && (
        <div className="p-6">
          {children}
        </div>
      )}
    </div>
  );
}
