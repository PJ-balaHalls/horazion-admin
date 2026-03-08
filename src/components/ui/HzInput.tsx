import React from 'react';
import clsx from 'clsx';

interface HzInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function HzInput({ label, className, ...props }: HzInputProps) {
  return (
    <div className={clsx("space-y-1.5 w-full", className)}>
      <label className="text-[10px] font-bold text-[#545454] uppercase tracking-wider block">
        {label}
      </label>
      <input
        className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#F2F2F2] rounded-[12px] text-sm text-[#000000] placeholder-[#9CA3AF] focus:outline-none focus:border-[#000000] focus:bg-white transition-colors"
        {...props}
      />
    </div>
  );
}