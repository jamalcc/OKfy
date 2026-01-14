
import React from 'react';

interface SidebarProps {
  activeTab: 'kanban' | 'dashboard';
  setActiveTab: (tab: 'kanban' | 'dashboard') => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onCreateLead: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isDarkMode, 
  toggleTheme, 
  onCreateLead 
}) => {
  const bgCard = isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white';
  const borderSubtle = isDarkMode ? 'border-neutral-800' : 'border-slate-200';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const activeClass = isDarkMode ? 'bg-neutral-800 text-[#DD971E]' : 'bg-slate-100 text-[#233F93]';

  return (
    <aside className={`w-20 lg:w-64 flex-shrink-0 flex flex-col border-r ${borderSubtle} ${bgCard} transition-all duration-300`}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-inherit">
        <div className="w-8 h-8 rounded bg-[#233F93] flex items-center justify-center text-white shrink-0">
          <i className="fas fa-check text-xs"></i>
        </div>
        <span className="hidden lg:block ml-3 font-bold text-sm tracking-tight">
          OKfy <span className="font-normal opacity-50">| A</span>
        </span>
      </div>

      {/* Nav Actions */}
      <nav className="flex-1 p-4 space-y-2">
        <button 
          onClick={() => setActiveTab('kanban')}
          className={`w-full flex items-center justify-center lg:justify-start px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'kanban' ? activeClass : textMuted}`}
        >
          <i className="fas fa-columns w-5 text-center"></i>
          <span className="hidden lg:block ml-3">Kanban</span>
        </button>

        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`w-full flex items-center justify-center lg:justify-start px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? activeClass : textMuted}`}
        >
          <i className="fas fa-chart-pie w-5 text-center"></i>
          <span className="hidden lg:block ml-3">IA Dashboard</span>
        </button>
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-inherit space-y-4">
        <button 
          onClick={onCreateLead}
          className="w-full flex items-center justify-center py-3 rounded-lg bg-[#233F93] text-white hover:opacity-90 transition-opacity shadow-lg group"
        >
          <i className="fas fa-plus"></i>
          <span className="hidden lg:block ml-2 text-xs font-bold uppercase tracking-wider">Novo Lead</span>
        </button>

        <button 
          onClick={toggleTheme}
          className={`w-full flex items-center justify-center lg:justify-start px-3 py-2 rounded-lg text-xs font-medium ${textMuted} hover:bg-slate-100/10`}
        >
          <i className={`fas ${isDarkMode ? 'fa-sun text-yellow-500' : 'fa-moon'} w-5 text-center`}></i>
          <span className="hidden lg:block ml-3">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
    </aside>
  );
};
