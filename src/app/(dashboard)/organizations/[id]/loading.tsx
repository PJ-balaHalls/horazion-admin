'use client';

import React from 'react';
import { HzSkeleton } from '@/components/ui';

export default function EntityDetailsLoading() {
  return (
    <div className="p-10 max-w-7xl mx-auto space-y-8 animate-pulse">
      <div className="flex items-center gap-4">
        <HzSkeleton className="w-16 h-16 rounded-2xl" />
        <div className="space-y-2">
          <HzSkeleton className="h-8 w-64 rounded-lg" />
          <HzSkeleton className="h-4 w-32 rounded-lg" />
        </div>
      </div>
      <div className="flex gap-8 border-b border-gray-100 pb-2 mt-8">
        <HzSkeleton className="h-8 w-32 rounded-md" />
        <HzSkeleton className="h-8 w-32 rounded-md" />
        <HzSkeleton className="h-8 w-32 rounded-md" />
      </div>
      <HzSkeleton className="h-[500px] w-full rounded-3xl" />
    </div>
  );
}