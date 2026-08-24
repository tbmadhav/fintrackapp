import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function RunningBalance({ data }){
  if (!data || !data.length) return <div className="small">No data</div>;
  return (
    <div style={{width:'100%', height:300}}>
      <ResponsiveContainer>
        <AreaChart data={data}>
          <XAxis dataKey="date" /><YAxis /><Tooltip />
          <Area type="monotone" dataKey="balance" stroke="#3b82f6" fill="#bfdbfe" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
