
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
  dropTargetPhase,
  setDropTargetPhase,
  formatDuration
}) => {
  const bgCard = isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white';
  const borderSubtle = isDarkMode ? 'border-neutral-800' : 'border-slate-200';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="flex-1 flex gap-6 overflow-x-auto p-6 items-start scrollbar-thin">
      {phases.map((phase, idx) => (
        <div 
          key={idx} 
          className={`min-w-[280px] w-[280px] flex flex-col h-full rounded-2xl border p-1 transition-colors ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-slate-100/50 border-slate-200'}`}
          onDragOver={(e) => { e.preventDefault(); setDropTargetPhase(phase.name); }}
          onDragLeave={() => setDropTargetPhase(null)}
          onDrop={(e) => onDrop(e, phase.name)}
        >
          {/* Header da Coluna */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-transparent">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: phase.color }}></div>
              <span className="text-[10px] font-black uppercase tracking-wider">{phase.name}</span>
            </div>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-neutral-800' : 'bg-white'}`}>
              {cards.filter(c => c.phaseName === phase.name).length}
            </span>
          </div>

          {/* Área de Cards */}
          <div className={`flex-1 overflow-y-auto px-2 pb-2 rounded-xl transition-all ${dropTargetPhase === phase.name ? 'bg-indigo-500/10 ring-2 ring-indigo-500/30 ring-dashed' : ''}`}>
            <div className="space-y-3 mt-2">
              {cards.filter(c => c.phaseName === phase.name).map(card => (
                <div 
                  key={card.id} 
                  draggable 
                  onDragStart={(e) => onDragStart(e, card.id)} 
                  onClick={() => onCardClick(card)} 
                  className={`${bgCard} p-3 rounded-lg border ${borderSubtle} shadow-sm cursor-pointer hover:shadow-md hover:translate-y-[-2px] transition-all`}
                >
                  <h4 className="font-bold text-sm mb-1">{card.title}</h4>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-50/5 mt-2">
                    <div className={`text-[10px] ${textMuted}`}>
                      <i className="far fa-clock mr-1"></i>
                      {formatDuration(Date.now() - card.phaseUpdatedAt)}
                    </div>
                    <span className="text-[9px] font-bold opacity-60">{card.data.source}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
