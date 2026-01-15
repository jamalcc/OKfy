
import React, { useState, useEffect } from 'react';
import { Card, Phase, NewLeadFormData } from './types';
import { Navbar } from './components/Navbar';
import { KanbanBoard } from './components/KanbanBoard';
import { LeadModal } from './components/LeadModal';
import { CardModal } from './components/CardModal';
import { generatePipelineFromPrompt } from './services/geminiService';

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

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('okfy_theme');
      return saved === 'dark';
    }
    return false;
  });

  const [activeTab, setActiveTab] = useState<'kanban' | 'dashboard'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [phases, setPhases] = useState<Phase[]>(INITIAL_PHASES);
  const [cards, setCards] = useState<Card[]>(INITIAL_CARDS);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dropTargetPhase, setDropTargetPhase] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isCreatingLead, setIsCreatingLead] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    localStorage.setItem('okfy_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

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
    return true;
  };

  const formatCPF = (v: string) => v.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  const formatPhone = (v: string) => v.replace(/\D/g, '').slice(0, 11).replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');

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

  const handleDeleteCard = (cardId: string) => {
    if (confirm("Deseja excluir este lead?")) {
      setCards(prev => prev.filter(c => c.id !== cardId));
      setSelectedCard(null);
    }
  };

  const handleArchiveCard = (cardId: string) => {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, archived: true } : c));
    setSelectedCard(null);
  };

  const handleCreateLead = (data: NewLeadFormData) => {
    const newCard: Card = {
      id: `ID-${Date.now().toString().slice(-3)}`,
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

  const handleGeneratePipeline = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const result = await generatePipelineFromPrompt(aiPrompt);
      if (result && result.phases) {
        setPhases(result.phases);
        setCards(prev => prev.map(c => ({
          ...c,
          phaseName: result.phases[0].name,
          phaseUpdatedAt: Date.now()
        })));
        setIsAIModalOpen(false);
      }
    } catch (error) {
      alert("Erro na IA.");
    } finally { setIsGenerating(false); }
  };

  const filteredCards = cards.filter(card => {
    if (card.archived) return false;
    if (!searchQuery) return true;
    return card.title.toLowerCase().includes(searchQuery.toLowerCase()) || card.data.cpf.includes(searchQuery);
  });

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-sans transition-colors duration-500 ease-in-out ${isDarkMode ? 'bg-[#0F172A] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* SIDEBAR */}
      <aside className={`w-64 flex-shrink-0 flex flex-col border-r transition-all duration-300 ${isDarkMode ? 'bg-[#020617] border-slate-800' : 'bg-[#0F172A] border-slate-900'}`}>
        <div className="p-6 flex items-center gap-3">
          {/* Logo Box: Amarelo no Dark, Azul Profundo no Light */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-colors duration-300 ${isDarkMode ? 'bg-[#E1A030] text-black' : 'bg-[#001F8D] text-white'}`}>
            <i className="fas fa-bolt text-xl"></i>
          </div>
          <span className={`font-black text-xl tracking-tighter text-white`}>OKfy</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {/* Nav Buttons: Dark Mode Active = Amarelo/Preto */}
          <button onClick={() => setActiveTab('kanban')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'kanban' ? (isDarkMode ? 'bg-[#E1A030] text-black shadow-lg shadow-[#E1A030]/20' : 'bg-[#001F8D] text-white shadow-md') : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <i className="fas fa-columns w-5"></i> KanbanBoard
          </button>
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'dashboard' ? (isDarkMode ? 'bg-[#E1A030] text-black shadow-lg shadow-[#E1A030]/20' : 'bg-[#001F8D] text-white shadow-md') : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <i className="fas fa-chart-line w-5"></i> Dashboard
          </button>
          
          <div className="pt-6 pb-2 px-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Configurações</span>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <i className="fas fa-user-group w-5"></i> Time
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <i className="fas fa-cog w-5"></i> Ajustes
          </button>
        </nav>

        <div className={`p-4 border-t transition-colors duration-300 ${isDarkMode ? 'border-slate-800' : 'border-slate-800'}`}>
          <button onClick={toggleTheme} className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/5 transition-all group">
            <span className="uppercase tracking-wider">{isDarkMode ? 'Claro' : 'Escuro'}</span>
            <i className={`fas transition-transform duration-500 ${isDarkMode ? 'fa-sun text-[#E1A030] rotate-180' : 'fa-moon rotate-0'}`}></i>
          </button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 transition-colors duration-500">
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

        <main className={`flex-1 relative overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-slate-50'}`}>
          {activeTab === 'dashboard' ? (
            <div className="p-10 flex flex-col items-center justify-center h-full">
              <h1 className="text-4xl font-black mb-4">Métricas do Fluxo</h1>
              <p className="text-slate-500">Analytics avançado em desenvolvimento.</p>
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
              onQuickAdd={(phase) => setIsCreatingLead(true)}
            />
          )}
        </main>
      </div>

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

      {isAIModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-md bg-black/60 animate-in fade-in duration-300">
          <div className={`relative w-full max-w-lg rounded-3xl shadow-2xl p-8 transition-colors duration-300 ${isDarkMode ? 'bg-[#1E293B] border border-slate-700 text-slate-200' : 'bg-white text-slate-900'}`}>
             <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
               <i className={`fas fa-wand-sparkles ${isDarkMode ? 'text-[#E1A030]' : 'text-[#001F8D]'}`}></i>
               IA Workflow Designer
             </h2>
             <textarea 
               value={aiPrompt}
               onChange={(e) => setAiPrompt(e.target.value)}
               className={`w-full h-32 p-4 rounded-2xl text-sm outline-none border focus:ring-1 transition-all resize-none mb-6 ${isDarkMode ? 'bg-[#0F172A] border-slate-700 focus:border-[#E1A030] focus:ring-[#E1A030]' : 'bg-slate-50 border-slate-200 focus:ring-[#001F8D]'}`}
               placeholder="Descreva seu processo aqui..."
             />
             <div className="flex justify-end gap-3">
                <button onClick={() => setIsAIModalOpen(false)} className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">Cancelar</button>
                <button onClick={handleGeneratePipeline} className={`px-8 py-2 rounded-xl text-sm font-black shadow-lg transition-all active:scale-95 ${isDarkMode ? 'bg-[#E1A030] text-black shadow-[#E1A030]/20' : 'bg-[#001F8D] text-white shadow-[#001F8D]/20'}`}>Criar Pipeline</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
