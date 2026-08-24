import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function MonthlyBar({ data }){
  if (!data || !data.length) return <div className="small">No data</div>;
  return (
    <div style={{width:'100%', height:300}}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="month" /><YAxis /><Tooltip /><Legend />
          <Bar dataKey="income" fill="#10b981" name="Income" />
          <Bar dataKey="expense" fill="#ef4444" name="Expense" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
