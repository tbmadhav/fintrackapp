import React, { useMemo, useState } from 'react';
import { useFin } from '../context/TransactionsContext.jsx';

export default function TransactionsList(){
  const { transactions, removeTransaction } = useFin();
  const [q, setQ] = useState('');
  const [type, setType] = useState('all');

  const list = useMemo(()=>{
    const s = (transactions||[]).filter(t=> type==='all' || t.type===type)
      .filter(t=> !q || JSON.stringify(t).toLowerCase().includes(q.toLowerCase()));
    return s.sort((a,b)=> (b.date||'').localeCompare(a.date||''));
  },[transactions, q, type]);

  return (
    <div className="card">
      <h3>Transactions</h3>
      <div className="row" style={{marginBottom:8}}>
        <input placeholder="Search" value={q} onChange={e=> setQ(e.target.value)} />
        <select value={type} onChange={e=> setType(e.target.value)}>
          <option value="all">All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Date</th><th>Type</th><th>Category</th><th>Amount</th><th>Method</th><th>Tags</th><th>Notes</th><th></th>
          </tr>
        </thead>
        <tbody>
          {list.map(t=> (
            <tr key={t.id}>
              <td>{t.date}</td>
              <td><span className="badge">{t.type}</span></td>
              <td>{t.category}</td>
              <td>{t.type==='expense'? '-': '+'}₹{t.amount.toFixed(2)}</td>
              <td>{t.paymentMethod}</td>
              <td>{(t.tags||[]).join(', ')}</td>
              <td className="small">{t.notes}</td>
              <td><button onClick={()=> removeTransaction(t.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
