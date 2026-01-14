
import React, { useState, useEffect } from 'react';
import { Card, Phase, NewLeadFormData } from './types';
import { Navbar } from './components/Navbar';
import { KanbanBoard } from './components/KanbanBoard';
import { LeadModal } from './components/LeadModal';
import { CardModal } from './components/CardModal';
import { generatePipelineFromPrompt } from './services/geminiService';

// ==========================================
// CONFIGURAÇÃO INICIAL
// ==========================================

const INITIAL_PHASES: Phase[] = [
  { name: 'FASE DA MARIANA', color: '#DB2777' }, 
  { name: 'CONSULTA AOS BANCOS', color: '#6366F1' },
  { name: 'ENTREVISTA', color: '#F59E0B' },
  { name: 'ASSINATURA DO CONTRATO', color: '#8B5CF6' },
  { name: 'FINALIZADO', color: '#10B981' }, 
  { name: 'RECUSADO', color: '#EF4444' }
];

const INITIAL_CARDS: Card[] = [
  {
    id: 'ID-882',
    title: 'Ricardo Alcantara',
    phaseName: 'FASE DA MARIANA',
    createdAt: Date.now() - 172800000,
    phaseUpdatedAt: Date.now() - 3600000,
    data: {
      cpf: '123.456.789-00',
      email: 'ricardo@exemplo.com',
      source: 'Anuncio Google',
      jusbrasil: 'OK!',
      hasCertificate: true,
      phone: '(11) 98877-6655',
      marketTime: '5 anos',
      banks: { pan: 'Sem bloqueio', daycoval: 'Bloqueio Interno', c6: 'Sem bloqueio' }
    },
    checklist: [],
    notes: [
      { author: 'Sistema', text: 'Lead criado via integração Webhook.', timestamp: Date.now() - 172800000, type: 'system' }
    ],
    tags: [{ id: 't1', text: 'Hot Lead', color: 'indigo' }],
    history: []
  }
];

// ==========================================
// COMPONENTE PRINCIPAL (APP)
// ==========================================

