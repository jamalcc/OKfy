
import React, { useState } from 'react';
import { NewLeadFormData } from '../types';
import { formatCPF, formatPhone, validateCPF, isValidEmail } from '../utils/helpers';

interface PublicLeadFormProps {
  onSubmit: (data: NewLeadFormData) => void;
  onBack: () => void;
  isDarkMode: boolean;
}

export const PublicLeadForm: React.FC<PublicLeadFormProps> = ({ onSubmit, onBack, isDarkMode }) => {
  const [formData, setFormData] = useState<NewLeadFormData>({
    title: '',
    cpf: '',
    email: '',
    phone: '',
    marketTime: '',
    source: 'Site Institucional'
  });
  const [submitted, setSubmitted] = useState(false);

  const bgPage = isDarkMode ? 'bg-[#0F172A]' : 'bg-slate-50';
  const bgCard = isDarkMode ? 'bg-[#1E293B]' : 'bg-white';
  const borderSubtle = isDarkMode ? 'border-slate-700' : 'border-slate-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-slate-900';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const btnClass = isDarkMode ? 'bg-[#E1A030] text-black' : 'bg-[#001F8D] text-white';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCPF(formData.cpf)) {
      alert("CPF Inválido");
      return;
    }
    if (!isValidEmail(formData.email)) {
      alert("E-mail Inválido");
      return;
    }
    
    onSubmit(formData);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${bgPage}`}>
        <div className={`w-full max-w-md p-10 rounded-3xl shadow-2xl text-center border ${borderSubtle} ${bgCard}`}>
          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-check text-3xl"></i>
          </div>
          <h2 className={`text-2xl font-black mb-3 ${textPrimary}`}>Solicitação Enviada!</h2>
          <p className={`${textMuted} mb-8 text-sm leading-relaxed`}>
            Obrigado, <strong>{formData.title}</strong>! <br/>
            Seus dados foram recebidos com sucesso e já estão no nosso sistema de triagem.
          </p>
          <button 
            onClick={() => { setSubmitted(false); onBack(); }}
            className={`w-full py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all active:scale-95 ${btnClass}`}
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  const inputClass = `w-full px-5 py-4 rounded-xl border outline-none transition-all text-sm font-medium ${
    isDarkMode 
      ? 'bg-[#0F172A] border-slate-700 focus:border-[#E1A030] text-white placeholder-slate-500' 
      : 'bg-slate-50 border-slate-200 focus:border-[#001F8D] text-slate-900 placeholder-slate-400'
  }`;

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${bgPage}`}>
      {/* Lado Esquerdo - Branding Contextual */}
      <div className={`hidden md:flex md:w-1/3 p-12 flex-col justify-between ${isDarkMode ? 'bg-[#020617]' : 'bg-[#001F8D]'}`}>
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xl ${isDarkMode ? 'bg-[#E1A030] text-black' : 'bg-white text-[#001F8D]'}`}>
              <i className="fas fa-bolt"></i>
            </div>
            <span className="text-3xl font-black text-white tracking-tighter">OKfy</span>
          </div>
          <h1 className="text-4xl font-black text-white leading-tight mb-6">Sua jornada financeira começa aqui.</h1>
          <p className="text-white/60 text-lg">Sistema de captação direta para análise de crédito em tempo real.</p>
        </div>
        <div className="text-white/40 text-xs font-medium">
          &copy; 2024 OKfy Tecnologia e Crédito.
        </div>
      </div>

      {/* Lado Direito - Formulário Ultra Clean */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-20">
        <div className={`w-full max-w-lg p-8 md:p-12 rounded-3xl shadow-2xl border ${borderSubtle} ${bgCard}`}>
          <div className="flex items-center justify-between mb-12">
             <h2 className={`text-2xl font-black ${textPrimary}`}>Nova Solicitação</h2>
             <button onClick={onBack} className={`${textMuted} hover:text-white transition-colors`}>
                <i className="fas fa-times text-xl"></i>
             </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              required 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              className={inputClass} 
              placeholder="Nome Completo" 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                required 
                value={formData.cpf} 
                onChange={e => setFormData({...formData, cpf: formatCPF(e.target.value)})} 
                className={inputClass} 
                placeholder="CPF (000.000.000-00)" 
              />
              <input 
                required 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: formatPhone(e.target.value)})} 
                className={inputClass} 
                placeholder="Telefone com DDD" 
              />
            </div>

            <input 
              required 
              type="email" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              className={inputClass} 
              placeholder="E-mail de Contato" 
            />

            <select 
              required 
              value={formData.marketTime} 
              onChange={e => setFormData({...formData, marketTime: e.target.value})} 
              className={inputClass}
            >
              <option value="" disabled>Tempo de Mercado</option>
              <option value="Menos de 1 ano">Menos de 1 ano</option>
              <option value="1 a 3 anos">1 a 3 anos</option>
              <option value="Mais de 3 anos">Mais de 3 anos</option>
            </select>

            <div className="pt-6">
              <button 
                type="submit" 
                className={`w-full py-5 rounded-2xl font-black text-sm tracking-widest uppercase transition-all shadow-xl hover:shadow-2xl active:scale-95 ${btnClass}`}
              >
                Enviar Agora <i className="fas fa-arrow-right ml-2"></i>
              </button>
            </div>
          </form>
          
          <p className={`mt-8 text-center text-[10px] font-bold uppercase tracking-tighter opacity-30 ${textMuted}`}>
            Ambiente de Teste Integrado ao Kanban
          </p>
        </div>
      </div>
    </div>
  );
};
