
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
  id?: string;
  name: string;
  color: string;
  slaDays?: number;
}

// Dados específicos do Lead (Domínio OKfy)
export interface LeadData {
  // Campos Comerciais Comuns
  cpf: string;
  email: string;
  source: string;
  phone: string;
  
  // Campos Comerciais Específicos
  marketTime: string;
  jusbrasil: 'nada encontrado' | 'OK!' | 'Problemas' | null;
  hasCertificate: boolean | null;
  banks: {
    pan: 'Bloqueio Interno' | 'Sem bloqueio' | null;
    daycoval: 'Bloqueio Interno' | 'Sem bloqueio' | null;
    c6: 'Bloqueio Interno' | 'Sem bloqueio' | null;
  };
  contactAttempts: number; // 0 a 3
  contactSuccess: boolean; // Novo campo para marcar sucesso
  saleType: 'Loja' | 'Home Office' | null;
  topProducts: string;

  // Campos Jurídicos Específicos
  brokerName?: string;
  targetBank?: string;
  processDescription?: string;
}

// O Card Principal
export interface Card {
  id: string;
  title: string;
  phaseName: string;
  pipeline: 'commercial' | 'legal'; // Novo campo para distinguir o fluxo
  createdAt: number;
  phaseUpdatedAt: number;
  data: LeadData;
  checklist: ChecklistItem[];
  notes: Note[];
  tags: Tag[];
  history: PhaseHistory[];
  archived?: boolean;
  assignee?: string;
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
