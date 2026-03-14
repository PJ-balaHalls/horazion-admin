
import React from 'react';
import { HzSkeleton } from '@/components/ui';

export default function DashboardLoading() {
  return (
    <div className="p-12 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-200 bg-white min-h-full w-full">
      <header className="flex justify-between items-end border-b border-gray-100 pb-6">
        <div>
          <HzSkeleton className="h-10 w-72 mb-3 rounded-xl" />
          <HzSkeleton className="h-4 w-96 rounded-md" />
        </div>
        <HzSkeleton className="h-12 w-48 rounded-2xl" />
      </header>

      <div className="grid grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="bg-white border border-gray-100 p-8 rounded-[24px] space-y-4">
             <div className="flex justify-between items-start">
               <HzSkeleton className="w-14 h-14 rounded-2xl" />
               <HzSkeleton className="w-20 h-6 rounded-full" />
             </div>
             <HzSkeleton className="w-3/4 h-6 rounded-md mt-6" />
             <HzSkeleton className="w-1/2 h-4 rounded-md mt-3" />
             <HzSkeleton className="w-full h-12 rounded-xl mt-8" />
          </div>
        ))}
      </div>
    </div>
  );
}