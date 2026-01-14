
import React from 'react';

interface Props {
  title: string;
  icon: string;
  children: React.ReactNode;
}

const ArchitectureSection: React.FC<Props> = ({ title, icon, children }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
          <i className={`fas ${icon}`}></i>
        </div>
        <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">{title}</h2>
      </div>
      <div className="p-8 prose prose-slate max-w-none">
        {children}
      </div>
    </div>
  );
};

export default ArchitectureSection;
