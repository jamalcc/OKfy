
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
  const bgCard = isDarkMode ? 'bg-[#1E293B]' : 'bg-white';
  const borderSubtle = isDarkMode ? 'border-slate-800' : 'border-slate-200';
  const textMuted = isDarkMode ? 'text-slate-500' : 'text-slate-500';

  return (
    <div className="h-full flex gap-4 overflow-x-auto p-6 items-start scrollbar-thin">
      {phases.map((phase, idx) => {
        const phaseCards = cards.filter(c => c.phaseName === phase.name);
        
        return (
          <div 
            key={idx} 
            className={`flex-shrink-0 w-80 flex flex-col max-h-full rounded-2xl transition-all duration-300 ${isDarkMode ? 'bg-slate-900/40' : 'bg-slate-200/40'}`}
            onDragOver={(e) => { e.preventDefault(); setDropTargetPhase(phase.name); }}
            onDragLeave={() => setDropTargetPhase(null)}
            onDrop={(e) => onDrop(e, phase.name)}
          >
            {/* FAIXA COLORIDA TOP (PIPEFY STYLE) */}
            <div className="h-1 rounded-t-2xl w-full" style={{ backgroundColor: phase.color }}></div>

            {/* HEADER COLUNA */}
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {phase.name}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500">
                  {phaseCards.length}
                </span>
              </div>
              <button className="text-slate-400 hover:text-indigo-500 transition-colors">
                <i className="fas fa-ellipsis-h text-xs"></i>
              </button>
            </div>

            {/* ÁREA DE DROPPING */}
            <div className={`flex-1 overflow-y-auto px-3 pb-3 min-h-[100px] transition-all scrollbar-thin ${dropTargetPhase === phase.name ? 'bg-indigo-500/5 ring-2 ring-indigo-500/20 ring-inset rounded-b-2xl' : ''}`}>
              <div className="space-y-3 pt-2">
                {phaseCards.map(card => {
                  const isDragging = card.id === draggedCardId;
                  
                  // Mock de dados para visual SaaS
                  const priority = ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)];
                  const priorityColors: any = { 
                    High: 'bg-rose-100 text-rose-700', 
                    Medium: 'bg-amber-100 text-amber-700', 
                    Low: 'bg-emerald-100 text-emerald-700' 
                  };

                  return (
                    <div 
                      key={card.id} 
                      draggable 
                      onDragStart={(e) => onDragStart(e, card.id)} 
                      onClick={() => onCardClick(card)} 
                      className={`${bgCard} p-4 rounded-xl border ${borderSubtle} shadow-sm cursor-pointer transition-all duration-300 group
                        ${isDragging ? 'opacity-20 scale-95' : 'hover:-translate-y-1 hover:shadow-lg'}`}
                    >
                      {/* HEADER CARD */}
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${priorityColors[priority]}`}>
                          {priority}
                        </span>
                        <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-500 transition-all">
                          <i className="fas fa-pencil-alt text-[10px]"></i>
                        </button>
                      </div>

                      <h4 className={`font-bold text-sm mb-3 leading-snug ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        {card.title}
                      </h4>

                      {/* INFO SECUNDÁRIA */}
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <div className="flex items-center gap-2 text-slate-500">
                          <i className="fas fa-user-circle"></i>
                          <span>{card.data.source}</span>
                        </div>
                        <div className="text-emerald-500">
                          R$ {Math.floor(Math.random() * 10000 + 1000).toLocaleString()}
                        </div>
                      </div>

                      {/* FOOTER CARD */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex -space-x-1.5 overflow-hidden">
                           <div className="inline-block h-5 w-5 rounded-full ring-2 ring-white dark:ring-slate-800 bg-indigo-500 flex items-center justify-center text-[8px] text-white">RA</div>
                        </div>
                        <div className={`text-[9px] font-bold ${textMuted} flex items-center gap-1`}>
                          <i className="far fa-clock"></i>
                          {formatDuration(Date.now() - card.phaseUpdatedAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* BOTÃO ADICIONAR CARD (PIPEFY STYLE) */}
                <button 
                  onClick={() => onQuickAdd && onQuickAdd(phase.name)}
                  className={`w-full py-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 text-xs font-bold transition-all
                  ${isDarkMode 
                    ? 'border-slate-800 text-slate-500 hover:bg-white/5 hover:border-slate-700' 
                    : 'border-slate-200 text-slate-400 hover:bg-white hover:border-slate-300 hover:shadow-sm'}`}
                >
                  <i className="fas fa-plus"></i>
                  Adicionar Lead
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
