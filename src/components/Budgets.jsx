import React, { useMemo, useState } from 'react';
import { useFin } from '../context/TransactionsContext.jsx';
import { EXPENSE_CATEGORIES } from '../constants.js';

export default function Budgets(){
  const { budgets, setBudgets, transactions } = useFin();
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const month = useState(ym)[0];

  const spendByCat = useMemo(()=>{
    const map = {};
    (transactions||[]).filter(t=> t.type==='expense' && (t.date||'').startsWith(month)).forEach(t=>{
      map[t.category] = (map[t.category]||0)+t.amount;
    });
    return map;
  },[transactions, month]);

  const limits = budgets?.[month]?.expense || {};

  const setLimit = (cat, value)=>{
    setBudgets(prev=>{
      const next = { ...(prev||{}) };
      next[month] = next[month] || { expense: {} };
      next[month].expense[cat] = Number(value)||0;
      return next;
    });
  };

  return (
    <div className="card">
      <h3>Budgets - {month}</h3>
      <table className="table">
        <thead><tr><th>Category</th><th>Limit</th><th>Spend</th><th>Remaining</th><th>Status</th></tr></thead>
        <tbody>
          {EXPENSE_CATEGORIES.map(cat=>{
            const limit = Number(limits[cat]||0);
            const spend = Number(spendByCat[cat]||0);
            const remaining = Math.max(0, limit-spend);
            const over = spend>limit && limit>0;
            return (
              <tr key={cat}>
                <td>{cat}</td>
                <td>
                  <input type="number" step="0.01" value={limit}
                    onChange={e=> setLimit(cat, e.target.value)} />
                </td>
                <td>₹{spend.toFixed(2)}</td>
                <td>₹{remaining.toFixed(2)}</td>
                <td>{over? <span className="badge" style={{background:'#fee2e2',color:'#991b1b'}}>Over</span>: <span className="badge">OK</span>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
