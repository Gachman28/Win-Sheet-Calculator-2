import React, { useEffect, useState } from 'react';

interface FormInputProps {
  label: string;
  id: string;
  hint?: string;
  type?: string;
  options?: { value: string; label: string }[];
  isTextArea?: boolean;
  value: string | number;
  onChange?: (e: any) => void;
  className?: string;
  [key: string]: any;
}

export default function FormInput({ label, hint, type = 'text', options, isTextArea, value, onChange, className = '', ...props }: FormInputProps) {
  const [isFlashing, setIsFlashing] = useState(false);
  const [prevValue, setPrevValue] = useState(value);

  useEffect(() => {
    if (value !== prevValue && value !== '' && value !== '0' && value !== '0.00') {
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 1600);
      setPrevValue(value);
      return () => clearTimeout(timer);
    }
    setPrevValue(value);
  }, [value, prevValue]);

  const baseClass = `w-full border border-slate-300 rounded-md px-3 py-2 text-sm bg-white text-slate-900 transition-all focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed ${isFlashing ? 'animate-ai-flash' : ''} ${className}`;

  return (
    <div className="flex flex-col">
      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
        {label}
      </label>
      {hint && <div className="text-[11px] text-slate-500 mb-1 font-medium normal-case tracking-normal">{hint}</div>}
      
      {isTextArea ? (
        <textarea 
          value={value} 
          onChange={onChange} 
          className={baseClass} 
          {...(props as any)} 
        />
      ) : options ? (
        <select 
          value={value} 
          onChange={onChange} 
          className={baseClass} 
          {...(props as any)}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <input 
          type={type} 
          value={value} 
          onChange={onChange} 
          className={baseClass} 
          {...(props as any)} 
        />
      )}
    </div>
  );
}
