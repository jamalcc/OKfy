
import React, { useState } from 'react';
import { Card, Phase, Note } from '../types';
import { EditableField, EditableSelect } from './ui/Editable';
import { formatDuration, getTotalTimeInPhase, formatCPF, formatPhone, validateCPF } from '../utils/helpers';

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

const MOCK_USERS = [
  { id: 'u1', name: 'Mariana Silva', avatar: 'MS' },
  { id: 'u2', name: 'Carlos Admin', avatar: 'CA' },
  { id: 'u3', name: 'Ana Atendimento', avatar: 'AA' }
];

const SystemMessage = React.memo(({ text, isDarkMode, textMuted }: { text: string, isDarkMode: boolean, textMuted: string }) => (
  <div className="flex items-center gap-3 w-full opacity-40 py-2">
      <div className={`h-[1px] flex-1 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
      <div className="flex items-center gap-2">
          <i className="fas fa-microchip text-[10px]"></i>
          <span className={`text-[10px] font-black uppercase tracking-tighter ${textMuted}`}>{text}</span>
      </div>
      <div className={`h-[1px] flex-1 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
  </div>
));

const UserMessage = React.memo(({ note, isDarkMode, bgCard, borderSubtle, textMuted, btnBrandClass }: any) => {
  const timeString = new Date(note.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  return (
    <div className="flex justify-start gap-3 mb-3">
       <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 ${btnBrandClass}`}>
          {note.author[0]}
       </div>
       <div className={`max-w-[85%] px-4 py-3 rounded-2xl rounded-tl-none border shadow-sm ${borderSubtle} ${bgCard}`}>
          <div className="flex justify-between items-center gap-4 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider opacity-70">{note.author}</span>
              <span className={`text-[9px] ${textMuted} font-bold opacity-50`}>{timeString}</span>
          </div>
          <p className="text-sm leading-relaxed font-medium opacity-90">{note.text}</p>
       </div>
    </div>
  );
});

export const CardModal: React.FC<CardModalProps> = ({
  card, phases, onClose, onUpdate, onDelete, onArchive, isDarkMode
}) => {
  const [newNote, setNewNote] = useState('');

  const bgCard = isDarkMode ? 'bg-[#1E293B]' : 'bg-white';
  const bgCol = isDarkMode ? 'bg-[#0F172A]' : 'bg-slate-50/80';
  const borderSubtle = isDarkMode ? 'border-slate-700' : 'border-slate-200';
  const textMuted = isDarkMode ? 'text-slate-500' : 'text-slate-500';
  const btnBrandClass = isDarkMode ? 'bg-[#E1A030] text-black' : 'bg-[#001F8D] text-white';
  const iconBrandColor = isDarkMode ? 'text-[#E1A030]' : 'text-[#001F8D]';

  const bankStatusOptions = ["Sem bloqueio", "Bloqueio Interno"] as const;

  const getBankSummaryStatus = () => {
    const { pan, daycoval, c6 } = card.data.banks;
    if (pan === 'Bloqueio Interno' || daycoval === 'Bloqueio Interno' || c6 === 'Bloqueio Interno') {
      return { label: 'Bloqueio', color: 'text-rose-500' };
    }
    if (pan === 'Sem bloqueio' && daycoval === 'Sem bloqueio' && c6 === 'Sem bloqueio') {
      return { label: 'Liberado', color: 'text-emerald-500' };
    }
    if (!pan && !daycoval && !c6) return { label: 'Pendente', color: 'text-slate-400' };
    return { label: 'Em Análise', color: 'text-amber-500' };
  };

  // Alterado default de shouldLog para false para evitar spam no chat
  const handleUpdateData = (field: string, value: any, shouldLog = false) => {
    if (card.data[field as keyof typeof card.data] === value) return;
    let newNotes = card.notes;
    if (shouldLog) {
        newNotes = [{ author: 'Master', text: `Atualizou ${field} para ${value}`, timestamp: Date.now(), type: 'system' }, ...card.notes];
    }
    onUpdate({ ...card, data: { ...card.data, [field]: value }, notes: newNotes });
  };

  const handleUpdateBank = (bank: string, value: any) => {
    if (card.data.banks[bank as keyof typeof card.data.banks] === value) return;
    onUpdate({ 
        ...card, 
        data: { ...card.data, banks: { ...card.data.banks, [bank]: value } }
    });
  };

  const handleUpdatePhase = (newPhase: string) => {
    if (card.phaseName === newPhase) return;
    const now = Date.now();
    const historyItem = { 
      phaseName: card.phaseName, 
      durationMs: now - card.phaseUpdatedAt, 
      color: phases.find(p => p.name === card.phaseName)?.color || '#999', 
      timestamp: card.phaseUpdatedAt 
    };
    onUpdate({ 
      ...card, 
      phaseName: newPhase, 
      phaseUpdatedAt: now, 
      history: [...card.history, historyItem], 
      notes: [{ author: 'Master', text: `Moveu lead para ${newPhase}`, timestamp: now, type: 'system' }, ...card.notes] 
    });
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

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    onUpdate({ ...card, notes: [{ author: 'Consultor', text: newNote, timestamp: Date.now(), type: 'user' }, ...card.notes] });
    setNewNote('');
  };

  const getCertificateDisplay = () => {
      if (card.checklist.some(i => i.text === 'Todas' && i.completed)) return { text: 'Sem certificado', color: 'text-rose-500' };
      if (card.data.hasCertificate === true) return { text: 'Válido', color: 'text-emerald-500' };
      return { text: 'Pendente', color: 'text-slate-400' };
  };

  const currentAssignee = MOCK_USERS.find(u => u.id === card.assignee);
  const isChecked = (text: string) => card.checklist.some(i => i.text === text && i.completed);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 text-slate-800">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`${bgCard} w-full h-full md:h-[95vh] lg:max-w-[1280px] md:rounded-3xl shadow-2xl relative overflow-hidden flex flex-col border ${borderSubtle} ${isDarkMode ? 'text-slate-200' : ''}`}>
        
        {/* Header Robusto */}
        <header className={`h-16 border-b ${borderSubtle} flex items-center justify-between px-8 shrink-0`}>
           <div className="flex items-center gap-4 flex-1">
             <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: phases.find(p => p.name === card.phaseName)?.color }}>
                <i className="fas fa-user text-sm"></i>
             </div>
             <input value={card.title} onChange={(e) => onUpdate({...card, title: e.target.value})} className="text-xl font-black bg-transparent outline-none w-full tracking-tight" />
           </div>
           <div className="flex items-center gap-2">
               <button onClick={() => onArchive?.(card.id)} title="Arquivar" className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100/10 text-slate-400 hover:text-white transition-all"><i className="fas fa-box-archive text-sm"></i></button>
               <button onClick={() => onDelete?.(card.id)} title="Excluir" className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100/10 text-slate-400 hover:text-red-500 transition-all"><i className="fas fa-trash text-sm"></i></button>
               <div className={`w-px h-6 mx-3 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
               <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100/10 text-slate-400 transition-all"><i className="fas fa-times text-lg"></i></button>
           </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Coluna Esquerda: Cadastro Completo */}
            <div className={`w-full lg:w-[320px] p-8 overflow-y-auto border-r ${borderSubtle} flex flex-col shrink-0`}>
               {card.pipeline === 'legal' ? (
                 <>
                   <div className="flex items-center gap-2 mb-6">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                             <i className="fas fa-scale-balanced text-xs"></i>
                        </div>
                        <h3 className={`text-[10px] font-black uppercase tracking-widest ${textMuted}`}>Dossiê do Processo</h3>
                   </div>
                   
                   <div className={`p-1 rounded-2xl border mb-8 ${isDarkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                        <div className={`p-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} relative`}>
                            <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-md ${isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-white text-slate-400 border border-slate-200'}`}>
                                <i className="fas fa-university text-[10px]"></i>
                            </div>
                            <div className="pl-10">
                                <EditableField 
                                    label="Banco Reclamado" 
                                    value={card.data.targetBank || ''} 
                                    onChange={(v) => handleUpdateData('targetBank', v)} 
                                    isDarkMode={isDarkMode} 
                                    placeholder="Clique para adicionar" 
                                />
                            </div>
                        </div>
                        <div className="p-4 relative">
                            <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-md ${isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-white text-slate-400 border border-slate-200'}`}>
                                <i className="fas fa-user-tie text-[10px]"></i>
                            </div>
                            <div className="pl-10">
                                <EditableField 
                                    label="Corretor Envolvido" 
                                    value={card.data.brokerName || ''} 
                                    onChange={(v) => handleUpdateData('brokerName', v)} 
                                    isDarkMode={isDarkMode} 
                                    placeholder="Clique para adicionar" 
                                />
                            </div>
                        </div>
                   </div>
                   
                   <div className="mt-2">
                      <div className="flex items-center gap-2 mb-3">
                          <i className={`fas fa-align-left text-[10px] ${textMuted}`}></i>
                          <label className={`block text-[10px] font-black uppercase tracking-widest ${textMuted}`}>Descrição do Caso</label>
                      </div>
                      <textarea 
                          value={card.data.processDescription || ''}
                          onChange={(e) => handleUpdateData('processDescription', e.target.value)}
                          placeholder="Relate os detalhes..."
                          className={`w-full h-48 p-4 text-xs font-medium rounded-xl border-2 outline-none transition-all resize-none leading-relaxed ${isDarkMode ? 'bg-[#0F172A] border-slate-700 focus:border-[#E1A030] text-slate-200 placeholder:text-slate-700' : 'bg-slate-50 border-slate-200 focus:border-[#001F8D] placeholder:text-slate-300'}`}
                      />
                   </div>
                 </>
               ) : (
                 <>
                   <h3 className={`text-[10px] font-black uppercase mb-6 tracking-widest ${textMuted}`}>Informações do Lead</h3>
                   <div className="flex flex-col gap-6">
                       <EditableField label="E-mail Principal" value={card.data.email} onChange={(v) => handleUpdateData('email', v)} isDarkMode={isDarkMode} />
                       <EditableField label="Telefone / WhatsApp" value={card.data.phone} onChange={(v) => handleUpdateData('phone', formatPhone(v))} isDarkMode={isDarkMode} />
                       <EditableField label="Documento (CPF)" value={card.data.cpf} onChange={(v) => handleUpdateData('cpf', formatCPF(v))} isDarkMode={isDarkMode} />
                       <EditableField label="Tempo de Mercado" value={card.data.marketTime} onChange={(v) => handleUpdateData('marketTime', v)} isDarkMode={isDarkMode} />
                   </div>
                   
                   <div className="mt-10 pt-8 border-t border-dashed border-slate-700">
                       <h3 className={`text-[10px] font-black uppercase mb-4 tracking-widest ${textMuted}`}>Painel de Status</h3>
                       <div className={`space-y-3 p-5 rounded-2xl border ${isDarkMode ? 'bg-[#0F172A] border-slate-700 shadow-inner' : 'bg-slate-50'}`}>
                           <div className="flex justify-between items-center text-xs font-bold">
                              <span className={textMuted}>Jusbrasil</span>
                              <span className={card.data.jusbrasil === 'OK!' ? 'text-emerald-500' : card.data.jusbrasil === 'Problemas' ? 'text-rose-500' : 'text-slate-400'}>
                                 {card.data.jusbrasil || 'Aguardando'}
                              </span>
                           </div>
                           <div className="flex justify-between items-center text-xs font-bold">
                              <span className={textMuted}>Bancos</span>
                              {(() => {
                                const summary = getBankSummaryStatus();
                                return <span className={summary.color}>{summary.label}</span>;
                              })()}
                           </div>
                           <div className="flex justify-between items-center text-xs font-bold">
                              <span className={textMuted}>Certificado</span>
                              <span className={getCertificateDisplay().color}>{getCertificateDisplay().text}</span>
                           </div>
                       </div>
                   </div>
                 </>
               )}
            </div>

            {/* Coluna Central: O Fluxo de Trabalho */}
            <div className={`flex-1 flex flex-col border-r ${borderSubtle} ${bgCol} min-w-0`}>
               <div className={`px-8 py-4 border-b ${borderSubtle} ${bgCard} flex items-center justify-between shadow-sm shrink-0`}>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px]" style={{ backgroundColor: phases.find(p => p.name === card.phaseName)?.color }}>
                        <i className="fas fa-layer-group"></i>
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">{card.phaseName}</span>
                  </div>
                  <div className={`text-[10px] font-bold ${textMuted} bg-slate-500/5 px-3 py-1 rounded-full`}>
                    Tempo nesta fase: {formatDuration(Date.now() - card.phaseUpdatedAt)}
                  </div>
               </div>

               {/* ÁREA DE AÇÃO DINÂMICA */}
               <div className={`${bgCard} border-b ${borderSubtle} p-8 overflow-y-auto shrink-0 transition-all duration-500`}>
                  {card.phaseName === 'VERIFICAÇÃO DE SEGURANÇA' ? (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h4 className={`text-[10px] font-black uppercase mb-3 tracking-wider ${textMuted}`}>Análise Jurídica Automática</h4>
                                <div className="flex gap-3">
                                    <button onClick={() => handleUpdateData('jusbrasil', 'OK!', false)} className={`flex-1 py-4 rounded-xl text-xs font-bold border-2 transition-all ${card.data.jusbrasil === 'OK!' ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-transparent border-slate-700 text-slate-400 hover:border-emerald-500'}`}>FICHA LIMPA</button>
                                    <button onClick={() => handleUpdateData('jusbrasil', 'Problemas', false)} className={`flex-1 py-4 rounded-xl text-xs font-bold border-2 transition-all ${card.data.jusbrasil === 'Problemas' ? 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-600/20' : 'bg-transparent border-slate-700 text-slate-400 hover:border-rose-500'}`}>PROBLEMAS</button>
                                </div>
                            </div>
                            <div>
                                <h4 className={`text-[10px] font-black uppercase mb-3 tracking-wider ${textMuted}`}>Status de Certificação</h4>
                                <div className="flex gap-3">
                                    <button onClick={() => handleUpdateData('hasCertificate', true, false)} className={`flex-1 py-4 rounded-xl text-xs font-bold border-2 transition-all ${card.data.hasCertificate === true ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-transparent border-slate-700 text-slate-400'}`}>CERTIFICADO OK</button>
                                    <button onClick={() => handleUpdateData('hasCertificate', false, false)} className={`flex-1 py-4 rounded-xl text-xs font-bold border-2 transition-all ${card.data.hasCertificate === false ? 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-600/20' : 'bg-transparent border-slate-700 text-slate-400'}`}>PENDÊNCIA</button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Checklist de Certificação - Exibido apenas se houver Pendência */}
                        {card.data.hasCertificate === false && (
                            <div className="pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <h4 className={`text-[10px] font-black uppercase mb-4 tracking-wider ${textMuted}`}>Checklist de Certificação</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {['Todas', 'PLDFT', 'Consignado + LGPD'].map((item) => (
                                        <div 
                                            key={item} 
                                            onClick={() => toggleChecklistItem(item)} 
                                            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${isChecked(item) ? (isDarkMode ? 'bg-[#E1A030]/10 border-[#E1A030] shadow-lg shadow-[#E1A030]/5' : 'bg-indigo-50 border-[#001F8D]') : 'border-slate-700 hover:bg-slate-800/40'}`}
                                        >
                                            <span className={`text-[11px] font-black uppercase tracking-tight ${isChecked(item) ? (isDarkMode ? 'text-[#E1A030]' : 'text-[#001F8D]') : textMuted}`}>{item}</span>
                                            <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center ${isChecked(item) ? (isDarkMode ? 'bg-[#E1A030] border-[#E1A030] text-black' : 'bg-[#001F8D] border-[#001F8D] text-white') : 'border-slate-600'}`}>
                                                {isChecked(item) && <i className="fas fa-check text-[10px]"></i>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                  ) : card.phaseName === 'CONSULTA AOS BANCOS' ? (
                    <div className="space-y-6">
                        <h4 className={`text-[10px] font-black uppercase mb-4 tracking-wider ${textMuted}`}>Pré-Aprovação em Instituições Financeiras</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {['pan', 'daycoval', 'c6'].map(bank => (
                                <div key={bank} className={`p-6 rounded-2xl border-2 ${isDarkMode ? 'border-slate-700 bg-[#0F172A]' : 'bg-white shadow-lg'}`}>
                                    <span className="text-xs font-black uppercase mb-4 block text-center tracking-widest">{bank}</span>
                                    <div className="flex flex-col gap-2">
                                        {bankStatusOptions.map(opt => {
                                            const isSelected = card.data.banks[bank as keyof typeof card.data.banks] === opt;
                                            let btnClass = isSelected 
                                                ? (opt === 'Bloqueio Interno' ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20')
                                                : 'border-slate-700 bg-white/5 opacity-50 hover:opacity-100 hover:border-slate-400';
                                            return (
                                                <button key={opt} onClick={() => handleUpdateBank(bank, opt)} className={`w-full py-3 rounded-xl text-[10px] font-black uppercase border transition-all ${btnClass}`}>
                                                    {opt.replace('Bloqueio Interno', 'Bloqueado').replace('Sem bloqueio', 'Liberado')}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                  ) : card.phaseName === 'ENTREVISTA' ? (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h4 className={`text-[10px] font-black uppercase mb-3 tracking-wider ${textMuted}`}>Controle de Tentativas</h4>
                                {/* Botões de Contato Limpos e sem Borda Externa */}
                                <div className="flex items-center gap-3">
                                    {[1, 2, 3].map(num => (
                                        <button 
                                            key={num} 
                                            onClick={() => handleUpdateData('contactAttempts', card.data.contactAttempts === num ? num - 1 : num, false)}
                                            className={`w-12 h-12 rounded-xl border-2 transition-all flex items-center justify-center ${card.data.contactAttempts >= num ? (isDarkMode ? 'bg-[#E1A030] border-[#E1A030] shadow-lg text-black' : 'bg-[#001F8D] border-[#001F8D] text-white') : 'bg-transparent border-slate-700 text-slate-500 hover:border-slate-500'}`}
                                        >
                                            <span className="font-black text-sm">{num}</span>
                                        </button>
                                    ))}
                                    
                                    <button 
                                        onClick={() => handleUpdateData('contactSuccess', !card.data.contactSuccess, true)}
                                        className={`h-12 px-6 rounded-xl text-[11px] font-black uppercase border-2 transition-all flex items-center justify-center gap-2 ml-2 ${card.data.contactSuccess ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-transparent border-dashed border-slate-700 text-slate-500 hover:text-white hover:border-slate-400'}`}
                                    >
                                        <i className={`fas ${card.data.contactSuccess ? 'fa-check-circle' : 'fa-phone'}`}></i>
                                        {card.data.contactSuccess ? 'SUCESSO' : 'MARCAR SUCESSO'}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <h4 className={`text-[10px] font-black uppercase mb-3 tracking-wider ${textMuted}`}>Modelo de Operação</h4>
                                <div className="flex gap-4">
                                    {['Loja', 'Home Office'].map(type => (
                                        <button 
                                            key={type}
                                            onClick={() => handleUpdateData('saleType', type, false)}
                                            className={`py-4 rounded-2xl text-[11px] font-black uppercase border-2 transition-all flex-1 ${card.data.saleType === type ? (isDarkMode ? 'bg-[#E1A030]/20 border-[#E1A030] text-[#E1A030] shadow-lg shadow-[#E1A030]/10' : 'bg-[#001F8D]/10 border-[#001F8D] text-[#001F8D]') : 'border-slate-700 text-slate-600 opacity-40 hover:opacity-100'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 className={`text-[10px] font-black uppercase mb-4 tracking-wider ${textMuted}`}>Principais Produtos de Interesse</h4>
                            <textarea 
                                value={card.data.topProducts}
                                onChange={(e) => handleUpdateData('topProducts', e.target.value, false)}
                                placeholder="Descreva os produtos e necessidades identificadas durante a entrevista..."
                                className={`w-full h-32 p-5 text-sm font-medium rounded-2xl border-2 outline-none transition-all resize-none ${isDarkMode ? 'bg-[#0F172A] border-slate-700 focus:border-[#E1A030] text-slate-200' : 'bg-slate-50 border-slate-200 focus:border-[#001F8D]'}`}
                            />
                        </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 opacity-30 grayscale">
                        <i className={`fas fa-rocket mb-6 text-5xl ${iconBrandColor}`}></i>
                        <p className="text-sm font-black uppercase tracking-[0.2em]">Pronto para Avançar</p>
                        <p className="text-[10px] mt-2 font-bold text-slate-500">Nenhuma ação pendente configurada para esta fase.</p>
                    </div>
                  )}
               </div>
               
               <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col-reverse scrollbar-thin space-y-reverse space-y-1">
                   {card.notes.map((note, idx) => note.type === 'system' 
                     ? <SystemMessage key={idx} text={note.text} isDarkMode={isDarkMode} textMuted={textMuted} />
                     : <UserMessage key={idx} note={note} isDarkMode={isDarkMode} bgCard={bgCard} borderSubtle={borderSubtle} textMuted={textMuted} btnBrandClass={btnBrandClass} />
                   )}
               </div>
               
               <div className={`p-5 border-t ${borderSubtle} flex gap-4 ${bgCard} shrink-0 shadow-2xl z-10`}>
                   <div className="flex-1 relative">
                      <input 
                        value={newNote} 
                        onChange={(e) => setNewNote(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && handleAddNote()} 
                        placeholder="Escreva uma anotação ou atualização interna..." 
                        className={`w-full text-sm font-medium bg-transparent border-2 ${borderSubtle} rounded-2xl px-6 py-4 outline-none focus:border-slate-400 transition-all placeholder:opacity-30`} 
                      />
                   </div>
                   <button onClick={handleAddNote} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-xl ${btnBrandClass}`}>
                      <i className="fas fa-paper-plane text-lg"></i>
                   </button>
               </div>
            </div>

            <div className={`w-full lg:w-[320px] p-8 flex flex-col gap-6 ${bgCol} shrink-0`}>
               <div className={`p-6 rounded-3xl border-2 ${isDarkMode ? 'bg-[#1E293B] border-slate-700' : 'bg-white'} shadow-xl`}>
                   <label className={`block text-[10px] font-black uppercase mb-3 tracking-widest ${textMuted}`}>Controle de Fluxo</label>
                   <div className="relative mb-6">
                      <select value={card.phaseName} onChange={(e) => handleUpdatePhase(e.target.value)} className={`w-full bg-transparent text-sm font-black mb-0 outline-none border-2 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} rounded-xl p-3 appearance-none cursor-pointer`}>
                          {phases.map(p => <option key={p.name} value={p.name} className={isDarkMode ? 'bg-[#0F172A]' : ''}>{p.name}</option>)}
                      </select>
                      <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none opacity-40"></i>
                   </div>
                   <button onClick={() => { const idx = phases.findIndex(p => p.name === card.phaseName); if(idx < phases.length - 1) handleUpdatePhase(phases[idx+1].name); }} className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-[0.96] transition-all ${btnBrandClass}`}>
                      <span>AVANÇAR LEAD</span>
                      <i className="fas fa-arrow-right"></i>
                   </button>
               </div>

               <div className={`p-6 rounded-3xl border-2 ${isDarkMode ? 'bg-[#1E293B] border-slate-700' : 'bg-white'} shadow-xl`}>
                   <label className={`block text-[10px] font-black uppercase mb-3 tracking-widest ${textMuted}`}>Consultor Responsável</label>
                   <div className={`flex items-center gap-4 p-3 rounded-2xl ${isDarkMode ? 'bg-black/20' : 'bg-slate-100'}`}>
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shadow-lg ${btnBrandClass}`}>{currentAssignee?.avatar || '?'}</div>
                       <div className="flex flex-col">
                          <span className="text-sm font-black">{currentAssignee?.name || 'Não atribuído'}</span>
                          <span className="text-[9px] font-bold uppercase tracking-tighter opacity-40">Atendimento Ativo</span>
                       </div>
                   </div>
               </div>

               <div className={`mt-auto pt-8 border-t-2 border-slate-800/50`}>
                    <div className="flex justify-between items-center mb-4">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${textMuted}`}>TEMPO DE PIPELINE</span>
                        <span className={`text-[11px] font-black px-3 py-1 rounded-full ${isDarkMode ? 'bg-white/5 text-[#E1A030] border border-[#E1A030]/20' : 'bg-blue-50 text-[#001F8D]'}`}>
                            {formatDuration(getTotalTimeInPhase(card, card.phaseName))}
                        </span>
                    </div>
                    <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-thin pr-1">
                        {phases.map(phase => {
                            const duration = getTotalTimeInPhase(card, phase.name);
                            if (duration === 0 && card.phaseName !== phase.name) return null;
                            const isCurrent = phase.name === card.phaseName;
                            return (
                                <div key={phase.name} className={`flex justify-between items-center text-[10px] p-3 rounded-xl transition-all ${isCurrent ? (isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-slate-100') : 'opacity-60 hover:opacity-100'}`}>
                                    <div className="flex items-center gap-2 truncate pr-2">
                                       <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: phase.color }}></div>
                                       <span className={`font-black uppercase truncate tracking-tighter ${isCurrent ? (isDarkMode ? 'text-[#E1A030]' : 'text-[#001F8D]') : ''}`}>{phase.name}</span>
                                    </div>
                                    <span className="font-mono font-black opacity-60 text-[11px] shrink-0">{formatDuration(duration)}</span>
                                </div>
                            );
                        })}
                    </div>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};
