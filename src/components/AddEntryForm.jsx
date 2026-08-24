import React, { useMemo, useState } from 'react';
import { useFin } from '../context/TransactionsContext.jsx';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '../constants.js';

export default function AddEntryForm({ onSaved }){
  const { addTransaction } = useFin();
  const [type, setType] = useState('expense');
  const cats = useMemo(()=> type==='expense'? EXPENSE_CATEGORIES: INCOME_CATEGORIES, [type]);

  const [form, setForm] = useState({
    type: 'expense', category:'Food', amount: '', date: new Date().toISOString().slice(0,10), paymentMethod:'Cash', payee:'', receivedFrom:'', notes:'', tags:'', isRecurring:false
  });

  const submit = (e)=>{
    e.preventDefault();
    try{
      const tx = {
        type,
        category: form.category,
        amount: parseFloat(form.amount),
        date: form.date,
        paymentMethod: form.paymentMethod,
        payee: form.payee,
        receivedFrom: form.receivedFrom,
        notes: form.notes,
        tags: form.tags? form.tags.split(',').map(s=> s.trim()).filter(Boolean): [],
        isRecurring: !!form.isRecurring
      };
      addTransaction(tx);
      setForm(f=> ({...f, amount:'', notes:'', tags:''}));
      alert('Transaction saved');
      onSaved && onSaved();
    }catch(err){ alert(err.message); }
  };

  return (
    <form className="card" onSubmit={submit}>
      <h3>Add Transaction</h3>
      <div className="form-grid">
        <div>
          <label>Type</label>
          <select value={type} onChange={(e)=> { setType(e.target.value); setForm(f=> ({...f, type: e.target.value})); }}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <div>
          <label>Category</label>
          <select value={form.category} onChange={e=> setForm(f=> ({...f, category: e.target.value}))}>
            {cats.map(c=> <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label>Amount</label>
          <input required type="number" step="0.01" value={form.amount} onChange={e=> setForm(f=> ({...f, amount: e.target.value}))} />
        </div>
        <div>
          <label>Date</label>
          <input required type="date" value={form.date} onChange={e=> setForm(f=> ({...f, date: e.target.value}))} />
        </div>
        <div>
          <label>Payment Method</label>
          <select value={form.paymentMethod} onChange={e=> setForm(f=> ({...f, paymentMethod: e.target.value}))}>
            {PAYMENT_METHODS.map(p=> <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        {type==='expense' && (
          <div>
            <label>Payee</label>
            <input value={form.payee} onChange={e=> setForm(f=> ({...f, payee: e.target.value}))} />
          </div>
        )}
        {type==='income' && (
          <div>
            <label>Received From</label>
            <input value={form.receivedFrom} onChange={e=> setForm(f=> ({...f, receivedFrom: e.target.value}))} />
          </div>
        )}
        <div>
          <label>Tags (comma separated)</label>
          <input value={form.tags} onChange={e=> setForm(f=> ({...f, tags: e.target.value}))} />
        </div>
        <div>
          <label>Recurring</label>
          <input type="checkbox" checked={!!form.isRecurring} onChange={e=> setForm(f=> ({...f, isRecurring: e.target.checked}))} />
        </div>
        <div style={{gridColumn:'1 / -1'}}>
          <label>Notes</label>
          <textarea rows="2" value={form.notes} onChange={e=> setForm(f=> ({...f, notes: e.target.value}))}></textarea>
        </div>
      </div>
      <div className="row" style={{marginTop:8, justifyContent:'flex-end'}}>
        <button className="btn btn-primary" type="submit">Save</button>
      </div>
    </form>
  );
}
