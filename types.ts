
// Enums
export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer'
}

// Interfaces Auxiliares
export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Note {
  author: string;
  text: string;
  timestamp: number;
  type?: 'user' | 'system';
}

export interface Tag {
  id: string;
  text: string;
  color: string;
}

export interface PhaseHistory {
  phaseName: string;
  durationMs: number;
  color: string;
  timestamp: number;
}

// Estrutura do Kanban
export interface Phase {
  id?: string; // Opcional pois o Gemini gera apenas name/color as vezes
  name: string;
  color: string;
  slaDays?: number;
}

// Dados específicos do Lead (Domínio OKfy)
export interface LeadData {
  cpf: string;
  email: string;
  source: string;
  jusbrasil: 'nada encontrado' | 'OK!' | 'Problemas' | null;
  hasCertificate: boolean | null;
  banks: {
    pan: 'Bloqueio Interno' | 'Sem bloqueio' | null;
    daycoval: 'Bloqueio Interno' | 'Sem bloqueio' | null;
    c6: 'Bloqueio Interno' | 'Sem bloqueio' | null;
  };
  phone: string;
  marketTime: string;
}

// O Card Principal
export interface Card {
  id: string;
  title: string;
  phaseName: string; // Chave de ligação com Phase
  createdAt: number;
  phaseUpdatedAt: number;
  data: LeadData;
  checklist: ChecklistItem[];
  notes: Note[];
  tags: Tag[];
  history: PhaseHistory[];
}

// Para o formulário de criação
export interface NewLeadFormData {
  title: string;
  cpf: string;
  email: string;
  phone: string;
  marketTime: string;
  source: string;
}
