
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
  activeModule: 'commercial' | 'legal';
  setActiveModule: (m: 'commercial' | 'legal') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  isDarkMode,
  toggleTheme,
  onCreateLead,
  onOpenAI,
  activeModule,
  setActiveModule
}) => {
  // Ajuste para tons de Slate Escuro
  const bgNav = isDarkMode ? 'bg-[#0F172A]' : 'bg-white';
  const borderNav = isDarkMode ? 'border-slate-800' : 'border-slate-200';
  const textPrimary = isDarkMode ? 'text-slate-100' : 'text-slate-900';
  const iconColor = isDarkMode ? 'text-slate-500 hover:bg-white/10 hover:text-white' : 'text-slate-400 hover:bg-slate-100';

  return (
    <nav className={`${bgNav} ${borderNav} border-b px-8 py-3 flex items-center justify-between z-40 transition-all duration-300`}>
      <div className="flex items-center gap-6">
        <div className="relative group cursor-pointer">
            <h1 className={`text-xl font-black tracking-tight flex items-center gap-2 ${textPrimary}`}>
              {activeModule === 'commercial' ? 'Comercial' : 'Jurídico'}
              <i className="fas fa-chevron-down text-[10px] opacity-40 group-hover:opacity-100 transition-opacity"></i>
            </h1>
            
            {/* Dropdown de Módulos */}
            <div className={`absolute top-full left-0 mt-2 w-48 py-2 rounded-xl shadow-2xl border invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all z-50 ${isDarkMode ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-200'}`}>
                <button 
                    onClick={() => setActiveModule('commercial')}
                    className={`w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-between ${activeModule === 'commercial' ? (isDarkMode ? 'text-[#E1A030] bg-white/5' : 'text-[#001F8D] bg-slate-50') : (isDarkMode ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-50')}`}
                >
                    <span>Comercial</span>
                    {activeModule === 'commercial' && <i className="fas fa-check"></i>}
                </button>
                <button 
                    onClick={() => setActiveModule('legal')}
                    className={`w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-between ${activeModule === 'legal' ? (isDarkMode ? 'text-[#E1A030] bg-white/5' : 'text-[#001F8D] bg-slate-50') : (isDarkMode ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-50')}`}
                >
                    <span>Jurídico</span>
                    {activeModule === 'legal' && <i className="fas fa-check"></i>}
                </button>
            </div>
        </div>

        <div className={`h-6 w-px ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
        
        <div className="flex items-center gap-1">
          <button className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${iconColor}`}>
            <i className="fas fa-star text-xs"></i>
          </button>
          <button className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${iconColor}`}>
            <i className="fas fa-bell text-xs"></i>
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-xl mx-8">
        <div className="relative group">
          <i className={`fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-xs transition-colors ${isDarkMode ? 'text-slate-500 group-focus-within:text-[#E1A030]' : 'text-slate-400 group-focus-within:text-[#001F8D]'}`}></i>
          <input 
            type="text" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder="Pesquisar..." 
            className={`w-full py-2.5 pl-10 pr-4 rounded-xl text-xs font-medium outline-none border transition-all
            ${isDarkMode 
              ? 'bg-[#1E293B] border-slate-700 focus:border-[#E1A030] text-slate-200 placeholder-slate-500' 
              : 'bg-slate-50 border-slate-100 focus:bg-white focus:border-[#001F8D]/30 focus:shadow-sm'}`} 
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {activeModule === 'commercial' && onOpenAI && (
          <button 
            onClick={onOpenAI}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${isDarkMode ? 'bg-[#E1A030]/10 text-[#E1A030] hover:bg-[#E1A030]/20' : 'bg-[#001F8D]/10 text-[#001F8D] hover:bg-[#001F8D]/20'}`}
          >
            <i className="fas fa-magic"></i>
            IA DESIGNER
          </button>
        )}
        <button 
          onClick={onCreateLead} 
          className={`px-6 py-2.5 rounded-xl text-xs font-black shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${isDarkMode ? 'bg-[#E1A030] text-black shadow-[#E1A030]/20' : 'bg-[#001F8D] text-white shadow-[#001F8D]/20'}`}
        >
          {activeModule === 'commercial' ? '+ NOVO LEAD' : '+ NOVO PROCESSO'}
        </button>
      </div>
    </nav>
  );
};
