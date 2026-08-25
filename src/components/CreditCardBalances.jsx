import React, { useMemo, useEffect } from 'react';
import { useFin } from '../context/TransactionsContext.jsx';

// Computes per-card outstanding using tags, starting balances, and transactions
// Rules:
// - Purchases on card: type=expense AND paymentMethod is Credit Card/Credit Card UPI AND tag present -> add amount
// - Repayments: category = 'Payment to Credit Card' AND tag present -> subtract amount
export default function CreditCardBalances(){
  const { transactions, settings, setSettings } = useFin();

  // Initialize default cards if none configured (based on user's request)
  useEffect(()=>{
    if (!settings?.cards){
      setSettings(s=> ({
        ...s,
        cards: {
          cchdfc: { name: 'HDFC', startingOutstanding: 4421 },
          ccicici: { name: 'Amazon Pay ICICI', startingOutstanding: 1411 },
          ccsaph: { name: 'ICICI Sapphiro', startingOutstanding: 0 }
        }
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const balances = useMemo(()=>{
    const map = {};
    const defs = settings?.cards || {};
    Object.keys(defs).forEach(tag=>{ map[tag] = defs[tag].startingOutstanding || 0; });
    const isCardPurchase = (t)=> t.type==='expense' && (t.paymentMethod==='Credit Card' || t.paymentMethod==='Credit Card UPI');
    const hasTag = (t, tag)=> Array.isArray(t.tags) && t.tags.some(x=> x.toLowerCase()===tag.toLowerCase());
    (transactions||[]).forEach(t=>{
      Object.keys(defs).forEach(tag=>{
        if (hasTag(t, tag)){
          if (isCardPurchase(t)) map[tag] += Number(t.amount)||0;
          if (t.category==='Payment to Credit Card') map[tag] -= Number(t.amount)||0;
        }
      });
    });
    return Object.entries(defs).map(([tag,def])=> ({ tag, name: def.name, amount: Math.max(0, Math.round((map[tag]||0)*100)/100) }));
  }, [transactions, settings?.cards]);

  if (!settings?.cards) return null;

  return (
    <div className="card">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
        <h3>Credit Card Balances</h3>
        <div className="small">Tags: {Object.keys(settings.cards).join(', ')}</div>
      </div>
      <div className="cc-grid">
        {balances.map(b=> (
          <div key={b.tag} className="cc-item">
            <div className="cc-name">{b.name}</div>
            <div className={"cc-amt "+(b.amount>0? 'danger':'success')}>₹{b.amount.toFixed(2)}</div>
            <div className="small muted">Tag: {b.tag}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
