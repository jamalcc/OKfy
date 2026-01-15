
import React from 'react';
import { Card, Phase } from '../types';

interface KanbanBoardProps {
  phases: Phase[];
  cards: Card[];
  isDarkMode: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDrop: (e: React.DragEvent, phaseName: string) => void;
  onCardClick: (card: Card) => void;
  draggedCardId: string | null;
  dropTargetPhase: string | null;
  setDropTargetPhase: (phase: string | null) => void;
  formatDuration: (ms: number) => string;
  onQuickAdd?: (phaseName: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  phases,
  cards,
  isDarkMode,
  onDragStart,
  onDrop,
  onCardClick,
  draggedCardId,
  dropTargetPhase,
  setDropTargetPhase,
  formatDuration,
  onQuickAdd
}) => {
  // Paleta Dark Mode: Slate Theme + Yellow Accents
  // Coluna um pouco mais clara que o fundo base
  const bgColumn = isDarkMode ? 'bg-[#1E293B]' : 'bg-slate-200/40';
  
  // Card base
  const bgCard = isDarkMode ? 'bg-[#0F172A]' : 'bg-white';
  
  // Bordas
  const borderCard = isDarkMode ? 'border-slate-700' : 'border-slate-200';
  
  const textPrimary = isDarkMode ? 'text-slate-100' : 'text-slate-800';
  const textMuted = isDarkMode ? 'text-slate-500' : 'text-slate-500';
  
  return (
    <div className="h-full flex gap-4 overflow-x-auto p-6 items-start scrollbar-thin">
      {phases.map((phase, idx) => {
        const phaseCards = cards.filter(c => c.phaseName === phase.name);
        
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
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>
                  {phase.name}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-white/5 text-slate-400' : 'bg-slate-500/10 text-slate-500'}`}>
                  {phaseCards.length}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => onQuickAdd && onQuickAdd(phase.name)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${textMuted} hover:bg-white/10 hover:text-emerald-500`}
                  title="Adicionar Novo Lead"
                >
                  <i className="fas fa-plus text-xs"></i>
                </button>
                <button className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${textMuted} hover:bg-white/10 hover:text-white`}>
                  <i className="fas fa-ellipsis-h text-xs"></i>
                </button>
              </div>
            </div>

            {/* ÁREA DE DROPPING */}
            <div className={`flex-1 overflow-y-auto px-3 pb-3 min-h-[100px] transition-all scrollbar-thin ${dropTargetPhase === phase.name ? (isDarkMode ? 'bg-[#E1A030]/10 ring-2 ring-[#E1A030]/20 ring-inset rounded-b-2xl' : 'bg-[#001F8D]/5 ring-2 ring-[#001F8D]/20 ring-inset rounded-b-2xl') : ''}`}>
              <div className="space-y-3 pt-2">
                {phaseCards.map(card => {
                  const isDragging = card.id === draggedCardId;

                  return (
                    <div 
                      key={card.id} 
                      draggable 
                      onDragStart={(e) => onDragStart(e, card.id)} 
                      onClick={() => onCardClick(card)} 
                      className={`${bgCard} relative p-5 rounded-xl border ${borderCard} shadow-sm cursor-pointer transition-all duration-300 group
                        ${isDragging ? 'opacity-20 scale-95' : `hover:-translate-y-1 hover:shadow-lg ${isDarkMode ? 'hover:border-[#E1A030]/30 hover:shadow-black/40' : ''}`}`}
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
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
