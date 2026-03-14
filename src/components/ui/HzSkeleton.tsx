import React from 'react';
import clsx from 'clsx';

interface HzSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function HzSkeleton({ className, ...props }: HzSkeletonProps) {
  return (
    <div 
      className={clsx("animate-pulse bg-gray-100 rounded-lg", className)} 
      {...props} 
    />
  );
}