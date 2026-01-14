
import React, { useState } from 'react';
import { NewLeadFormData } from '../types';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewLeadFormData) => void;
  isDarkMode: boolean;
  formatCPF: (v: string) => string;
  formatPhone: (v: string) => string;
  validateCPF: (v: string) => boolean;
}

export const LeadModal: React.FC<LeadModalProps> = ({
  isOpen, onClose, onSubmit, isDarkMode, formatCPF, formatPhone, validateCPF
}) => {
  const [formData, setFormData] = useState<NewLeadFormData>({
    title: '', cpf: '', email: '', phone: '', marketTime: '', source: 'Instagram'
  });

  if (!isOpen) return null;

  const bgCard = isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white';
  const borderSubtle = isDarkMode ? 'border-neutral-700' : 'border-slate-200';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const bgBrand = isDarkMode ? 'bg-[#DD971E]' : 'bg-[#233F93]';
  const textBrandColor = isDarkMode ? 'text-black' : 'text-white';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form handled by parent or useEffect if needed, simplifying here
  };

  const inputClass = `w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 ${isDarkMode ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-slate-300'}`;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`${bgCard} w-full max-w-lg rounded-xl shadow-2xl relative overflow-hidden border ${borderSubtle} flex flex-col animate-in zoom-in-95 duration-200`}>
        <div className={`p-4 border-b ${borderSubtle} flex justify-between items-center`}>
          <h2 className="text-sm font-black uppercase tracking-widest">Adicionar Novo Lead</h2>
          <button onClick={onClose} className={`${textMuted} hover:text-slate-200`}><i className="fas fa-times"></i></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nome Completo *</label>
              <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className={inputClass} placeholder="Ex: João Silva" />
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">CPF *</label>
              <input 
                required 
                value={formData.cpf} 
                onChange={e => setFormData({...formData, cpf: formatCPF(e.target.value)})} 
                className={`${inputClass} ${formData.cpf && !validateCPF(formData.cpf) ? 'border-red-500' : ''}`} 
                placeholder="000.000.000-00" 
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Telefone *</label>
              <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: formatPhone(e.target.value)})} className={inputClass} placeholder="(00) 00000-0000" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">E-mail *</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClass} placeholder="email@exemplo.com" />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Origem *</label>
              <select required value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} className={inputClass}>
                {["Instagram", "Facebook", "Google", "Indicação"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tempo Mercado</label>
              <input value={formData.marketTime} onChange={e => setFormData({...formData, marketTime: e.target.value})} className={inputClass} placeholder="Ex: 2 anos" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className={`px-4 py-2 text-xs font-bold ${textMuted}`}>Cancelar</button>
            <button type="submit" className={`px-8 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest shadow-lg hover:opacity-90 ${bgBrand} ${textBrandColor}`}>Criar Lead</button>
          </div>
        </form>
      </div>
    </div>
  );
};
