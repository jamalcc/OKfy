
import React from 'react';

interface NavbarProps {
  searchQuery?: string;
  setSearchQuery: (q: string) => void;
  activeTab: 'kanban' | 'dashboard';
  setActiveTab: (tab: 'kanban' | 'dashboard') => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onCreateLead: () => void;
  onOpenAI?: () => void; // Nova prop para IA
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery = '',
  setSearchQuery,
  activeTab,
  setActiveTab,
  isDarkMode,
  toggleTheme,
  onCreateLead,
  onOpenAI
}) => {
  // Paleta de Cores Atualizada (Preto & Amarelo #E29D1B)
  const bgCard = isDarkMode ? 'bg-[#121212]' : 'bg-white';
  const borderSubtle = isDarkMode ? 'border-neutral-800' : 'border-slate-200';
  const textMuted = isDarkMode ? 'text-slate-500' : 'text-slate-500';
  
  // Brand Color
  const bgBrand = isDarkMode ? 'bg-[#E29D1B]' : 'bg-[#233F93]';
  const textBrand = isDarkMode ? 'text-[#E29D1B]' : 'text-[#233F93]';
  const textBrandContrast = isDarkMode ? 'text-black' : 'text-white';

  return (
    <nav className={`${bgCard} border-b ${borderSubtle} px-6 py-2 flex items-center justify-between sticky top-0 z-40 h-[60px] flex-shrink-0 transition-colors duration-300`}>
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-sm ${bgBrand} ${textBrandContrast}`}>
          <i className="fas fa-check text-xs"></i>
        </div>
        <span className="text-sm font-bold tracking-tight">
          OKfy <span className={`${textMuted} font-normal`}>| Workspace A</span>
        </span>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-lg mx-auto px-6 hidden md:block">
        <div className="relative group">
          <i className={`fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[10px] ${textMuted}`}></i>
          <input 
            type="text" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder="Buscar leads por nome, CPF ou ID..." 
            className={`w-full ${isDarkMode ? 'bg-[#1E1E1E] focus:bg-[#252525]' : 'bg-slate-50'} border ${borderSubtle} rounded-full py-2 pl-9 pr-4 text-xs outline-none transition-all focus:border-opacity-50 ${isDarkMode ? 'focus:border-[#E29D1B]' : 'focus:border-[#233F93]'}`} 
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        
        {/* Botão IA (Novo) */}
        {onOpenAI && (
          <button 
            onClick={onOpenAI}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'bg-[#E29D1B]/10 text-[#E29D1B] hover:bg-[#E29D1B]/20' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
            title="Gerar Fluxo com IA"
          >
            <i className="fas fa-wand-magic-sparkles text-xs"></i>
          </button>
        )}

        <button onClick={toggleTheme} className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-500/10 transition-colors">
          <i className={`fas ${isDarkMode ? 'fa-sun text-[#E29D1B]' : 'fa-moon'}`}></i>
        </button>
        
        <div className={`hidden lg:flex p-1 rounded-xl border ${borderSubtle} ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-slate-50'}`}>
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${activeTab === 'dashboard' ? `${isDarkMode ? 'bg-[#E29D1B] text-black' : 'bg-white shadow-sm text-[#233F93]'}` : `${textMuted} hover:opacity-80`}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('kanban')} 
            className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${activeTab === 'kanban' ? `${isDarkMode ? 'bg-[#E29D1B] text-black' : 'bg-white shadow-sm text-[#233F93]'}` : `${textMuted} hover:opacity-80`}`}
          >
            Kanban
          </button>
        </div>

        <button 
          onClick={onCreateLead} 
          className={`px-4 py-2 rounded-xl text-[11px] font-black shadow-lg shadow-black/5 hover:translate-y-[-1px] active:translate-y-[1px] transition-all ${bgBrand} ${textBrandContrast} uppercase tracking-wide`}
        >
          + Novo Lead
        </button>
      </div>
    </nav>
  );
};
