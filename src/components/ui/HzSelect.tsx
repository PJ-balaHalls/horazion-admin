'use client';

import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

interface Option {
  value: string;
  label: string;
  icon?: string;
}

interface HzSelectProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function HzSelect({ label, options, value, onChange, className }: HzSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={clsx("space-y-1.5 w-full relative", className)} ref={ref}>
      <label className="text-[10px] font-bold text-[#545454] uppercase tracking-wider block">
        {label}
      </label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#F2F2F2] rounded-[12px] text-sm text-[#000000] cursor-pointer flex justify-between items-center hover:border-[#000000] transition-colors"
      >
        <div className="flex items-center gap-2">
          {selectedOption?.icon && <span>{selectedOption.icon}</span>}
          <span className="font-medium">{selectedOption?.label}</span>
        </div>
        <svg className={clsx("w-4 h-4 text-[#545454] transition-transform", isOpen && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-[#F2F2F2] rounded-[12px] shadow-lg overflow-hidden animate-fade-in">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={clsx(
                "px-4 py-3 text-sm cursor-pointer flex items-center gap-2 transition-colors",
                value === option.value ? "bg-[#FAFAFA] text-[#000000] font-bold" : "text-[#545454] hover:bg-[#FAFAFA] hover:text-[#000000]"
              )}
            >
              {option.icon && <span>{option.icon}</span>}
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}