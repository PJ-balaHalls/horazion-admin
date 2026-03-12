import React from 'react';
import clsx from 'clsx';

interface HzBadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  className?: string;
}

export function HzBadge({ children, variant = 'neutral', className }: HzBadgeProps) {
  const variants = {
    success: "bg-green-50 text-green-700 border-green-100",
    warning: "bg-yellow-50 text-yellow-700 border-yellow-100",
    error: "bg-red-50 text-red-700 border-red-100",
    info: "bg-blue-50 text-blue-700 border-blue-100",
    neutral: "bg-gray-50 text-gray-700 border-gray-100",
  };

  return (
    <span className={clsx("px-2 py-0.5 border text-[9px] font-bold uppercase tracking-wider rounded-full", variants[variant], className)}>
      {children}
    </span>
  );
}