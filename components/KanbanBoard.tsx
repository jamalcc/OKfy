
import React, { useState, useMemo } from 'react';
import { Card, Phase } from '../types';

interface KanbanBoardProps {
  phases: Phase[];
  cards: Card[];
  isDarkMode: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent, phaseName: string) => void;
  onCardClick: (card: Card) => void;
  draggedCardId: string | null;
  dropTargetPhase: string | null;
  setDropTargetPhase: (phase: string | null) => void;
  formatDuration: (ms: number) => string;
  onQuickAdd?: (phaseName: string) => void;
}

type DateFilterType = 'all' | 'today' | 'week' | 'month';

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  phases,
  cards,
  isDarkMode,
  onDragStart,
  onDragEnd,
  onDrop,
  onCardClick,
  draggedCardId,
  dropTargetPhase,
  setDropTargetPhase,
  formatDuration,
  onQuickAdd
}) => {
  // Estado para controlar o filtro selecionado de cada fase
  const [phaseFilters, setPhaseFilters] = useState<Record<string, DateFilterType>>({});
  // Estado para controlar qual menu de filtro está aberto
  const [openFilterMenu, setOpenFilterMenu] = useState<string | null>(null);

  const bgColumn = isDarkMode ? 'bg-[#1E293B]' : 'bg-slate-200/40';
  const bgCard = isDarkMode ? 'bg-[#0F172A]' : 'bg-white';
  const borderCard = isDarkMode ? 'border-slate-700' : 'border-slate-200';
  const textPrimary = isDarkMode ? 'text-slate-100' : 'text-slate-800';
  const textMuted = isDarkMode ? 'text-slate-500' : 'text-slate-500';

  const LIMITED_PHASES = ['FINALIZADO', 'RECUSADO'];
  const MAX_VISIBLE_CARDS = 15;

  const checkDateFilter = (timestamp: number, filter: DateFilterType) => {
    if (filter === 'all') return true;
    
    const date = new Date(timestamp);
    const now = new Date();
    
    // Zera as horas para comparar apenas dias
    const dateZero = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowZero = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (filter === 'today') {
      return dateZero.getTime() === nowZero.getTime();
    }
    
    if (filter === 'week') {
      const dayOfWeek = nowZero.getDay(); // 0 (Dom) a 6 (Sab)
      const firstDayOfWeek = new Date(nowZero);
      firstDayOfWeek.setDate(nowZero.getDate() - dayOfWeek);
      return dateZero >= firstDayOfWeek;
    }

    if (filter === 'month') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }

    return true;
  };

  const getFilterLabel = (type: DateFilterType) => {
    switch(type) {
      case 'today': return 'Hoje';
      case 'week': return 'Esta Semana';
      case 'month': return 'Este Mês';
      default: return 'Todos';
    }
  };

  const handleSetFilter = (phaseName: string, filter: DateFilterType) => {
    setPhaseFilters(prev => ({ ...prev, [phaseName]: filter }));
    setOpenFilterMenu(null);
  };

  return (
    <div 
      className="h-full flex gap-4 overflow-x-auto p-6 items-start scrollbar-thin"
      onClick={() => setOpenFilterMenu(null)} // Fecha menu ao clicar fora
    >
      {phases.map((phase, idx) => {
        // 1. Filtra cards da fase
        const rawPhaseCards = cards.filter(c => c.phaseName === phase.name);
        
        // 2. Aplica filtro de data
        const currentFilter = phaseFilters[phase.name] || 'all';
        const dateFilteredCards = rawPhaseCards.filter(c => checkDateFilter(c.phaseUpdatedAt, currentFilter));

        // 3. Ordena por mais recente (phaseUpdatedAt decrescente)
        dateFilteredCards.sort((a, b) => b.phaseUpdatedAt - a.phaseUpdatedAt);

        // 4. Aplica limite para fases específicas (apenas visualização)
        const isLimited = LIMITED_PHASES.includes(phase.name);
        const visibleCards = isLimited ? dateFilteredCards.slice(0, MAX_VISIBLE_CARDS) : dateFilteredCards;
        const hiddenCount = dateFilteredCards.length - visibleCards.length;

        const isMenuOpen = openFilterMenu === phase.name;

        return (
          <div 
            key={idx} 
            className={`flex-shrink-0 w-80 flex flex-col max-h-full rounded-2xl transition-all duration-300 ${bgColumn}`}
            onDragOver={(e) => { e.preventDefault(); setDropTargetPhase(phase.name); }}
            onDragLeave={() => setDropTargetPhase(null)}
            onDrop={(e) => onDrop(e, phase.name)}
          >
            {/* FAIXA COLORIDA TOP */}
            <div className="h-1 rounded-t-2xl w-full" style={{ backgroundColor: phase.color }}></div>

            {/* HEADER COLUNA */}
            <div className="px-5 py-4 flex items-center justify-between relative">
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>
                  {phase.name}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-white/5 text-slate-400' : 'bg-slate-500/10 text-slate-500'}`}>
                  {rawPhaseCards.length}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                {/* Botão de Filtro */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button 
                        onClick={() => setOpenFilterMenu(isMenuOpen ? null : phase.name)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${currentFilter !== 'all' ? (isDarkMode ? 'bg-[#E1A030] text-black' : 'bg-[#001F8D] text-white') : (textMuted + ' hover:bg-white/10 hover:text-white')}`}
                        title="Filtrar por data"
                    >
                        <i className="fas fa-filter text-xs"></i>
                    </button>
                    
                    {isMenuOpen && (
                        <div className={`absolute right-0 top-8 w-32 rounded-xl shadow-xl border z-50 overflow-hidden ${isDarkMode ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-200'}`}>
                            {(['all', 'today', 'week', 'month'] as DateFilterType[]).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => handleSetFilter(phase.name, f)}
                                    className={`w-full text-left px-4 py-2 text-[10px] font-bold uppercase transition-colors ${currentFilter === f ? (isDarkMode ? 'bg-[#E1A030]/10 text-[#E1A030]' : 'bg-[#001F8D]/10 text-[#001F8D]') : (isDarkMode ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-50')}`}
                                >
                                    {getFilterLabel(f)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <button 
                  onClick={() => onQuickAdd && onQuickAdd(phase.name)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${textMuted} hover:bg-white/10 hover:text-emerald-500`}
                  title="Adicionar Novo Lead"
                >
                  <i className="fas fa-plus text-xs"></i>
                </button>
              </div>
            </div>

            {/* ÁREA DE DROPPING */}
            <div className={`flex-1 overflow-y-auto px-3 pb-3 min-h-[100px] transition-all scrollbar-thin ${dropTargetPhase === phase.name ? (isDarkMode ? 'bg-[#E1A030]/10 ring-2 ring-[#E1A030]/20 ring-inset rounded-b-2xl' : 'bg-[#001F8D]/5 ring-2 ring-[#001F8D]/20 ring-inset rounded-b-2xl') : ''}`}>
              <div className="space-y-3 pt-2">
                {visibleCards.map(card => {
                  const isDragging = card.id === draggedCardId;

                  return (
                    <div 
                      key={card.id} 
                      draggable 
                      onDragStart={(e) => onDragStart(e, card.id)} 
                      onDragEnd={onDragEnd}
                      onClick={() => onCardClick(card)} 
                      className={`${bgCard} relative p-5 rounded-xl border ${borderCard} shadow-sm cursor-pointer transition-all duration-300 group
                        ${isDragging ? 'opacity-30 scale-[0.98] border-dashed border-2 ring-2 ring-slate-500/20' : `hover:-translate-y-1 hover:shadow-lg ${isDarkMode ? 'hover:border-[#E1A030]/30 hover:shadow-black/40' : ''}`}`}
                    >
                      {/* Botão Editar (Absolute) */}
                      <button className={`absolute top-4 right-4 opacity-0 group-hover:opacity-100 ${textMuted} hover:text-white transition-all z-10`}>
                         <i className="fas fa-pencil-alt text-[10px]"></i>
                      </button>

                      {/* Título Maior */}
                      <h4 className={`font-black text-base mb-1 leading-snug pr-6 ${textPrimary}`}>
                        {card.title}
                      </h4>

                      {/* CPF */}
                      <div className={`text-[11px] font-mono font-medium mb-4 tracking-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                         {card.data.cpf || 'CPF Pendente'}
                      </div>

                      {/* Origem */}
                      <div className={`flex items-center gap-2 text-[10px] font-bold mb-0 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        <i className={`fas fa-share-nodes ${isDarkMode ? 'text-[#E1A030]' : 'text-[#001F8D]/50'}`}></i>
                        <span className="uppercase tracking-wide">{card.data.source}</span>
                      </div>

                      {/* FOOTER CARD */}
                      <div className={`mt-4 pt-3 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} flex items-center justify-between`}>
                        <div className="flex -space-x-1.5 overflow-hidden">
                           <div className={`inline-block h-6 w-6 rounded-full ring-2 ${isDarkMode ? 'ring-[#0F172A] bg-[#E1A030] text-black' : 'ring-white bg-[#001F8D] text-white'} flex items-center justify-center text-[9px] font-black shadow-sm`}>
                             {card.title.substring(0,2).toUpperCase()}
                           </div>
                        </div>
                        <div className={`text-[9px] font-bold ${textMuted} flex items-center gap-1.5`}>
                          <i className="far fa-clock"></i>
                          {formatDuration(Date.now() - card.phaseUpdatedAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Mensagem de Limite Atingido */}
                {isLimited && hiddenCount > 0 && (
                    <div className={`text-center py-4 text-[10px] font-bold uppercase tracking-widest opacity-40 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        + {hiddenCount} cards ocultos
                    </div>
                )}
                
                {/* Mensagem de lista vazia ou filtrada */}
                {visibleCards.length === 0 && (
                    <div className={`text-center py-8 opacity-30 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        <i className="fas fa-inbox text-2xl mb-2"></i>
                        <p className="text-[10px] font-bold uppercase">Nenhum card</p>
                    </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
