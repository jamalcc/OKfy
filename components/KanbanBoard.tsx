
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
  formatDuration
}) => {
  // Ajuste de cores para Dark Mode: Cards um pouco mais claros que o fundo preto
  const bgCard = isDarkMode ? 'bg-[#18181b]' : 'bg-white';
  const borderSubtle = isDarkMode ? 'border-zinc-800' : 'border-slate-200';
  const textMuted = isDarkMode ? 'text-zinc-500' : 'text-slate-500';
  const textMain = isDarkMode ? 'text-zinc-200' : 'text-slate-900';
  const iconColor = isDarkMode ? 'text-[#E29D1B]' : 'text-[#233F93]';

  return (
    <div className="flex-1 flex gap-6 overflow-x-auto p-6 items-start scrollbar-thin">
      {phases.map((phase, idx) => (
        <div 
          key={idx} 
          className={`min-w-[320px] w-[320px] flex flex-col h-full rounded-2xl border p-1 transition-colors ${isDarkMode ? 'bg-black/20 border-zinc-900' : 'bg-slate-100/50 border-slate-200'}`}
          onDragOver={(e) => { e.preventDefault(); setDropTargetPhase(phase.name); }}
          onDragLeave={() => setDropTargetPhase(null)}
          onDrop={(e) => onDrop(e, phase.name)}
        >
          {/* Header da Coluna */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-transparent">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ backgroundColor: phase.color }}></div>
              <span className="text-[11px] font-black uppercase tracking-widest">{phase.name}</span>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-white text-slate-600'}`}>
              {cards.filter(c => c.phaseName === phase.name).length}
            </span>
          </div>

          {/* Área de Cards */}
          <div className={`flex-1 overflow-y-auto px-2 pb-2 rounded-xl transition-all duration-300 scrollbar-thin ${dropTargetPhase === phase.name ? 'bg-indigo-500/5 ring-2 ring-indigo-500/20 ring-dashed' : ''}`}>
            <div className="space-y-3 mt-2">
              {cards.filter(c => c.phaseName === phase.name).map(card => {
                const isDragging = card.id === draggedCardId;
                return (
                  <div 
                    key={card.id} 
                    draggable 
                    onDragStart={(e) => onDragStart(e, card.id)} 
                    onClick={() => onCardClick(card)} 
                    className={`${bgCard} p-5 rounded-xl border ${borderSubtle} shadow-sm cursor-pointer transition-all duration-200 group
                      ${isDragging 
                        ? 'opacity-50 rotate-3 scale-105 shadow-2xl ring-2 ring-indigo-500 z-50' 
                        : `hover:shadow-lg hover:border-opacity-50 hover:translate-y-[-2px] ${isDarkMode ? 'hover:border-[#E29D1B]' : 'hover:border-[#233F93]'}`}`}
                  >
                    {/* Cabeçalho do Card */}
                    <div className="flex justify-between items-start mb-3">
                        <h4 className={`font-bold text-base leading-snug ${textMain}`}>{card.title}</h4>
                        {isDarkMode && <i className={`fas fa-chevron-right text-[10px] opacity-0 group-hover:opacity-100 transition-opacity ${iconColor}`}></i>}
                    </div>

                    {/* Dados Principais (Expandido) */}
                    <div className="space-y-1.5 mb-4">
                        <div className="flex items-center gap-2">
                             <i className={`fas fa-id-card text-[10px] w-4 text-center ${textMuted}`}></i>
                             <span className={`text-xs font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>{card.data.cpf || 'CPF n/a'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <i className={`fas fa-phone text-[10px] w-4 text-center ${textMuted}`}></i>
                             <span className={`text-xs font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>{card.data.phone || 'Tel n/a'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <i className={`far fa-calendar text-[10px] w-4 text-center ${textMuted}`}></i>
                             <span className={`text-[10px] font-semibold uppercase tracking-wide ${textMuted}`}>
                                Incluído em: {new Date(card.createdAt).toLocaleDateString()}
                             </span>
                        </div>
                    </div>

                    {/* Rodapé do Card */}
                    <div className={`flex items-center justify-between pt-3 border-t ${isDarkMode ? 'border-zinc-800' : 'border-slate-100'}`}>
                      <div className={`text-[10px] font-bold ${textMuted} flex items-center gap-1.5`}>
                        <i className={`far fa-clock ${isDarkMode ? 'text-[#E29D1B]' : 'text-[#233F93]'}`}></i>
                        {formatDuration(Date.now() - card.phaseUpdatedAt)} na fase
                      </div>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-slate-500'}`}>
                        {card.data.source}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
