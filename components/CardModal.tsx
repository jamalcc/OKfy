
import React, { useState } from 'react';
import { Card, Phase } from '../types';
import { EditableField, EditableSelect } from './ui/Editable';

interface CardModalProps {
  card: Card;
  phases: Phase[];
  onClose: () => void;
  onUpdate: (updatedCard: Card) => void;
  onDelete?: (cardId: string) => void;
  onArchive?: (cardId: string) => void;
  isDarkMode: boolean;
  formatCPF: (v: string) => string;
  formatPhone: (v: string) => string;
  validateCPF: (v: string) => boolean;
}

export const CardModal: React.FC<CardModalProps> = ({
  card,
  phases,
  onClose,
  onUpdate,
  onDelete,
  onArchive,
  isDarkMode,
  formatCPF,
  formatPhone,
  validateCPF
}) => {
  const [newNote, setNewNote] = useState('');
  const [newTagText, setNewTagText] = useState('');

  // Paleta de Cores
  const bgCard = isDarkMode ? 'bg-[#121212]' : 'bg-white';
  const borderSubtle = isDarkMode ? 'border-neutral-800' : 'border-slate-200';
  const textMuted = isDarkMode ? 'text-slate-500' : 'text-slate-500';
  const btnBrandClass = isDarkMode ? 'bg-[#E29D1B] text-black' : 'bg-[#233F93] text-white';
  const iconBrandColor = isDarkMode ? 'text-[#E29D1B]' : 'text-[#233F93]';

  const sourceOptions = ["Instagram", "Facebook", "Pesquisa Google", "Anuncio Google", "TikTok", "Linkedin", "Indicação"];
  const jusbrasilOptions = ["nada encontrado", "OK!", "Problemas"];
  const bankStatusOptions = ["Sem bloqueio", "Bloqueio Interno"];

  // Helpers
  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  
  const getPhaseIcon = (p: string) => {
    if (p.includes('MARIANA')) return 'fa-clipboard-user';
    if (p.includes('BANCOS')) return 'fa-building-columns';
    if (p.includes('ENTREVISTA')) return 'fa-comments';
    if (p.includes('CONTRATO')) return 'fa-file-signature';
    return 'fa-circle-nodes';
  };

  const formatDuration = (ms: number) => {
    const min = Math.floor(ms / 60000);
    const hrs = Math.floor(min / 60);
    const days = Math.floor(hrs / 24);
    if (days > 0) return `${days}d ${hrs % 24}h`;
    if (hrs > 0) return `${hrs}h ${min % 60}m`;
    return `${min}m`;
  };

  const getTimeInPhase = (t: number) => formatDuration(Date.now() - t);

  const getBankStatus = (banks: any) => {
    if (banks.daycoval === 'Bloqueio Interno' || banks.c6 === 'Bloqueio Interno') return { label: 'Bloqueio', color: 'rose' };
    if (!banks.pan && !banks.daycoval && !banks.c6) return { label: 'Em Análise', color: 'slate' };
    return { label: 'Liberado', color: 'emerald' };
  };

  // Handlers
  const handleUpdateData = (field: string, value: any) => {
    onUpdate({ ...card, data: { ...card.data, [field]: value } });
  };

  const handleUpdateBank = (bank: string, value: any) => {
    onUpdate({ ...card, data: { ...card.data, banks: { ...card.data.banks, [bank]: value } } });
  };

  const handleUpdatePhase = (newPhaseName: string) => {
    if (card.phaseName === newPhaseName) return;
    const now = Date.now();
    const historyItem = { 
      phaseName: card.phaseName, 
      durationMs: now - card.phaseUpdatedAt, 
      color: phases.find(p => p.name === card.phaseName)?.color || '#94a3b8', 
      timestamp: card.phaseUpdatedAt 
    };
    onUpdate({
      ...card,
      phaseName: newPhaseName,
      phaseUpdatedAt: now,
      notes: [{ author: 'Sistema', text: `Movido para "${newPhaseName}"`, timestamp: now, type: 'system' }, ...card.notes],
      history: [...card.history, historyItem]
    });
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note = { author: 'Consultor Master', text: newNote, timestamp: Date.now(), type: 'user' as const };
    onUpdate({ ...card, notes: [note, ...card.notes] });
    setNewNote('');
  };

  const handleAddTag = () => {
    if (!newTagText.trim()) return;
    const newTag = { id: Date.now().toString(), text: newTagText, color: 'indigo' };
    onUpdate({ ...card, tags: [...card.tags, newTag] });
    setNewTagText('');
  };

  const currentPhaseIndex = phases.findIndex(p => p.name === card.phaseName);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className={`${bgCard} w-full h-full md:h-[90vh] lg:max-w-[1350px] md:rounded-3xl shadow-2xl relative overflow-hidden flex flex-col border ${borderSubtle}`}>
         
        {/* Header */}
        <header className={`h-18 shrink-0 border-b ${borderSubtle} flex items-center justify-between px-8 py-4 bg-inherit`}>
           <input 
              type="text" 
              value={card.title} 
              onChange={(e) => onUpdate({...card, title: e.target.value})} 
              className="text-2xl font-black bg-transparent outline-none flex-1 tracking-tight mr-4" 
           />
           
           <div className="flex items-center gap-2">
               {/* Botão Arquivar */}
               <button 
                  onClick={() => onArchive && onArchive(card.id)}
                  title="Arquivar Lead"
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}
               >
                    <i className="fas fa-box-archive text-sm"></i>
               </button>
               
               {/* Botão Excluir */}
               <button 
                   onClick={() => onDelete && onDelete(card.id)}
                   title="Excluir Lead"
                   className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-red-500/10 hover:text-red-500 ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}
               >
                    <i className="fas fa-trash text-sm"></i>
               </button>

               {/* Divisor */}
               <div className={`w-px h-5 mx-2 ${isDarkMode ? 'bg-neutral-800' : 'bg-slate-200'}`}></div>

               {/* Botão Fechar */}
               <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors">
                  <i className="fas fa-times text-slate-400 text-lg"></i>
               </button>
           </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            
            {/* COLUNA ESQUERDA: INFORMAÇÕES (AJUSTADO) */}
            <div className={`w-full lg:w-[320px] p-6 overflow-y-auto border-r ${borderSubtle} flex flex-col`}>
               <div className="flex-1">
                    <EditableField label="E-mail Principal" value={card.data.email} onChange={(v) => handleUpdateData('email', v)} type="email" placeholder="E-mail não informado" validate={isValidEmail} isDarkMode={isDarkMode} />
                    <EditableField label="Telefone" value={card.data.phone} onChange={(v) => handleUpdateData('phone', formatPhone(v))} type="tel" placeholder="Telefone não informado" isDarkMode={isDarkMode} />
                    <EditableField label="CPF" value={card.data.cpf} onChange={(v) => handleUpdateData('cpf', formatCPF(v))} placeholder="CPF não informado" validate={validateCPF} errorMessage="CPF inválido" isDarkMode={isDarkMode} />
                    <EditableField label="Tempo Mercado" value={card.data.marketTime} onChange={(v) => handleUpdateData('marketTime', v)} placeholder="Não informado" isDarkMode={isDarkMode} />
                    <EditableSelect label="Origem" value={card.data.source} options={sourceOptions} onChange={(v) => handleUpdateData('source', v)} isDarkMode={isDarkMode} />
               </div>

               <div className={`mt-6 pt-6 border-t ${borderSubtle}`}>
                   <h3 className={`text-[9px] font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2 ${textMuted}`}>
                       <i className={`fas fa-shield-halved ${iconBrandColor}`}></i> Verificações
                   </h3>
                   <div className={`space-y-2 p-3.5 rounded-2xl border ${isDarkMode ? 'bg-[#1E1E1E] border-neutral-800' : 'bg-slate-50 border-slate-100 shadow-inner'}`}>
                       <div className="flex items-center justify-between text-[9px] font-bold">
                          <span className={textMuted}>Jusbrasil</span>
                          <span className={`${card.data.jusbrasil === 'OK!' ? 'text-emerald-500' : card.data.jusbrasil === 'Problemas' ? 'text-rose-500' : 'text-slate-400'}`}>
                             {card.data.jusbrasil || 'Pendente'}
                          </span>
                       </div>
                       
                       <div className="flex items-center justify-between text-[9px] font-bold">
                          <span className={textMuted}>Consulta aos Bancos</span>
                          {(() => { const s = getBankStatus(card.data.banks); return <span className={`text-${s.color}-500`}>{s.label}</span> })()}
                       </div>

                       <div className={`flex items-center justify-between text-[9px] font-bold pt-2 border-t border-dashed ${isDarkMode ? 'border-white/10' : 'border-slate-300/20'}`}>
                          <span className={textMuted}>Certificado</span>
                          <span className={`${card.data.hasCertificate ? 'text-indigo-500' : 'text-slate-400'}`}>
                             {card.data.hasCertificate ? 'Válido' : 'Pendente'}
                          </span>
                       </div>
                   </div>
               </div>
            </div>

            {/* COLUNA CENTRAL: TIMELINE E NOTAS */}
            <div className={`flex-1 flex flex-col border-r ${borderSubtle} ${isDarkMode ? 'bg-[#000]' : 'bg-slate-50/50'}`}>
               <div className={`px-6 py-4 border-b ${borderSubtle} ${bgCard} flex items-center gap-3 shadow-sm z-10`}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[12px] shadow-sm" style={{ backgroundColor: phases.find(p => p.name === card.phaseName)?.color }}>
                      <i className={`fas ${getPhaseIcon(card.phaseName)}`}></i>
                  </div>
                  <span className="text-sm font-black uppercase tracking-widest">{card.phaseName}</span>
               </div>

               <div className={`${bgCard} border-b ${borderSubtle} p-8`}>
                    {card.phaseName === 'FASE DA MARIANA' ? (
                        <div className="space-y-6">
                            {/* Seção Jusbrasil */}
                            <div>
                                <h4 className={`text-xs font-black uppercase tracking-widest mb-3 ${textMuted}`}>Consulta Jurídica</h4>
                                <div className="flex flex-wrap gap-3">
                                    {jusbrasilOptions.map(opt => (
                                        <button 
                                          key={opt} 
                                          onClick={() => handleUpdateData('jusbrasil', opt)} 
                                          className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-all 
                                            ${card.data.jusbrasil === opt 
                                              ? (opt === 'OK!' 
                                                ? 'bg-emerald-600 border-emerald-600 text-white' 
                                                : opt === 'Problemas' ? 'bg-rose-600 border-rose-600 text-white' : 'bg-slate-600 border-slate-600 text-white') 
                                              : `bg-transparent border-dashed ${isDarkMode ? 'border-neutral-700 hover:border-neutral-500 text-slate-400' : 'border-slate-300 hover:border-slate-400 text-slate-600'}`
                                            }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Nova Seção: Certificado */}
                            <div className={`pt-6 border-t border-dashed ${isDarkMode ? 'border-neutral-800' : 'border-slate-200'}`}>
                                <h4 className={`text-xs font-black uppercase tracking-widest mb-3 ${textMuted}`}>Certificado Digital</h4>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleUpdateData('hasCertificate', true)}
                                        className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2
                                        ${card.data.hasCertificate === true 
                                            ? 'bg-indigo-600 border-indigo-600 text-white' 
                                            : `bg-transparent border-dashed ${isDarkMode ? 'border-neutral-700 hover:border-indigo-500/50 text-slate-500' : 'border-slate-300 hover:border-indigo-500/50 text-slate-400'}`}`}
                                    >
                                        <i className="fas fa-check-circle"></i> Válido / Possui
                                    </button>
                                    <button 
                                        onClick={() => handleUpdateData('hasCertificate', false)}
                                        className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2
                                        ${card.data.hasCertificate === false 
                                            ? 'bg-rose-600 border-rose-600 text-white' 
                                            : `bg-transparent border-dashed ${isDarkMode ? 'border-neutral-700 hover:border-rose-500/50 text-slate-500' : 'border-slate-300 hover:border-rose-500/50 text-slate-400'}`}`}
                                    >
                                        <i className="fas fa-times-circle"></i> Inválido / Sem
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : card.phaseName === 'CONSULTA AOS BANCOS' ? (
                         <div className="space-y-4">
                             {['pan', 'daycoval', 'c6'].map(bank => (
                                 <div key={bank} className={`flex items-center justify-between p-4 rounded-2xl border ${isDarkMode ? 'border-neutral-800 bg-[#1E1E1E]' : 'border-slate-100 bg-white shadow-sm'}`}>
                                     <span className="text-sm font-black uppercase tracking-widest">{bank}</span>
                                     <div className="flex gap-2">
                                        {bankStatusOptions.map(opt => (
                                            <button key={opt} onClick={() => handleUpdateBank(bank, opt)} className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${card.data.banks[bank as keyof typeof card.data.banks] === opt ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-transparent bg-white/5'}`}>{opt}</button>
                                        ))}
                                     </div>
                                 </div>
                             ))}
                         </div>
                    ) : <div className="text-center py-8 text-xs italic opacity-40 tracking-widest uppercase">Nenhuma ação necessária nesta etapa</div>}
               </div>

               <div className="flex-1 overflow-y-auto p-8 flex flex-col">
                   {[...card.notes].reverse().map((note, idx) => (
                      <div key={idx} className={`flex w-full ${note.type === 'system' ? 'justify-center my-1' : 'justify-start gap-4 mb-5'}`}>
                         {note.type === 'system' ? (
                            // MENSAGEM DE SISTEMA COMPACTA
                            <div className="flex items-center gap-4 w-full opacity-40">
                                <div className={`h-px flex-1 ${isDarkMode ? 'bg-neutral-800' : 'bg-slate-200'}`}></div>
                                <span className={`text-[9px] font-black uppercase tracking-widest ${textMuted} whitespace-nowrap`}>{note.text}</span>
                                <div className={`h-px flex-1 ${isDarkMode ? 'bg-neutral-800' : 'bg-slate-200'}`}></div>
                            </div>
                         ) : (
                            // MENSAGEM DO USUÁRIO
                            <>
                               <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shadow-md shrink-0 mt-1 ${btnBrandClass}`}>{note.author[0]}</div>
                               <div className={`max-w-[85%] p-4 rounded-3xl rounded-tl-none border ${borderSubtle} ${bgCard} shadow-sm relative group`}>
                                  <div className="flex justify-between items-center gap-6 mb-1.5">
                                      <span className="text-[11px] font-black uppercase tracking-wider opacity-80">{note.author}</span>
                                      <span className={`text-[9px] ${textMuted} font-semibold opacity-60`}>{new Date(note.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                  </div>
                                  <p className="text-[13px] leading-relaxed font-medium opacity-90">{note.text}</p>
                               </div>
                            </>
                         )}
                      </div>
                   ))}
               </div>
               
               <div className={`p-6 border-t ${borderSubtle} flex gap-3 ${bgCard}`}>
                   <input 
                      type="text" 
                      value={newNote} 
                      onChange={(e) => setNewNote(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && handleAddNote()} 
                      placeholder="Escreva uma observação..." 
                      className={`flex-1 text-sm font-medium bg-transparent outline-none px-4 py-3 border ${borderSubtle} rounded-2xl focus:border-opacity-100 transition-all ${isDarkMode ? 'focus:border-[#E29D1B]' : 'focus:border-[#233F93]'}`} 
                   />
                   <button onClick={handleAddNote} className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-95 ${btnBrandClass}`}>
                      <i className="fas fa-paper-plane text-sm"></i>
                   </button>
               </div>
            </div>

            {/* COLUNA DIREITA: AÇÕES & MÉTRICAS (REFATORADO) */}
            <div className={`w-full lg:w-[320px] p-8 flex flex-col gap-6 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-slate-50/80'}`}>
               
               {/* 1. Card de Ação (Mover/Avançar) */}
               <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#121212] border-neutral-800' : 'bg-white border-slate-200'} shadow-sm`}>
                   <div className="mb-4">
                       <label className={`block text-[9px] font-black uppercase tracking-widest mb-2 ${textMuted}`}>Fase Atual</label>
                       <div className="relative group">
                           <select 
                               value={card.phaseName} 
                               onChange={(e) => handleUpdatePhase(e.target.value)} 
                               className={`w-full appearance-none outline-none text-xs font-bold rounded-xl px-4 py-3 border transition-all cursor-pointer
                               ${isDarkMode 
                                   ? 'bg-[#1E1E1E] border-neutral-700 text-slate-200 focus:border-[#E29D1B]/50' 
                                   : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-[#233F93]/30'}`}
                           >
                               {phases.map(p => <option key={p.name} value={p.name} className={isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white'}>{p.name}</option>)}
                           </select>
                           <i className={`fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none transition-colors ${isDarkMode ? 'text-slate-500 group-hover:text-[#E29D1B]' : 'text-slate-400 group-hover:text-[#233F93]'}`}></i>
                       </div>
                   </div>
                   
                   <button 
                      onClick={() => { const idx = phases.findIndex(p => p.name === card.phaseName); if(idx < phases.length - 1) handleUpdatePhase(phases[idx+1].name); }} 
                      className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg group
                      ${isDarkMode 
                          ? 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700' 
                          : 'bg-[#233F93] hover:bg-[#1e3680] text-white'}`}
                   >
                      <span>Próxima Fase</span>
                      <i className={`fas fa-arrow-right transition-transform group-hover:translate-x-1 ${isDarkMode ? 'text-[#E29D1B]' : 'text-[#E29D1B]'}`}></i>
                   </button>
               </div>

               {/* 2. Timeline Visual (Refatorado) */}
               <div className={`border-t pt-6 ${borderSubtle}`}>
                    <div className="flex items-center justify-between mb-4">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${textMuted}`}>Timeline</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${isDarkMode ? 'bg-white/5 text-[#E29D1B]' : 'bg-blue-50 text-[#233F93]'}`}>
                            {getTimeInPhase(card.phaseUpdatedAt)}
                        </span>
                    </div>

                    {/* Barra de Progresso Segmentada */}
                    <div className="flex gap-1 h-1.5 w-full mb-5">
                        {phases.map((p, i) => {
                            const isCompleted = i < currentPhaseIndex;
                            const isCurrent = i === currentPhaseIndex;
                            return (
                                <div 
                                    key={p.name}
                                    className={`rounded-full h-full transition-all duration-300 ${isCurrent ? 'flex-[2]' : 'flex-1'}`}
                                    style={{ 
                                        backgroundColor: isCompleted ? p.color : isCurrent ? p.color : (isDarkMode ? '#262626' : '#e2e8f0'),
                                        opacity: isCompleted ? 0.4 : isCurrent ? 1 : 1 
                                    }}
                                    title={p.name}
                                ></div>
                            );
                        })}
                    </div>

                    <div className="space-y-2 max-h-[150px] overflow-y-auto scrollbar-thin pr-2">
                        {card.history.slice().reverse().map((h, i) => (
                            <div key={i} className="flex items-center justify-between text-[10px] group">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: h.color }}></div>
                                    <span className={`font-bold truncate max-w-[140px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{h.phaseName}</span>
                                </div>
                                <span className={`font-mono ${textMuted}`}>{formatDuration(h.durationMs)}</span>
                            </div>
                        ))}
                    </div>
               </div>

               {/* 3. Tags (Refatorado) */}
               <div className={`border-t pt-6 mt-auto ${borderSubtle}`}>
                    <span className={`block text-[10px] font-black uppercase tracking-widest mb-3 ${textMuted}`}>Tags</span>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                        {card.tags.map(tag => (
                            <span key={tag.id} className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border flex items-center gap-1.5 transition-colors ${isDarkMode ? 'bg-[#233F93]/20 border-[#233F93]/30 text-blue-200' : 'bg-blue-50 border-blue-100 text-[#233F93]'}`}>
                                {tag.text}
                                <button className="hover:text-red-400 transition-colors"><i className="fas fa-times"></i></button>
                            </span>
                        ))}
                    </div>

                    <div className="relative group">
                        <input 
                            type="text" 
                            value={newTagText} 
                            onChange={e => setNewTagText(e.target.value)} 
                            onKeyDown={e => e.key === 'Enter' && handleAddTag()} 
                            placeholder="Adicionar tag..." 
                            className={`w-full text-xs font-medium rounded-xl px-4 py-3 outline-none border transition-all
                            ${isDarkMode 
                                ? 'bg-[#121212] border-neutral-800 text-slate-200 focus:border-[#E29D1B]/50 placeholder:text-neutral-600' 
                                : 'bg-white border-slate-200 text-slate-700 focus:border-[#233F93]/30 placeholder:text-slate-400'}`} 
                        />
                        <div 
                            onClick={handleAddTag}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all opacity-50 group-hover:opacity-100 hover:scale-105
                            ${isDarkMode ? 'text-[#E29D1B] hover:bg-[#E29D1B]/10' : 'text-[#233F93] hover:bg-blue-50'}`}
                        >
                            <i className="fas fa-plus text-xs"></i>
                        </div>
                    </div>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};
