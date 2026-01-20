
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Phase } from './types';
import { Navbar } from './components/Navbar';
import { KanbanBoard } from './components/KanbanBoard';
import { LeadModal } from './components/LeadModal';
import { CardModal } from './components/CardModal';
import { PublicLeadForm } from './components/PublicLeadForm'; 
import { generatePipelineFromPrompt } from './services/geminiService';
import { useLeads } from './hooks/useLeads';
import { formatCPF, formatPhone, validateCPF, formatDuration } from './utils/helpers';

const COMMERCIAL_PHASES: Phase[] = [
  { name: 'VERIFICAÇÃO DE SEGURANÇA', color: '#DB2777' }, 
  { name: 'CONSULTA AOS BANCOS', color: '#6366F1' },
  { name: 'ENTREVISTA', color: '#F59E0B' },
  { name: 'ASSINATURA DO CONTRATO', color: '#8B5CF6' },
  { name: 'FINALIZADO', color: '#10B981' }, 
  { name: 'RECUSADO', color: '#EF4444' }
];

const LEGAL_PHASES: Phase[] = [
  { name: 'Análise Juridica', color: '#3B82F6' },
  { name: 'Termo de Débito', color: '#EAB308' },
  { name: 'Confissão de Dívida', color: '#F97316' },
  { name: 'Pendente Documentos', color: '#D97706' },
  { name: 'Processos em Andamento', color: '#8B5CF6' },
  { name: 'Negativação do Corretor', color: '#EF4444' },
  { name: 'Finalizados', color: '#10B981' }
];

