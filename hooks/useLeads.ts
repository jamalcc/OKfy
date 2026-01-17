
import { useState, useCallback } from 'react';
import { Card, Phase, NewLeadFormData } from '../types';

export const useLeads = (initialCards: Card[], phases: Phase[]) => {
  const [cards, setCards] = useState<Card[]>(initialCards);

  const addLead = useCallback((data: NewLeadFormData) => {
    const newCard: Card = {
      id: `ID-${Date.now().toString().slice(-3)}`,
      title: data.title,
      phaseName: phases[0].name,
      createdAt: Date.now(),
      phaseUpdatedAt: Date.now(),
      data: {
        ...data,
        jusbrasil: null,
        hasCertificate: null,
        banks: { pan: null, daycoval: null, c6: null },
        contactAttempts: 0,
        contactSuccess: false,
        saleType: null,
        topProducts: ''
      },
      checklist: [],
      notes: [],
      tags: [],
      history: [],
      assignee: 'u1' // Atribuição automática simulada
    };
    setCards(prev => [newCard, ...prev]);
  }, [phases]);

  const updateCard = useCallback((updatedCard: Card) => {
    setCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
  }, []);

  const deleteCard = useCallback((cardId: string) => {
    setCards(prev => prev.filter(c => c.id !== cardId));
  }, []);

  const archiveCard = useCallback((cardId: string) => {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, archived: true } : c));
  }, []);

  const moveCard = useCallback((cardId: string, targetPhaseName: string) => {
    setCards(prev => prev.map(c => {
      if (c.id === cardId && c.phaseName !== targetPhaseName) {
        const now = Date.now();
        const historyItem = { 
          phaseName: c.phaseName, 
          durationMs: now - c.phaseUpdatedAt, 
          color: phases.find(p => p.name === c.phaseName)?.color || '#999', 
          timestamp: c.phaseUpdatedAt 
        };
        return { 
          ...c, 
          phaseName: targetPhaseName, 
          phaseUpdatedAt: now,
          history: [...c.history, historyItem] 
        };
      }
      return c;
    }));
  }, [phases]);

  return { cards, addLead, updateCard, deleteCard, archiveCard, moveCard };
};
