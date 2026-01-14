
import React from 'react';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeTab: 'kanban' | 'dashboard';
  setActiveTab: (tab: 'kanban' | 'dashboard') => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onCreateLead: () => void;
  onOpenAI?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  isDarkMode,
  toggleTheme,
  onCreateLead,
  onOpenAI
}) => {
  const bgNav = isDarkMode ? 'bg-[#1E293B]' : 'bg-white';
  const borderNav = isDarkMode ? 'border-slate-800' : 'border-slate-200';

  return (
    <nav className={`${bgNav} ${borderNav} border-b px-8 py-3 flex items-center justify-between z-40 transition-all duration-300`}>
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
          Workspace Principal
          <i className="fas fa-chevron-down text-[10px] text-slate-400"></i>
        </h1>
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
        <div className="flex items-center gap-1">
          <button className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center text-slate-400">
            <i className="fas fa-star text-xs"></i>
          </button>
          <button className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center text-slate-400">
            <i className="fas fa-bell text-xs"></i>
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-xl mx-8">
        <div className="relative group">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs transition-colors group-focus-within:text-indigo-500"></i>
          <input 
            type="text" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder="Pesquisar leads, CPF ou emails..." 
            className={`w-full py-2.5 pl-10 pr-4 rounded-xl text-xs font-medium outline-none border transition-all
            ${isDarkMode 
              ? 'bg-slate-900 border-slate-700 focus:border-indigo-500' 
              : 'bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-200 focus:shadow-sm'}`} 
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onOpenAI && (
          <button 
            onClick={onOpenAI}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600/10 text-indigo-500 text-xs font-black transition-all hover:bg-indigo-600/20"
          >
            <i className="fas fa-magic"></i>
            IA DESIGNER
          </button>
        )}
        <button 
          onClick={onCreateLead} 
          className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-black shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          + NOVO LEAD
        </button>
      </div>
    </nav>
  );
};
