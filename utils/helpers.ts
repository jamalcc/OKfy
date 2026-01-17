
import { Card } from '../types';

export const validateCPF = (cpf: string) => {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) return false;
  return true;
};

export const formatCPF = (v: string) => 
  v.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

export const formatPhone = (v: string) => 
  v.replace(/\D/g, '').slice(0, 11).replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');

export const formatDuration = (ms: number) => {
  const min = Math.floor(ms / 60000);
  const hrs = Math.floor(min / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d ${hrs % 24}h`;
  if (hrs > 0) return `${hrs}h ${min % 60}m`;
  return `${min}m`;
};

/**
 * Calcula o tempo total acumulado em uma fase específica, 
 * somando o histórico e a sessão atual caso o card esteja nela.
 */
export const getTotalTimeInPhase = (card: Card, phaseName: string) => {
  const historyDuration = card.history
    .filter(h => h.phaseName === phaseName)
    .reduce((acc, curr) => acc + curr.durationMs, 0);
  
  const currentSessionDuration = card.phaseName === phaseName 
    ? (Date.now() - card.phaseUpdatedAt) 
    : 0;

  return historyDuration + currentSessionDuration;
};

export const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
