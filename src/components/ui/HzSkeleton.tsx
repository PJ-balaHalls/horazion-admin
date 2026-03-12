// src/components/ui/HzSkeleton.tsx
import React from 'react';

export interface HzSkeletonProps {
  className?: string;
}

export function HzSkeleton({ className = '' }: HzSkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />
  );
}