const App: React.FC = () => {
  // --- Estados Globais (UX: Persistência do Tema) ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('okfy_theme');
      return saved === 'dark';
    }
    return false;
  });

  const [activeTab, setActiveTab] = useState<'kanban' | 'dashboard'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  
  // --- Estados de Dados ---
  const [phases, setPhases] = useState<Phase[]>(INITIAL_PHASES);
  const [cards, setCards] = useState<Card[]>(INITIAL_CARDS);
  
  // --- Estados de UI/Interação ---
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dropTargetPhase, setDropTargetPhase] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isCreatingLead, setIsCreatingLead] = useState(false);
  
  // --- Estado IA ---
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // --- Efeitos ---
  useEffect(() => {
    localStorage.setItem('okfy_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // --- Funções Utilitárias ---
  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  
  const formatDuration = (ms: number) => {
    const min = Math.floor(ms / 60000);
    const hrs = Math.floor(min / 60);
    const days = Math.floor(hrs / 24);
    if (days > 0) return `${days}d ${hrs % 24}h`;
    if (hrs > 0) return `${hrs}h ${min % 60}m`;
    return `${min}m`;
  };

  const validateCPF = (cpf: string) => {
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) return false;
    let sum = 0, remainder;
    for (let i = 1; i <= 9; i++) sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;
    sum = 0;
    for (let i = 1; i <= 10; i++) sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;
    return true;
  };

  const formatCPF = (v: string) => v.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  const formatPhone = (v: string) => v.replace(/\D/g, '').slice(0, 11).replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');

  // --- Lógica Kanban ---
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('cardId', id);
    setDraggedCardId(id);
  };

  const handleDrop = (e: React.DragEvent, targetPhaseName: string) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('cardId');
    
    setCards(prev => prev.map(c => {
      if (c.id === cardId && c.phaseName !== targetPhaseName) {
        const now = Date.now();
        return { 
          ...c, 
          phaseName: targetPhaseName, 
          phaseUpdatedAt: now,
          history: [...c.history, { 
            phaseName: c.phaseName, 
            durationMs: now - c.phaseUpdatedAt, 
            color: phases.find(p => p.name === c.phaseName)?.color || '#999', 
            timestamp: c.phaseUpdatedAt 
          }] 
        };
      }
      return c;
    }));
    setDraggedCardId(null);
    setDropTargetPhase(null);
  };

  const handleUpdateCard = (updatedCard: Card) => {
    setCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
    setSelectedCard(updatedCard);
  };

  // --- Funcionalidade de Excluir/Arquivar ---
  const handleDeleteCard = (cardId: string) => {
    if (confirm("Tem certeza que deseja excluir permanentemente este lead?")) {
      setCards(prev => prev.filter(c => c.id !== cardId));
      setSelectedCard(null);
    }
  };

  const handleArchiveCard = (cardId: string) => {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, archived: true } : c));
    setSelectedCard(null);
  };

  // --- Criação de Lead ---
  const handleCreateLead = (data: NewLeadFormData) => {
    if (!validateCPF(data.cpf)) { alert('CPF Inválido'); return; }
    
    const newCard: Card = {
      id: `ID-${Date.now()}`,
      title: data.title,
      phaseName: phases[0].name,
      createdAt: Date.now(),
      phaseUpdatedAt: Date.now(),
      data: {
        ...data,
        jusbrasil: null, hasCertificate: null,
        banks: { pan: null, daycoval: null, c6: null }
      },
      checklist: [], notes: [], tags: [], history: []
    };
    setCards([newCard, ...cards]);
    setIsCreatingLead(false);
  };

  // --- IA Pipeline Generation ---
  const handleGeneratePipeline = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const result = await generatePipelineFromPrompt(aiPrompt);
      if (result && result.phases) {
        const newPhases: Phase[] = result.phases;
        setPhases(newPhases);
        
        // Mover cards existentes para a primeira fase nova
        setCards(prev => prev.map(c => ({
          ...c,
          phaseName: newPhases[0].name,
          phaseUpdatedAt: Date.now(),
          history: [...c.history, { phaseName: 'MIGRAÇÃO IA', durationMs: 0, color: '#000', timestamp: Date.now() }]
        })));

        setIsAIModalOpen(false);
        setAiPrompt('');
      }
    } catch (error) {
      alert("Erro ao gerar pipeline via IA. Verifique sua API Key.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Cores personalizadas
  const bgMain = isDarkMode ? 'bg-black' : 'bg-[#F8FAFC]';
  const textMain = isDarkMode ? 'text-slate-100' : 'text-slate-900';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  // Filtragem (Busca e Arquivados)
  const filteredCards = cards.filter(card => {
    if (card.archived) return false; // Não mostra arquivados
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return card.title.toLowerCase().includes(q) || card.data.cpf.includes(q) || card.id.includes(q);
  });

  return (
    <div className={`h-screen w-screen flex flex-col font-sans overflow-hidden transition-colors duration-300 ${bgMain} ${textMain}`}>
      
      {/* NAVBAR */}
      <Navbar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme}
        onCreateLead={() => setIsCreatingLead(true)}
        onOpenAI={() => setIsAIModalOpen(true)}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {activeTab === 'dashboard' ? (
           <div className="flex-1 p-8 flex flex-col items-center justify-center w-full animate-in fade-in duration-500">
              <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-2xl ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white'}`}>
                 <i className={`fas fa-chart-pie text-4xl ${isDarkMode ? 'text-[#E29D1B]' : 'text-[#233F93]'}`}></i>
              </div>
              <h2 className="text-3xl font-black mb-2 text-center tracking-tight">Dashboard</h2>
              <p className={`text-center mb-8 max-w-md ${textMuted}`}>Visualização de métricas e performance em construção.</p>
           </div>
        ) : (
          <KanbanBoard 
            phases={phases}
            cards={filteredCards}
            isDarkMode={isDarkMode}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            onCardClick={setSelectedCard}
            draggedCardId={draggedCardId}
            dropTargetPhase={dropTargetPhase}
            setDropTargetPhase={setDropTargetPhase}
            formatDuration={formatDuration}
          />
        )}
      </main>

      <LeadModal 
        isOpen={isCreatingLead} 
        onClose={() => setIsCreatingLead(false)}
        onSubmit={handleCreateLead}
        isDarkMode={isDarkMode}
        formatCPF={formatCPF}
        formatPhone={formatPhone}
        validateCPF={validateCPF}
      />
      
      {selectedCard && (
        <CardModal 
          card={selectedCard}
          phases={phases}
          onClose={() => setSelectedCard(null)}
          onUpdate={handleUpdateCard}
          onDelete={handleDeleteCard}
          onArchive={handleArchiveCard}
          isDarkMode={isDarkMode}
          formatCPF={formatCPF}
          formatPhone={formatPhone}
          validateCPF={validateCPF}
        />
      )}

      {/* Modal IA Simplificado */}
      {isAIModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isGenerating && setIsAIModalOpen(false)}></div>
          <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl p-6 ${isDarkMode ? 'bg-[#1E1E1E] text-white' : 'bg-white text-slate-900'} border ${isDarkMode ? 'border-neutral-700' : 'border-slate-200'}`}>
             <h2 className="text-lg font-black uppercase tracking-wide mb-4 flex items-center gap-2">
               <i className={`fas fa-wand-magic-sparkles ${isDarkMode ? 'text-[#E29D1B]' : 'text-[#233F93]'}`}></i>
               Gerar Fluxo com IA
             </h2>
             <p className={`text-sm mb-4 ${textMuted}`}>Descreva o processo que você deseja (ex: "Processo de Vendas B2B" ou "Recrutamento de TI") e a IA criará as fases automaticamente.</p>
             <textarea 
               value={aiPrompt}
               onChange={(e) => setAiPrompt(e.target.value)}
               className={`w-full h-24 p-3 rounded-xl text-sm font-medium outline-none border focus:ring-2 transition-all resize-none ${isDarkMode ? 'bg-black border-neutral-700 focus:ring-[#E29D1B]' : 'bg-slate-50 border-slate-200 focus:ring-[#233F93]'}`}
               placeholder="Ex: Pipeline de Venda de Imóveis de Luxo..."
               disabled={isGenerating}
             />
             <div className="flex justify-end gap-3 mt-4">
                <button 
                  onClick={() => setIsAIModalOpen(false)} 
                  disabled={isGenerating}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase ${textMuted} hover:opacity-80`}
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleGeneratePipeline}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-wide flex items-center gap-2 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''} ${isDarkMode ? 'bg-[#E29D1B] text-black' : 'bg-[#233F93] text-white'}`}
                >
                  {isGenerating ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-bolt"></i>}
                  {isGenerating ? 'Gerando...' : 'Gerar Pipeline'}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
