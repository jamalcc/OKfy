
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
      notes: [{ author: 'Sistema', text: `Lead movido para ${newPhaseName}`, timestamp: now, type: 'system' }, ...card.notes],
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
               <button onClick={() => onArchive && onArchive(card.id)} title="Arquivar Lead" className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}>
                    <i className="fas fa-box-archive text-sm"></i>
               </button>
               <button onClick={() => onDelete && onDelete(card.id)} title="Excluir Lead" className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-red-500/10 hover:text-red-500 ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                    <i className="fas fa-trash text-sm"></i>
               </button>
               <div className={`w-px h-5 mx-2 ${isDarkMode ? 'bg-neutral-800' : 'bg-slate-200'}`}></div>
               <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors">
                  <i className="fas fa-times text-slate-400 text-lg"></i>
               </button>
           </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            
            {/* COLUNA ESQUERDA */}
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

            {/* COLUNA CENTRAL: CHAT REFATORADO */}
            <div className={`flex-1 flex flex-col border-r ${borderSubtle} ${isDarkMode ? 'bg-[#000]' : 'bg-slate-50/50'}`}>
               <div className={`px-6 py-3 border-b ${borderSubtle} ${bgCard} flex items-center gap-3 shadow-sm z-10`}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] shadow-sm" style={{ backgroundColor: phases.find(p => p.name === card.phaseName)?.color }}>
                      <i className={`fas ${getPhaseIcon(card.phaseName)}`}></i>
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest">{card.phaseName}</span>
               </div>

               <div className={`${bgCard} border-b ${borderSubtle} p-6`}>
                    {card.phaseName === 'FASE DA MARIANA' ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className={`text-[10px] font-black uppercase tracking-widest mb-2 ${textMuted}`}>Consulta Jurídica</h4>
                                <div className="flex flex-wrap gap-2">
                                    {jusbrasilOptions.map(opt => (
                                        <button key={opt} onClick={() => handleUpdateData('jusbrasil', opt)} className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${card.data.jusbrasil === opt ? (opt === 'OK!' ? 'bg-emerald-600 border-emerald-600 text-white' : opt === 'Problemas' ? 'bg-rose-600 border-rose-600 text-white' : 'bg-slate-600 border-slate-600 text-white') : `bg-transparent border-dashed ${isDarkMode ? 'border-neutral-700 text-slate-400' : 'border-slate-300 text-slate-600'}`}`}>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className={`text-[10px] font-black uppercase tracking-widest mb-2 ${textMuted}`}>Certificado Digital</h4>
                                <div className="flex gap-2">
                                    <button onClick={() => handleUpdateData('hasCertificate', true)} className={`flex-1 py-2 rounded-xl text-[10px] font-bold border transition-all ${card.data.hasCertificate === true ? 'bg-indigo-600 border-indigo-600 text-white' : `bg-transparent border-dashed ${isDarkMode ? 'border-neutral-700 text-slate-500' : 'border-slate-300 text-slate-400'}`}`}>Válido</button>
                                    <button onClick={() => handleUpdateData('hasCertificate', false)} className={`flex-1 py-2 rounded-xl text-[10px] font-bold border transition-all ${card.data.hasCertificate === false ? 'bg-rose-600 border-rose-600 text-white' : `bg-transparent border-dashed ${isDarkMode ? 'border-neutral-700 text-slate-500' : 'border-slate-300 text-slate-400'}`}`}>Pendente</button>
                                </div>
                            </div>
                        </div>
                    ) : card.phaseName === 'CONSULTA AOS BANCOS' ? (
                         <div className="grid grid-cols-3 gap-3">
                             {['pan', 'daycoval', 'c6'].map(bank => (
                                 <div key={bank} className={`p-3 rounded-2xl border ${isDarkMode ? 'border-neutral-800 bg-[#1E1E1E]' : 'border-slate-100 bg-white shadow-sm'}`}>
                                     <span className="text-[10px] font-black uppercase tracking-widest mb-2 block">{bank}</span>
                                     <div className="flex flex-col gap-1">
                                        {bankStatusOptions.map(opt => (
                                            <button key={opt} onClick={() => handleUpdateBank(bank, opt)} className={`w-full py-1.5 rounded-lg text-[9px] font-bold border transition-all ${card.data.banks[bank as keyof typeof card.data.banks] === opt ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-transparent bg-white/5 opacity-50'}`}>{opt}</button>
                                        ))}
                                     </div>
                                 </div>
                             ))}
                         </div>
                    ) : <div className="text-center py-4 text-[10px] italic opacity-30 tracking-widest uppercase font-bold">Sem ações pendentes nesta etapa</div>}
               </div>

               {/* HISTÓRICO DE NOTAS REFORMULADO */}
               <div className="flex-1 overflow-y-auto px-8 py-4 space-y-3 flex flex-col scrollbar-thin">
                   {[...card.notes].reverse().map((note, idx) => (
                      <div key={idx} className={`w-full ${note.type === 'system' ? 'py-1' : 'mb-1'}`}>
                         {note.type === 'system' ? (
                            /* MENSAGEM DE SISTEMA COMPACTA */
                            <div className="flex items-center gap-3 w-full opacity-40 group">
                                <div className={`h-[1px] flex-1 ${isDarkMode ? 'bg-neutral-800' : 'bg-slate-200'}`}></div>
                                <div className="flex items-center gap-2">
                                    <i className="fas fa-microchip text-[8px]"></i>
                                    <span className={`text-[9px] font-black uppercase tracking-tighter ${textMuted} whitespace-nowrap`}>{note.text}</span>
                                </div>
                                <div className={`h-[1px] flex-1 ${isDarkMode ? 'bg-neutral-800' : 'bg-slate-200'}`}></div>
                            </div>
                         ) : (
                            /* MENSAGEM DO USUÁRIO COMPACTA */
                            <div className="flex justify-start gap-3 group">
                               <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black shadow-sm shrink-0 mt-0.5 ${btnBrandClass}`}>{note.author[0]}</div>
                               <div className={`max-w-[90%] px-3.5 py-2.5 rounded-2xl rounded-tl-none border ${borderSubtle} ${bgCard} shadow-sm transition-all`}>
                                  <div className="flex justify-between items-center gap-4 mb-1">
                                      <span className="text-[10px] font-black uppercase tracking-wider opacity-60">{note.author}</span>
                                      <span className={`text-[8px] ${textMuted} font-bold opacity-40`}>{new Date(note.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                  </div>
                                  <p className="text-[12px] leading-snug font-medium text-inherit opacity-90">{note.text}</p>
                               </div>
                            </div>
                         )}
                      </div>
                   ))}
               </div>
               
               {/* INPUT DE CHAT */}
               <div className={`p-5 border-t ${borderSubtle} flex gap-2 ${bgCard}`}>
                   <input 
                      type="text" 
                      value={newNote} 
                      onChange={(e) => setNewNote(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && handleAddNote()} 
                      placeholder="Nova anotação..." 
                      className={`flex-1 text-xs font-semibold bg-transparent outline-none px-4 py-2.5 border ${borderSubtle} rounded-xl focus:border-opacity-100 transition-all ${isDarkMode ? 'focus:border-[#E29D1B]' : 'focus:border-[#233F93]'}`} 
                   />
                   <button onClick={handleAddNote} className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-all active:scale-95 ${btnBrandClass}`}>
                      <i className="fas fa-paper-plane text-xs"></i>
                   </button>
               </div>
            </div>

            {/* COLUNA DIREITA */}
            <div className={`w-full lg:w-[320px] p-6 flex flex-col gap-5 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-slate-50/80'}`}>
               <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#121212] border-neutral-800' : 'bg-white border-slate-200'} shadow-sm`}>
                   <div className="mb-4">
                       <label className={`block text-[9px] font-black uppercase tracking-widest mb-2 ${textMuted}`}>Fase Atual</label>
                       <div className="relative group">
                           <select value={card.phaseName} onChange={(e) => handleUpdatePhase(e.target.value)} className={`w-full appearance-none outline-none text-xs font-bold rounded-xl px-4 py-2.5 border transition-all cursor-pointer ${isDarkMode ? 'bg-[#1E1E1E] border-neutral-700 text-slate-200 focus:border-[#E29D1B]/50' : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-[#233F93]/30'}`}>
                               {phases.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                           </select>
                           <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none opacity-40"></i>
                       </div>
                   </div>
                   <button onClick={() => { const idx = phases.findIndex(p => p.name === card.phaseName); if(idx < phases.length - 1) handleUpdatePhase(phases[idx+1].name); }} className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg ${isDarkMode ? 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700' : 'bg-[#233F93] hover:bg-[#1e3680] text-white'}`}>
                      <span>Avançar Fase</span>
                      <i className="fas fa-arrow-right text-[#E29D1B]"></i>
                   </button>
               </div>

               <div className={`border-t pt-5 ${borderSubtle}`}>
                    <div className="flex items-center justify-between mb-4">
                        <span className={`text-[9px] font-black uppercase tracking-widest ${textMuted}`}>Tempo na Etapa</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${isDarkMode ? 'bg-white/5 text-[#E29D1B]' : 'bg-blue-50 text-[#233F93]'}`}>{getTimeInPhase(card.phaseUpdatedAt)}</span>
                    </div>
                    <div className="flex gap-1 h-1.5 w-full mb-4">
                        {phases.map((p, i) => (
                            <div key={p.name} className={`rounded-full h-full transition-all duration-300 ${i === currentPhaseIndex ? 'flex-[2]' : 'flex-1'}`} style={{ backgroundColor: i < currentPhaseIndex ? p.color : i === currentPhaseIndex ? p.color : (isDarkMode ? '#262626' : '#e2e8f0'), opacity: i < currentPhaseIndex ? 0.3 : 1 }}></div>
                        ))}
                    </div>
                    <div className="space-y-2 max-h-[120px] overflow-y-auto scrollbar-thin pr-2">
                        {card.history.slice().reverse().map((h, i) => (
                            <div key={i} className="flex items-center justify-between text-[9px]">
                                <span className={`font-bold truncate max-w-[140px] opacity-70`}>{h.phaseName}</span>
                                <span className={`font-mono opacity-50`}>{formatDuration(h.durationMs)}</span>
                            </div>
                        ))}
                    </div>
               </div>

               <div className={`border-t pt-5 mt-auto ${borderSubtle}`}>
                    <span className={`block text-[9px] font-black uppercase tracking-widest mb-3 ${textMuted}`}>Tags do Lead</span>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {card.tags.map(tag => (
                            <span key={tag.id} className={`px-2 py-1 text-[9px] font-bold rounded-lg border flex items-center gap-1.5 ${isDarkMode ? 'bg-[#233F93]/20 border-[#233F93]/30 text-blue-200' : 'bg-blue-50 border-blue-100 text-[#233F93]'}`}>
                                {tag.text}
                                <i className="fas fa-times cursor-pointer hover:text-red-500"></i>
                            </span>
                        ))}
                    </div>
                    <div className="relative group">
                        <input type="text" value={newTagText} onChange={e => setNewTagText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddTag()} placeholder="Nova tag..." className={`w-full text-[10px] font-bold rounded-xl px-4 py-2.5 outline-none border transition-all ${isDarkMode ? 'bg-[#121212] border-neutral-800 focus:border-[#E29D1B]/50' : 'bg-white border-slate-200 focus:border-[#233F93]/30'}`} />
                        <div onClick={handleAddTag} className={`absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all opacity-40 hover:opacity-100 ${isDarkMode ? 'text-[#E29D1B]' : 'text-[#233F93]'}`}><i className="fas fa-plus"></i></div>
                    </div>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};
