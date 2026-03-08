'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function GrowthChart({ data }: { data: any[] }) {
  return (
    <div className="h-[280px] w-full bg-horazion-white p-4">
      <div className="mb-4 flex justify-between items-center">
        <span className="text-[10px] font-bold text-horazion-gray uppercase tracking-widest">Evolução do Ecossistema</span>
        <span className="text-[10px] font-bold text-horazion-red uppercase tracking-widest">Real-time Data</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F2F2" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#545454'}} />
          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#545454'}} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: '1px solid #F2F2F2', fontSize: '10px' }}
          />
          <Line type="monotone" dataKey="count" stroke="#B6192E" strokeWidth={2} dot={{ r: 3, fill: '#B6192E' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}