
import React, { useState, useMemo } from 'react';
import { Card, Phase, Note } from '../types';
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

// Mock Users para simular Firebase
const MOCK_USERS = [
  { id: 'u1', name: 'Mariana Silva', avatar: 'MS' },
  { id: 'u2', name: 'Carlos Admin', avatar: 'CA' },
  { id: 'u3', name: 'Ana Atendimento', avatar: 'AA' },
  { id: 'unassigned', name: 'Sem Responsável', avatar: '?' }
];

// Subcomponente Memoizado para Mensagens de Sistema
const SystemMessage = React.memo(({ text, isDarkMode, textMuted }: { text: string, isDarkMode: boolean, textMuted: string }) => (
  <div className="flex items-center gap-3 w-full opacity-40 group py-1 transition-opacity duration-300">
      <div className={`h-[1px] flex-1 transition-colors duration-300 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
      <div className="flex items-center gap-2">
          <i className="fas fa-microchip text-[8px]"></i>
          <span className={`text-[9px] font-black uppercase tracking-tighter ${textMuted} whitespace-nowrap`}>{text}</span>
      </div>
      <div className={`h-[1px] flex-1 transition-colors duration-300 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
  </div>
));

// Subcomponente Memoizado para Mensagens de Usuário
const UserMessage = React.memo(({ note, isDarkMode, bgCard, borderSubtle, textMuted, btnBrandClass }: { 
  note: Note, isDarkMode: boolean, bgCard: string, borderSubtle: string, textMuted: string, btnBrandClass: string 
}) => {
  const timeString = new Date(note.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  
  return (
    <div className="flex justify-start gap-3 group mb-1">
       <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black shadow-sm shrink-0 mt-0.5 transition-all duration-300 ${btnBrandClass}`}>
          {note.author[0]}
       </div>
       <div className={`max-w-[90%] px-3.5 py-2.5 rounded-2xl rounded-tl-none border shadow-sm transition-all duration-300 ${borderSubtle} ${bgCard}`}>
          <div className="flex justify-between items-center gap-4 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider opacity-60">{note.author}</span>
              <span className={`text-[8px] ${textMuted} font-bold opacity-40`}>{timeString}</span>
          </div>
          <p className="text-[12px] leading-snug font-medium text-inherit opacity-90">{note.text}</p>
       </div>
    </div>
  );
});

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

  // PALETA DARK MODE SLATE OTIMIZADA
  const bgCard = isDarkMode ? 'bg-[#1E293B]' : 'bg-white';
  const bgCol = isDarkMode ? 'bg-[#0F172A]' : 'bg-slate-50/80';
  const borderSubtle = isDarkMode ? 'border-slate-700' : 'border-slate-200';
  const textMuted = isDarkMode ? 'text-slate-500' : 'text-slate-500';
  
  // Marca: Azul Profundo no Light (#001F8D), Amarelo no Dark (#E1A030)
  const btnBrandClass = isDarkMode ? 'bg-[#E1A030] text-black' : 'bg-[#001F8D] text-white';
  const iconBrandColor = isDarkMode ? 'text-[#E1A030]' : 'text-[#001F8D]';
  
  const sourceOptions = ["Instagram", "Facebook", "Pesquisa Google", "Anuncio Google", "TikTok", "Linkedin", "Indicação"];
  const bankStatusOptions = ["Sem bloqueio", "Bloqueio Interno"];

  const fieldLabels: Record<string, string> = {
      email: 'E-mail',
      phone: 'Telefone',
      cpf: 'CPF',
      marketTime: 'Tempo de Mercado',
      source: 'Origem',
      jusbrasil: 'Status Jusbrasil',
      hasCertificate: 'Status Certificado'
  };

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

  // Lógica de tempo acumulativo por fase
  const getTotalTimeInPhase = (phaseName: string) => {
    const historyDuration = card.history
      .filter(h => h.phaseName === phaseName)
      .reduce((acc, curr) => acc + curr.durationMs, 0);
    
    const currentSessionDuration = card.phaseName === phaseName 
      ? (Date.now() - card.phaseUpdatedAt) 
      : 0;

    return historyDuration + currentSessionDuration;
  };

  const getBankStatus = (banks: any) => {
    if (banks.daycoval === 'Bloqueio Interno' || banks.c6 === 'Bloqueio Interno') return { label: 'Bloqueio', color: 'rose' };
    if (!banks.pan && !banks.daycoval && !banks.c6) return { label: 'Em Análise', color: 'slate' };
    return { label: 'Liberado', color: 'emerald' };
  };

  const isChecked = (text: string) => card.checklist.some(i => i.text === text && i.completed);

  const getCertificateDisplay = () => {
      const hasTodas = isChecked('Todas');
      if (hasTodas) return { text: 'Sem certificado', color: 'text-rose-500' };
      if (card.data.hasCertificate === true) return { text: 'Válido', color: 'text-emerald-500' };
      return { text: 'Pendente', color: 'text-slate-400' };
  };

  // --- HANDLERS ---
  const handleUpdateData = (field: string, value: any, shouldLog = true) => {
    if (card.data[field as keyof typeof card.data] === value) return;
    
    const newData = { ...card.data, [field]: value };
    let newNotes = card.notes;

    if (shouldLog) {
        const label = fieldLabels[field] || field;
        let valDisplay = value;
        if (field === 'hasCertificate') valDisplay = value ? 'Válido' : 'Pendente';
        if (value === null) valDisplay = 'Removido';
        const logNote: Note = {
            author: 'Consultor Master',
            text: `Alterou ${label} para "${valDisplay}"`,
            timestamp: Date.now(),
            type: 'system'
        };
        newNotes = [logNote, ...card.notes];
    }
    
    onUpdate({ 
        ...card, 
        data: newData,
        notes: newNotes
    });
  };

  const handleUpdateBank = (bank: string, value: any) => {
    if (card.data.banks[bank as keyof typeof card.data.banks] === value) return;
    onUpdate({ 
        ...card, 
        data: { ...card.data, banks: { ...card.data.banks, [bank]: value } }
    });
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
    const logNote: Note = {
        author: 'Consultor Master', 
        text: `Moveu lead para ${newPhaseName}`, 
        timestamp: now, 
        type: 'system'
    };
    onUpdate({
      ...card,
      phaseName: newPhaseName,
      phaseUpdatedAt: now,
      notes: [logNote, ...card.notes],
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

  const handleRemoveTag = (tagId: string) => {
    const newTags = card.tags.filter(t => t.id !== tagId);
    onUpdate({ ...card, tags: newTags });
  };

  const toggleChecklistItem = (text: string) => {
    const exists = card.checklist.find(i => i.text === text);
    let newChecklist;
    if (exists) {
        newChecklist = card.checklist.map(i => i.text === text ? { ...i, completed: !i.completed } : i);
    } else {
        newChecklist = [...card.checklist, { id: Date.now().toString(), text, completed: true }];
    }
    onUpdate({ ...card, checklist: newChecklist });
  };

  const currentPhaseIndex = phases.findIndex(p => p.name === card.phaseName);

  // Determinar responsável atual (somente leitura)
  const currentAssignee = MOCK_USERS.find(u => u.id === card.assignee);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 font-sans">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}></div>
      
      <div className={`${bgCard} w-full h-full md:h-[90vh] lg:max-w-[1350px] md:rounded-3xl shadow-2xl relative overflow-hidden flex flex-col border ${borderSubtle} ${isDarkMode ? 'text-slate-200' : ''} transition-colors duration-300`}>
         
        {/* Header */}
        <header className={`h-18 shrink-0 border-b ${borderSubtle} flex items-center justify-between px-8 py-4 bg-inherit transition-colors duration-300`}>
           <input 
              type="text" 
              value={card.title} 
              onChange={(e) => onUpdate({...card, title: e.target.value})} 
              className={`text-2xl font-black bg-transparent outline-none flex-1 tracking-tight mr-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`} 
           />
           
           <div className="flex items-center gap-2">
               <button onClick={() => onArchive && onArchive(card.id)} title="Arquivar Lead" className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}>
                    <i className="fas fa-box-archive text-sm"></i>
               </button>
               <button onClick={() => onDelete && onDelete(card.id)} title="Excluir Lead" className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-red-500/10 hover:text-red-500 ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                    <i className="fas fa-trash text-sm"></i>
               </button>
               <div className={`w-px h-5 mx-2 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
               <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors">
                  <i className="fas fa-times text-slate-400 text-lg"></i>
               </button>
           </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            
            {/* COLUNA ESQUERDA */}
            <div className={`w-full lg:w-[320px] p-6 overflow-y-auto border-r ${borderSubtle} flex flex-col transition-colors duration-300`}>
               <div className="flex-1">
                    <EditableField label="E-mail Principal" value={card.data.email} onChange={(v) => handleUpdateData('email', v)} type="email" placeholder="E-mail não informado" validate={isValidEmail} isDarkMode={isDarkMode} />
                    <EditableField label="Telefone" value={card.data.phone} onChange={(v) => handleUpdateData('phone', formatPhone(v))} type="tel" placeholder="Telefone não informado" isDarkMode={isDarkMode} />
                    <EditableField label="CPF" value={card.data.cpf} onChange={(v) => handleUpdateData('cpf', formatCPF(v))} placeholder="CPF não informado" validate={validateCPF} errorMessage="CPF inválido" isDarkMode={isDarkMode} />
                    <EditableField label="Tempo Mercado" value={card.data.marketTime} onChange={(v) => handleUpdateData('marketTime', v)} placeholder="Não informado" isDarkMode={isDarkMode} />
                    <EditableSelect label="Origem" value={card.data.source} options={sourceOptions} onChange={(v) => handleUpdateData('source', v)} isDarkMode={isDarkMode} />
               </div>

               <div className={`mt-6 pt-6 border-t ${borderSubtle} transition-colors duration-300`}>
                   <h3 className={`text-[9px] font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2 ${textMuted}`}>
                       <i className={`fas fa-shield-halved ${iconBrandColor}`}></i> Verificações
                   </h3>
                   <div className={`space-y-2 p-3.5 rounded-2xl border transition-colors duration-300 ${isDarkMode ? 'bg-[#0F172A] border-slate-700' : 'bg-slate-50 border-slate-100 shadow-inner'}`}>
                       <div className="flex items-center justify-between text-[9px] font-bold">
                          <span className={textMuted}>Jusbrasil</span>
                          <span className={`${card.data.jusbrasil === 'OK!' ? 'text-emerald-500' : card.data.jusbrasil === 'Problemas' ? 'text-rose-500' : 'text-slate-400'}`}>
                             {card.data.jusbrasil === 'OK!' ? 'Tudo certo!' : card.data.jusbrasil === 'Problemas' ? 'Inconsistências' : 'Pendente'}
                          </span>
                       </div>
                       <div className="flex items-center justify-between text-[9px] font-bold">
                          <span className={textMuted}>Consulta aos Bancos</span>
                          {(() => { const s = getBankStatus(card.data.banks); return <span className={`text-${s.color}-500`}>{s.label}</span> })()}
                       </div>
                       <div className={`flex items-center justify-between text-[9px] font-bold pt-2 border-t border-dashed transition-colors duration-300 ${isDarkMode ? 'border-slate-700' : 'border-slate-300/20'}`}>
                          <span className={textMuted}>Certificado</span>
                          {(() => { const s = getCertificateDisplay(); return <span className={s.color}>{s.text}</span> })()}
                       </div>
                   </div>
               </div>
            </div>

            {/* COLUNA CENTRAL */}
            <div className={`flex-1 flex flex-col border-r ${borderSubtle} ${bgCol} transition-colors duration-300`}>
               <div className={`px-6 py-3 border-b ${borderSubtle} ${bgCard} flex items-center gap-3 shadow-sm z-10 transition-colors duration-300`}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] shadow-sm" style={{ backgroundColor: phases.find(p => p.name === card.phaseName)?.color }}>
                      <i className={`fas ${getPhaseIcon(card.phaseName)}`}></i>
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest">{card.phaseName}</span>
               </div>

               <div className={`${bgCard} border-b ${borderSubtle} p-6 transition-colors duration-300`}>
                    {card.phaseName === 'FASE DA MARIANA' ? (
                        <div className="flex flex-col gap-6">
                            {/* SEÇÃO 1: CONSULTA JURÍDICA */}
                            <div>
                                <h4 className={`text-[10px] font-black uppercase tracking-widest mb-3 ${textMuted}`}>Consulta Jurídica</h4>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => handleUpdateData('jusbrasil', 'OK!', false)} 
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-bold border transition-all shadow-sm ${card.data.jusbrasil === 'OK!' ? 'bg-emerald-600 border-emerald-600 text-white' : `bg-transparent border-dashed ${isDarkMode ? 'border-slate-700 text-slate-400 hover:border-emerald-500/50 hover:text-emerald-500' : 'border-slate-300 text-slate-500 hover:border-emerald-500 hover:text-emerald-600'}`}`}
                                    >
                                        <i className="fas fa-check mr-2"></i>Tudo certo!
                                    </button>
                                    <button 
                                        onClick={() => handleUpdateData('jusbrasil', 'Problemas', false)} 
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-bold border transition-all shadow-sm ${card.data.jusbrasil === 'Problemas' ? 'bg-rose-600 border-rose-600 text-white' : `bg-transparent border-dashed ${isDarkMode ? 'border-slate-700 text-slate-400 hover:border-rose-500/50 hover:text-rose-500' : 'border-slate-300 text-slate-500 hover:border-rose-500 hover:text-rose-600'}`}`}
                                    >
                                        <i className="fas fa-triangle-exclamation mr-2"></i>Inconsistências
                                    </button>
                                </div>
                            </div>

                            {/* SEÇÃO 2: CERTIFICAÇÃO DOS BANCOS */}
                            <div>
                                <h4 className={`text-[10px] font-black uppercase tracking-widest mb-3 ${textMuted}`}>CERTIFICAÇÃO DOS BANCOS</h4>
                                
                                <div className="flex gap-2 mb-4">
                                    <button onClick={() => handleUpdateData('hasCertificate', true, false)} className={`flex-1 py-2 rounded-xl text-[10px] font-bold border transition-all ${card.data.hasCertificate === true ? 'bg-emerald-600 border-emerald-600 text-white' : `bg-transparent border-dashed ${isDarkMode ? 'border-slate-700 text-slate-400' : 'border-slate-300 text-slate-400'}`}`}>Válido</button>
                                    <button onClick={() => handleUpdateData('hasCertificate', false, false)} className={`flex-1 py-2 rounded-xl text-[10px] font-bold border transition-all ${card.data.hasCertificate === false ? 'bg-rose-600 border-rose-600 text-white' : `bg-transparent border-dashed ${isDarkMode ? 'border-slate-700 text-slate-400' : 'border-slate-300 text-slate-400'}`}`}>Pendente</button>
                                </div>

                                <div className={`flex flex-wrap gap-2 transition-all duration-300 ${card.data.hasCertificate === false ? '' : 'opacity-50 pointer-events-none grayscale'}`}>
                                    {['Todas', 'PLDFT', 'Consignado + LGPD'].map((item) => {
                                        const checked = isChecked(item);
                                        return (
                                            <div 
                                                key={item} 
                                                onClick={() => toggleChecklistItem(item)}
                                                className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${checked 
                                                    ? (isDarkMode ? 'bg-[#E1A030]/10 border-[#E1A030]/50' : 'bg-indigo-50 border-indigo-200') 
                                                    : (isDarkMode ? 'bg-[#0F172A] border-slate-700 hover:border-slate-500' : 'bg-white border-slate-200 hover:border-slate-300')}`}
                                            >
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${checked 
                                                    ? (isDarkMode ? 'bg-[#E1A030] border-[#E1A030] text-black' : 'bg-[#001F8D] border-[#001F8D] text-white') 
                                                    : (isDarkMode ? 'border-slate-600' : 'border-slate-300')}`}>
                                                    {checked && <i className="fas fa-check text-[8px]"></i>}
                                                </div>
                                                <span className={`text-[9px] font-bold uppercase tracking-wide text-center leading-tight ${checked ? (isDarkMode ? 'text-[#E1A030]' : 'text-[#001F8D]') : textMuted}`}>
                                                    {item}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : card.phaseName === 'CONSULTA AOS BANCOS' ? (
                         <div className="grid grid-cols-3 gap-3">
                             {['pan', 'daycoval', 'c6'].map(bank => (
                                 <div key={bank} className={`p-3 rounded-2xl border transition-colors duration-300 ${isDarkMode ? 'border-slate-700 bg-[#0F172A]' : 'border-slate-100 bg-white shadow-sm'}`}>
                                     <span className="text-[10px] font-black uppercase tracking-widest mb-2 block">{bank}</span>
                                     <div className="flex flex-col gap-1">
                                        {bankStatusOptions.map(opt => {
                                            const isSelected = card.data.banks[bank as keyof typeof card.data.banks] === opt;
                                            let btnClass = 'border-transparent bg-white/5 opacity-50'; // Default
                                            
                                            if (isSelected) {
                                                if (opt === 'Bloqueio Interno') btnClass = 'bg-rose-500 border-rose-500 text-white';
                                                else if (opt === 'Sem bloqueio') btnClass = 'bg-emerald-600 border-emerald-600 text-white';
                                                else btnClass = isDarkMode ? 'bg-[#E1A030] border-[#E1A030] text-black' : 'bg-[#001F8D] border-[#001F8D] text-white';
                                            }

                                            return (
                                                <button key={opt} onClick={() => handleUpdateBank(bank, opt)} className={`w-full py-1.5 rounded-lg text-[9px] font-bold border transition-all ${btnClass}`}>{opt}</button>
                                            );
                                        })}
                                     </div>
                                 </div>
                             ))}
                         </div>
                    ) : <div className="text-center py-4 text-[10px] italic opacity-30 tracking-widest uppercase font-bold">Sem ações pendentes nesta etapa</div>}
               </div>

               {/* HISTÓRICO DE NOTAS */}
               <div className="flex-1 overflow-y-auto px-8 py-4 space-y-3 flex flex-col-reverse scrollbar-thin">
                   {card.notes.map((note, idx) => (
                      <div key={idx} className={`w-full ${note.type === 'system' ? 'py-1' : 'mb-1'}`}>
                         {note.type === 'system' ? (
                            <SystemMessage text={note.text} isDarkMode={isDarkMode} textMuted={textMuted} />
                         ) : (
                            <UserMessage 
                              note={note} 
                              isDarkMode={isDarkMode} 
                              bgCard={bgCard} 
                              borderSubtle={borderSubtle} 
                              textMuted={textMuted} 
                              btnBrandClass={btnBrandClass} 
                            />
                         )}
                      </div>
                   ))}
               </div>
               
               {/* INPUT DE CHAT */}
               <div className={`p-5 border-t ${borderSubtle} flex gap-2 ${bgCard} transition-colors duration-300`}>
                   <input 
                      type="text" 
                      value={newNote} 
                      onChange={(e) => setNewNote(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && handleAddNote()} 
                      placeholder="Nova anotação..." 
                      className={`flex-1 text-xs font-semibold bg-transparent outline-none px-4 py-2.5 border ${borderSubtle} rounded-xl focus:border-opacity-100 transition-all ${isDarkMode ? 'focus:border-[#E1A030] text-white placeholder-slate-500' : 'focus:border-[#001F8D] text-slate-900'}`} 
                   />
                   <button onClick={handleAddNote} className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-all active:scale-95 ${btnBrandClass}`}>
                      <i className="fas fa-paper-plane text-xs"></i>
                   </button>
               </div>
            </div>

            {/* COLUNA DIREITA */}
            <div className={`w-full lg:w-[320px] p-6 flex flex-col gap-5 ${bgCol} transition-colors duration-300`}>
               
               {/* CARD 1: FASE ATUAL */}
               <div className={`p-5 rounded-2xl border transition-colors duration-300 ${isDarkMode ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-200'} shadow-sm`}>
                   <div className="mb-4">
                       <label className={`block text-[9px] font-black uppercase tracking-widest mb-2 ${textMuted}`}>Fase Atual</label>
                       <div className="relative group">
                           <select value={card.phaseName} onChange={(e) => handleUpdatePhase(e.target.value)} className={`w-full appearance-none outline-none text-xs font-bold rounded-xl px-4 py-2.5 border transition-all cursor-pointer ${isDarkMode ? 'bg-[#0F172A] border-slate-700 text-slate-200 focus:border-[#E1A030]' : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-[#001F8D]/30'}`}>
                               {phases.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                           </select>
                           <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none opacity-40"></i>
                       </div>
                   </div>
                   <button onClick={() => { const idx = phases.findIndex(p => p.name === card.phaseName); if(idx < phases.length - 1) handleUpdatePhase(phases[idx+1].name); }} className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg ${isDarkMode ? 'bg-[#1E293B] hover:bg-[#334155] text-white border border-slate-600' : 'bg-[#001F8D] hover:bg-[#1e3680] text-white'}`}>
                      <span>Avançar Fase</span>
                      <i className={`fas fa-arrow-right ${isDarkMode ? 'text-[#E1A030]' : 'text-[#E29D1B]'}`}></i>
                   </button>
               </div>
               
               {/* CARD 2: RESPONSÁVEL (SEPARADO - READ ONLY) */}
               <div className={`p-5 rounded-2xl border transition-colors duration-300 ${isDarkMode ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-200'} shadow-sm`}>
                   <label className={`block text-[9px] font-black uppercase tracking-widest mb-2 ${textMuted}`}>Responsável (Automático)</label>
                   <div className={`flex items-center gap-3 p-3 rounded-xl border border-transparent transition-colors duration-300 ${isDarkMode ? 'bg-black/20' : 'bg-slate-50'}`}>
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm ${currentAssignee ? (isDarkMode ? 'bg-[#E1A030] text-black' : 'bg-[#001F8D] text-white') : (isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-400')}`}>
                           {currentAssignee?.avatar || '?'}
                       </div>
                       <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                           {currentAssignee?.name || 'Aguardando atribuição'}
                       </span>
                   </div>
               </div>

               {/* SEÇÃO 3: TEMPO E HISTÓRICO */}
               <div className={`border-t pt-5 ${borderSubtle} transition-colors duration-300`}>
                    <div className="flex items-center justify-between mb-4">
                        <span className={`text-[9px] font-black uppercase tracking-widest ${textMuted}`}>TEMPO EM CADA FASE</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${isDarkMode ? 'bg-white/5 text-[#E1A030]' : 'bg-blue-50 text-[#001F8D]'}`}>
                            {formatDuration(getTotalTimeInPhase(card.phaseName))}
                        </span>
                    </div>
                    <div className="flex gap-1 h-1.5 w-full mb-4">
                        {phases.map((p, i) => (
                            <div key={p.name} className={`rounded-full h-full transition-all duration-300 ${i === currentPhaseIndex ? 'flex-[2]' : 'flex-1'}`} style={{ backgroundColor: i < currentPhaseIndex ? p.color : i === currentPhaseIndex ? p.color : (isDarkMode ? '#334155' : '#e2e8f0'), opacity: i < currentPhaseIndex ? 0.3 : 1 }}></div>
                        ))}
                    </div>
                    <div className="space-y-2 max-h-[120px] overflow-y-auto scrollbar-thin pr-2">
                        {['FASE DA MARIANA', 'CONSULTA AOS BANCOS', 'ENTREVISTA'].map((pName) => {
                            const duration = getTotalTimeInPhase(pName);
                            if (duration === 0) return null;
                            const isCurrent = pName === card.phaseName;
                            return (
                                <div key={pName} className="flex items-center justify-between text-[9px]">
                                    <span className={`font-bold truncate max-w-[140px] ${isCurrent ? (isDarkMode ? 'text-[#E1A030]' : 'text-[#001F8D]') : 'opacity-70'}`}>
                                        {pName}
                                    </span>
                                    <span className={`font-mono opacity-50`}>{formatDuration(duration)}</span>
                                </div>
                            );
                        })}
                    </div>
               </div>

               {/* SEÇÃO 4: TAGS */}
               <div className={`border-t pt-5 mt-auto ${borderSubtle} transition-colors duration-300`}>
                    <span className={`block text-[9px] font-black uppercase tracking-widest mb-3 ${textMuted}`}>TAGS</span>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {card.tags.map(tag => (
                            <span key={tag.id} className={`px-2 py-1 text-[9px] font-bold rounded-lg border flex items-center gap-1.5 ${isDarkMode ? 'bg-[#E1A030]/10 border-[#E1A030]/30 text-[#E1A030]' : 'bg-blue-50 border-blue-100 text-[#001F8D]'}`}>
                                {tag.text}
                                <i onClick={() => handleRemoveTag(tag.id)} className="fas fa-times cursor-pointer hover:text-white"></i>
                            </span>
                        ))}
                    </div>
                    <div className="relative group">
                        <input type="text" value={newTagText} onChange={e => setNewTagText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddTag()} placeholder="Nova tag..." className={`w-full text-[10px] font-bold rounded-xl px-4 py-2.5 outline-none border transition-all ${isDarkMode ? 'bg-[#0F172A] border-slate-700 focus:border-[#E1A030] text-white' : 'bg-white border-slate-200 focus:border-[#001F8D]/30'}`} />
                        <div onClick={handleAddTag} className={`absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all opacity-40 hover:opacity-100 ${isDarkMode ? 'text-[#E1A030]' : 'text-[#001F8D]'}`}><i className="fas fa-plus"></i></div>
                    </div>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};
