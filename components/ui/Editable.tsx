
import React, { useState, useEffect, useRef } from 'react';

interface EditableFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (val: string) => void;
  type?: 'text' | 'email' | 'tel';
  validate?: (val: string) => boolean;
  errorMessage?: string;
  isDarkMode: boolean;
}

export const EditableField: React.FC<EditableFieldProps> = ({ 
  label, value, placeholder, onChange, type = 'text', validate, errorMessage, isDarkMode 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus();
  }, [isEditing]);

  useEffect(() => { setTempValue(value); }, [value]);

  const handleBlur = () => {
    const isValid = validate ? validate(tempValue) : true;
    if (isValid || !tempValue) {
      setIsEditing(false);
      if (tempValue !== value) onChange(tempValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleBlur();
    if (e.key === 'Escape') { setTempValue(value); setIsEditing(false); }
  };

  const isValid = validate ? validate(tempValue) : true;
  const displayValue = value || placeholder || '—';
  
  const labelColor = isDarkMode ? 'text-slate-500' : 'text-slate-500';
  const textColor = isDarkMode ? 'text-slate-200' : 'text-slate-900';
  
  // Fundo do input (inset)
  const inputBg = isDarkMode ? 'bg-[#020617]' : 'bg-white';
  const hoverBg = isDarkMode ? 'hover:bg-[#334155]' : 'hover:bg-slate-100';
  const borderFocus = isDarkMode ? 'border-[#E1A030]' : 'border-[#001F8D]';

  return (
    <div className="group mb-4 last:mb-0">
      <label className={`block text-[9px] font-black ${labelColor} mb-1 uppercase tracking-widest`}>{label}</label>
      {isEditing ? (
        <div>
            <input
              ref={inputRef}
              type={type}
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className={`w-full ${inputBg} text-[12px] font-semibold ${textColor} border-b ${!isValid && tempValue ? 'border-red-500' : borderFocus} py-1 px-0 outline-none transition-all`}
              placeholder={placeholder}
            />
             {!isValid && tempValue && errorMessage && (
                <span className="text-[8px] text-red-500 mt-0.5 block font-medium">{errorMessage}</span>
             )}
        </div>
      ) : (
        <div 
          onClick={() => setIsEditing(true)}
          className={`text-[12px] py-1 -ml-1.5 pl-1.5 rounded-lg border border-transparent ${hoverBg} cursor-pointer transition-all truncate flex items-center justify-between group/val ${!value ? 'text-slate-500 italic' : `${textColor} font-semibold`}`}
        >
          <span>{displayValue}</span>
          <i className={`fas fa-pencil-alt text-[8px] opacity-0 group-hover/val:opacity-40 transition-opacity ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}></i>
        </div>
      )}
    </div>
  );
};

interface EditableSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  isDarkMode: boolean;
}

export const EditableSelect: React.FC<EditableSelectProps> = ({ label, value, options, onChange, isDarkMode }) => {
    const labelColor = isDarkMode ? 'text-slate-500' : 'text-slate-500';
    const textColor = isDarkMode ? 'text-slate-200' : 'text-slate-700';
    const hoverBg = isDarkMode ? 'hover:bg-[#334155] hover:border-slate-600' : 'hover:bg-slate-100 hover:border-slate-200';
    const optionBg = isDarkMode ? 'bg-[#1E293B] text-white' : 'bg-white text-slate-700';

    return (
        <div className="group mb-4 last:mb-0">
            <label className={`block text-[9px] font-black ${labelColor} mb-1 uppercase tracking-widest`}>{label}</label>
            <div className="relative">
                <select 
                    value={value} 
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full bg-transparent text-[12px] font-semibold ${textColor} py-1 pl-1.5 -ml-1.5 border border-transparent ${hoverBg} rounded-lg cursor-pointer appearance-none outline-none transition-all pr-8`}
                >
                    {options.map(opt => (
                        <option key={opt} value={opt} className={optionBg}>{opt}</option>
                    ))}
                </select>
                <i className={`fas fa-chevron-down absolute right-2 top-1/2 -translate-y-1/2 text-[7px] pointer-events-none ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}></i>
            </div>
        </div>
    );
};
