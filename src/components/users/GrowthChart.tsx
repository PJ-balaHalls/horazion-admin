'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * [FE-HZ-015] GrowthChart - Horizon Clarity
 * Plotagem minimalista do crescimento de identidades no SOS.
 */
export function GrowthChart({ data }: { data: any[] }) {
  return (
    <div className="h-[300px] w-full bg-horazion-white p-6">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-[10px] font-bold text-horazion-gray uppercase tracking-[0.25em]">
          Evolução de Identidades
        </h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-horazion-red rounded-full"></div>
            <span className="text-[9px] font-bold text-horazion-black uppercase">Novos Users</span>
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F2F2" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{fontSize: 9, fontWeight: 700, fill: '#545454'}} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{fontSize: 9, fontWeight: 700, fill: '#545454'}} 
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '12px', 
              border: '1px solid #F2F2F2', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              fontFamily: 'Inter, sans-serif'
            }}
            itemStyle={{ fontSize: '11px', fontWeight: 'bold', color: '#B6192E' }}
            labelStyle={{ fontSize: '10px', fontWeight: '800', marginBottom: '4px', color: '#000' }}
          />
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke="#000000" 
            strokeWidth={2.5} 
            dot={{ r: 4, fill: '#B6192E', strokeWidth: 0 }} 
            activeDot={{ r: 6, fill: '#B6192E' }} 
            animationDuration={2000}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}