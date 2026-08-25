import React, { useMemo, useState } from 'react';
import { useFin } from '../context/TransactionsContext.jsx';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '../constants.js';

export default function TransactionsList(){
  const { transactions, removeTransaction, updateTransaction } = useFin();
  const [status, setStatus] = useState({ type:'', message:'' });
  const [q, setQ] = useState('');
  const [type, setType] = useState('all');
  const [editing, setEditing] = useState(null); // tx being edited

  const list = useMemo(()=>{
    const s = (transactions||[]).filter(t=> type==='all' || t.type===type)
      .filter(t=> !q || JSON.stringify(t).toLowerCase().includes(q.toLowerCase()));
    return s.sort((a,b)=> (b.date||'').localeCompare(a.date||''));
  },[transactions, q, type]);

  const cats = (editing?.type||'expense')==='expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const startEdit = (t)=> setEditing({ ...t, tags: (t.tags||[]).join(', ') });
  const saveEdit = ()=>{
    try{
      const amt = Number(editing.amount);
      if (!Number.isFinite(amt) || amt<=0) throw new Error('Amount must be positive number');
      updateTransaction(editing.id, {
        type: editing.type,
        category: editing.category,
        amount: amt,
        date: editing.date,
        paymentMethod: editing.paymentMethod,
        payee: editing.payee||'',
        receivedFrom: editing.receivedFrom||'',
        notes: editing.notes||'',
        tags: (editing.tags||'').split(',').map(s=> s.trim()).filter(Boolean),
        isRecurring: !!editing.isRecurring,
      });
      setStatus({type:'success', message:'Transaction updated'});
      setEditing(null);
    }catch(e){ setStatus({type:'error', message: e.message||String(e)}); }
  };

  return (
    <div className="card">
      <h3>Transactions</h3>
      {status.message && (<div className={"status "+(status.type==='success'? 'success':'error')}>{status.message}</div>)}
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
              <td>
                <div className="row" style={{gap:6}}>
                  <button className="btn btn-secondary" onClick={()=> startEdit(t)}>Edit</button>
                  <button onClick={()=> { if (confirm('Delete this transaction?')) { removeTransaction(t.id); setStatus({type:'success', message:'Transaction deleted'}); } }}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && (
        <>
          <div className="modal-backdrop" onClick={()=> setEditing(null)} />
          <div className="modal">
            <h3>Edit Transaction</h3>
            <div className="form-grid" style={{marginTop:8}}>
              <div>
                <label>Type</label>
                <select value={editing.type} onChange={e=> setEditing(s=> ({...s, type: e.target.value}))}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div>
                <label>Category</label>
                <select value={editing.category} onChange={e=> setEditing(s=> ({...s, category: e.target.value}))}>
                  {cats.map(c=> <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label>Amount</label>
                <input type="number" step="0.01" value={editing.amount} onChange={e=> setEditing(s=> ({...s, amount: e.target.value}))} />
              </div>
              <div>
                <label>Date</label>
                <input type="date" value={editing.date} onChange={e=> setEditing(s=> ({...s, date: e.target.value}))} />
              </div>
              <div>
                <label>Payment Method</label>
                <select value={editing.paymentMethod} onChange={e=> setEditing(s=> ({...s, paymentMethod: e.target.value}))}>
                  {PAYMENT_METHODS.map(p=> <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              {editing.type==='expense' && (
                <div>
                  <label>Payee</label>
                  <input value={editing.payee||''} onChange={e=> setEditing(s=> ({...s, payee: e.target.value}))} />
                </div>
              )}
              {editing.type==='income' && (
                <div>
                  <label>Received From</label>
                  <input value={editing.receivedFrom||''} onChange={e=> setEditing(s=> ({...s, receivedFrom: e.target.value}))} />
                </div>
              )}
              <div>
                <label>Tags (comma separated)</label>
                <input value={editing.tags||''} onChange={e=> setEditing(s=> ({...s, tags: e.target.value}))} />
              </div>
              <div>
                <label>Recurring</label>
                <input type="checkbox" checked={!!editing.isRecurring} onChange={e=> setEditing(s=> ({...s, isRecurring: e.target.checked}))} />
              </div>
              <div style={{gridColumn:'1 / -1'}}>
                <label>Notes</label>
                <textarea rows="2" value={editing.notes||''} onChange={e=> setEditing(s=> ({...s, notes: e.target.value}))}></textarea>
              </div>
            </div>
            <div className="row" style={{marginTop:10, justifyContent:'flex-end'}}>
              <button className="btn btn-secondary" onClick={()=> setEditing(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