const INITIAL_CARDS: Card[] = [
  {
    id: 'ID-882',
    title: 'Ricardo Alcantara',
    phaseName: 'VERIFICAÇÃO DE SEGURANÇA',
    pipeline: 'commercial',
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
      banks: { pan: 'Sem bloqueio', daycoval: 'Bloqueio Interno', c6: 'Sem bloqueio' },
      contactAttempts: 0,
      contactSuccess: false,
      saleType: null,
      topProducts: ''
    },
    checklist: [],
    notes: [{ author: 'Sistema', text: 'Lead criado via integração Webhook.', timestamp: Date.now() - 172800000, type: 'system' }],
    tags: [{ id: 't1', text: 'Hot Lead', color: 'indigo' }],
    history: [],
    assignee: 'u1'
  }
];

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('okfy_theme') === 'dark');
  const [activeTab, setActiveTab] = useState<'kanban' | 'dashboard' | 'public_form'>('kanban'); 
  const [activeModule, setActiveModule] = useState<'commercial' | 'legal'>('commercial'); // Novo estado para Módulo
  const [searchQuery, setSearchQuery] = useState('');
  
  // As fases agora dependem do módulo ativo
  const currentPhases = activeModule === 'commercial' ? COMMERCIAL_PHASES : LEGAL_PHASES;
  
  // Usamos as fases comerciais como base para o hook, mas passamos as fases corretas para o KanbanBoard
  const { cards, addLead, addCard, updateCard, deleteCard, archiveCard, moveCard } = useLeads(INITIAL_CARDS, COMMERCIAL_PHASES);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dropTargetPhase, setDropTargetPhase] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isCreatingLead, setIsCreatingLead] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    localStorage.setItem('okfy_theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const selectedCard = useMemo(() => cards.find(c => c.id === selectedCardId) || null, [cards, selectedCardId]);

  // Filtra cards baseado no módulo ativo (pipeline) E na busca
  const filteredCards = useMemo(() => cards.filter(card => {
    if (card.archived) return false;
    // Filtro principal: Pipeline
    if (card.pipeline !== activeModule) return false;

    const q = searchQuery.toLowerCase();
    return !searchQuery || card.title.toLowerCase().includes(q) || card.data.cpf.includes(q);
  }), [cards, searchQuery, activeModule]);

  const handleDrop = (e: React.DragEvent, targetPhase: string) => {
    const cardId = e.dataTransfer.getData('cardId');
    moveCard(cardId, targetPhase);
    setDraggedCardId(null);
    setDropTargetPhase(null);
  };

  // Função auxiliar para criar card no jurídico (apenas para teste/exemplo, já que não tem form específico)
  const handleQuickAddLegal = (phaseName: string) => {
      const newCard: Card = {
        id: `LG-${Date.now()}`,
        title: 'Novo Processo Jurídico',
        phaseName: phaseName,
        pipeline: 'legal',
        createdAt: Date.now(),
        phaseUpdatedAt: Date.now(),
        data: {
            cpf: '', email: '', source: 'Interno', jusbrasil: null, hasCertificate: null,
            banks: { pan: null, daycoval: null, c6: null }, phone: '', marketTime: '',
            contactAttempts: 0, contactSuccess: false, saleType: null, topProducts: '',
            // Inicializa campos jurídicos
            brokerName: '', targetBank: '', processDescription: ''
        },
        checklist: [], notes: [], tags: [], history: []
      };
      addCard(newCard);
  };

  const handleGeneratePipeline = async () => {
    // Logic kept but applies primarily to generic prompt generation
    // Implementation omitted for brevity as it touches phases state which is now derived
    setIsGenerating(false);
    setIsAIModalOpen(false);
  };

  if (activeTab === 'public_form') {
    return <PublicLeadForm onSubmit={addLead} onBack={() => setActiveTab('kanban')} isDarkMode={isDarkMode} />;
  }

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-sans transition-colors duration-500 ${isDarkMode ? 'bg-[#0F172A] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      
      <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} flex-shrink-0 flex flex-col border-r transition-all duration-300 ${isDarkMode ? 'bg-[#020617] border-slate-800' : 'bg-[#0F172A] border-slate-900'}`}>
        
        <div className={`p-6 flex items-center ${isSidebarCollapsed ? 'flex-col justify-center gap-4' : 'justify-between'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shrink-0 ${isDarkMode ? 'bg-[#E1A030] text-black' : 'bg-[#001F8D] text-white'}`}>
              <i className="fas fa-bolt text-xl"></i>
            </div>
            {!isSidebarCollapsed && <span className="font-black text-xl tracking-tighter text-white overflow-hidden whitespace-nowrap">OKfy</span>}
          </div>
          
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
            title={isSidebarCollapsed ? "Expandir Menu" : "Minimizar Menu"}
          >
            <i className={`fas ${isSidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <button 
            onClick={() => setActiveTab('kanban')} 
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-start px-4'} py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'kanban' ? (isDarkMode ? 'bg-[#E1A030] text-black shadow-lg shadow-[#E1A030]/20' : 'bg-[#001F8D] text-white') : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            title="Kanban"
          >
            <i className="fas fa-columns w-5 text-center"></i>
            {!isSidebarCollapsed && <span className="ml-3 truncate">Kanban</span>}
          </button>
          
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-start px-4'} py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'dashboard' ? (isDarkMode ? 'bg-[#E1A030] text-black shadow-lg shadow-[#E1A030]/20' : 'bg-[#001F8D] text-white') : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            title="Dashboard"
          >
            <i className="fas fa-chart-line w-5 text-center"></i>
            {!isSidebarCollapsed && <span className="ml-3 truncate">Dashboard</span>}
          </button>

          {/* Botão para simular o link do cliente */}
          <div className="pt-4 mt-4 border-t border-white/5">
             <button 
                onClick={() => setActiveTab('public_form')} 
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-start px-4'} py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-emerald-500 hover:bg-emerald-500/10`}
                title="Formulário do Cliente"
              >
                <i className="fas fa-external-link-alt w-5 text-center"></i>
                {!isSidebarCollapsed && <span className="ml-3 truncate">Formulário Público</span>}
              </button>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/5 group`}
            title="Alternar Tema"
          >
            {!isSidebarCollapsed && <span className="uppercase tracking-wider">Modo {isDarkMode ? 'Escuro' : 'Claro'}</span>}
            <i className={`fas transition-transform duration-500 ${isDarkMode ? 'fa-sun text-[#E1A030] rotate-180' : 'fa-moon'} ${!isSidebarCollapsed ? '' : 'text-lg'}`}></i>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar 
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          activeTab={activeTab === 'public_form' ? 'kanban' : activeTab} setActiveTab={(t) => setActiveTab(t as any)} 
          isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)}
          onCreateLead={() => activeModule === 'commercial' ? setIsCreatingLead(true) : handleQuickAddLegal(LEGAL_PHASES[0].name)} 
          onOpenAI={() => setIsAIModalOpen(true)}
          activeModule={activeModule} setActiveModule={setActiveModule}
        />

        <main className={`flex-1 relative overflow-hidden ${isDarkMode ? 'bg-[#0F172A]' : 'bg-slate-50'}`}>
          {activeTab === 'dashboard' ? (
            <div className="p-10 flex flex-col items-center justify-center h-full">
              <h1 className="text-4xl font-black mb-4">Métricas do Fluxo {activeModule === 'commercial' ? 'Comercial' : 'Jurídico'}</h1>
              <p className="text-slate-500">Analytics avançado em desenvolvimento.</p>
            </div>
          ) : (
            <KanbanBoard 
              phases={currentPhases} cards={filteredCards} isDarkMode={isDarkMode}
              onDragStart={(e, id) => { e.dataTransfer.setData('cardId', id); setDraggedCardId(id); }}
              onDragEnd={() => { setDraggedCardId(null); setDropTargetPhase(null); }}
              onDrop={handleDrop} onCardClick={(c) => setSelectedCardId(c.id)}
              draggedCardId={draggedCardId} dropTargetPhase={dropTargetPhase} setDropTargetPhase={setDropTargetPhase}
              formatDuration={formatDuration} 
              onQuickAdd={activeModule === 'commercial' ? () => setIsCreatingLead(true) : handleQuickAddLegal}
            />
          )}
        </main>
      </div>

      <LeadModal 
        isOpen={isCreatingLead} onClose={() => setIsCreatingLead(false)}
        onSubmit={addLead} isDarkMode={isDarkMode}
        formatCPF={formatCPF} formatPhone={formatPhone} validateCPF={validateCPF}
      />
      
      {selectedCard && (
        <CardModal 
          card={selectedCard} phases={currentPhases}
          onClose={() => setSelectedCardId(null)}
          onUpdate={updateCard}
          onDelete={() => { if(confirm("Excluir?")) deleteCard(selectedCard.id); setSelectedCardId(null); }}
          onArchive={() => { archiveCard(selectedCard.id); setSelectedCardId(null); }}
          isDarkMode={isDarkMode} formatCPF={formatCPF} formatPhone={formatPhone} validateCPF={validateCPF}
        />
      )}

      {isAIModalOpen && activeModule === 'commercial' && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-md bg-black/60">
          <div className={`relative w-full max-w-lg rounded-3xl shadow-2xl p-8 ${isDarkMode ? 'bg-[#1E293B] border-slate-700 text-slate-200' : 'bg-white text-slate-900'}`}>
             <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
               <i className={`fas fa-wand-sparkles ${isDarkMode ? 'text-[#E1A030]' : 'text-[#001F8D]'}`}></i> Designer
             </h2>
             <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} className={`w-full h-32 p-4 rounded-2xl text-sm border outline-none ${isDarkMode ? 'bg-[#0F172A] border-slate-700 focus:border-[#E1A030]' : 'bg-slate-50 border-slate-200'}`} placeholder="Descreva seu processo..." />
             <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setIsAIModalOpen(false)} className="px-6 py-2 text-sm font-bold text-slate-500">Cancelar</button>
                <button onClick={handleGeneratePipeline} className={`px-8 py-2 rounded-xl text-sm font-black shadow-lg ${isDarkMode ? 'bg-[#E1A030] text-black' : 'bg-[#001F8D] text-white'}`}>Criar</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
