
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

  // Paleta Slate
  const bgCard = isDarkMode ? 'bg-[#1E293B]' : 'bg-white';
  const borderSubtle = isDarkMode ? 'border-slate-700' : 'border-slate-200';
  const textMuted = isDarkMode ? 'text-slate-500' : 'text-slate-500';
  
  const bgBrand = isDarkMode ? 'bg-[#E1A030]' : 'bg-[#001F8D]';
  const textBrandColor = isDarkMode ? 'text-black' : 'text-white';
  
  const inputBg = isDarkMode ? 'bg-[#0F172A]' : 'bg-white';
  const inputText = isDarkMode ? 'text-slate-200' : 'text-slate-900';
  const inputBorder = isDarkMode ? 'border-slate-700 focus:border-[#E1A030]' : 'border-slate-300 focus:ring-[#001F8D]';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form handled by parent or useEffect if needed, simplifying here
  };

  const inputClass = `w-full border rounded-lg px-3 py-2 text-sm outline-none transition-all ${inputBg} ${inputText} ${inputBorder} ${isDarkMode ? 'focus:ring-1 focus:ring-[#E1A030]' : 'focus:ring-1 focus:ring-[#001F8D]'}`;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`${bgCard} w-full max-w-lg rounded-xl shadow-2xl relative overflow-hidden border ${borderSubtle} flex flex-col animate-in zoom-in-95 duration-200`}>
        <div className={`p-4 border-b ${borderSubtle} flex justify-between items-center`}>
          <h2 className={`text-sm font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Adicionar Novo Lead</h2>
          <button onClick={onClose} className={`${textMuted} hover:text-white`}><i className="fas fa-times"></i></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={`block text-[10px] font-bold uppercase mb-1 ${textMuted}`}>Nome Completo *</label>
              <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className={inputClass} placeholder="Ex: João Silva" />
            </div>
            
            <div>
              <label className={`block text-[10px] font-bold uppercase mb-1 ${textMuted}`}>CPF *</label>
              <input 
                required 
                value={formData.cpf} 
                onChange={e => setFormData({...formData, cpf: formatCPF(e.target.value)})} 
                className={`${inputClass} ${formData.cpf && !validateCPF(formData.cpf) ? 'border-red-500' : ''}`} 
                placeholder="000.000.000-00" 
              />
            </div>

            <div>
              <label className={`block text-[10px] font-bold uppercase mb-1 ${textMuted}`}>Telefone *</label>
              <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: formatPhone(e.target.value)})} className={inputClass} placeholder="(00) 00000-0000" />
            </div>

            <div className="md:col-span-2">
              <label className={`block text-[10px] font-bold uppercase mb-1 ${textMuted}`}>E-mail *</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClass} placeholder="email@exemplo.com" />
            </div>

            <div>
              <label className={`block text-[10px] font-bold uppercase mb-1 ${textMuted}`}>Origem *</label>
              <select required value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} className={inputClass}>
                {["Instagram", "Facebook", "Google", "Indicação"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div>
              <label className={`block text-[10px] font-bold uppercase mb-1 ${textMuted}`}>Tempo Mercado</label>
              <input value={formData.marketTime} onChange={e => setFormData({...formData, marketTime: e.target.value})} className={inputClass} placeholder="Ex: 2 anos" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className={`px-4 py-2 text-xs font-bold ${textMuted} hover:text-white transition-colors`}>Cancelar</button>
            <button type="submit" className={`px-8 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest shadow-lg hover:opacity-90 ${bgBrand} ${textBrandColor}`}>Criar Lead</button>
          </div>
        </form>
      </div>
    </div>
  );
};
