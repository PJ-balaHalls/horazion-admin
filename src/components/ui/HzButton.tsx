import React from 'react';
import clsx from 'clsx';

interface HzButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  isLoading?: boolean;
}

export function HzButton({ variant = 'primary', isLoading, className, children, ...props }: HzButtonProps) {
  const baseStyles = "relative inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-widest rounded-[12px] transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden";
  
  const variants = {
    primary: "bg-[#000000] text-white hover:bg-[#B6192E]",
    secondary: "bg-[#FAFAFA] border border-[#F2F2F2] text-[#000000] hover:border-[#000000]",
    ghost: "bg-transparent text-[#545454] hover:text-[#000000] hover:bg-[#FAFAFA]",
    danger: "bg-[#B6192E] text-white hover:bg-opacity-90",
  };

  return (
    <button className={clsx(baseStyles, variants[variant], className)} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      ) : children}
    </button>
  );
}