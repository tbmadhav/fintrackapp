import React, { useMemo, useEffect } from 'react';
import { useFin } from '../context/TransactionsContext.jsx';

// Computes per-card outstanding and Sodexo remaining
// - Card purchases (Credit Card/CC UPI with matching tag) add to card balance; repayments (Payment to Credit Card) subtract
// - Sodexo: starts with configured remaining; any spend via Sodexo/Meal Card reduces remaining
export default function CreditCardBalances(){
  const { transactions, settings, setSettings } = useFin();

  // Initialize defaults if missing
  useEffect(()=>{
    if (!settings?.cards || !settings?.sodexo){
      setSettings(s=> ({
        ...s,
        cards: s?.cards || {
          cchdfc: { name: 'HDFC', startingOutstanding: 4421 },
          ccicici: { name: 'Amazon Pay ICICI', startingOutstanding: 1411 },
          ccsaph: { name: 'ICICI Sapphiro', startingOutstanding: 0 }
        },
        sodexo: s?.sodexo || { name: 'Sodexo', startingRemaining: 3954 }
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const model = useMemo(()=>{
    const cards = settings?.cards || {};
    const out = { cards: [], sodexo: null };
    const cardMap = {}; Object.keys(cards).forEach(tag=> cardMap[tag]=(cards[tag].startingOutstanding||0));
    let sodexo = settings?.sodexo?.startingRemaining || 0;

    const isCardPurchase = (t)=> t.type==='expense' && (t.paymentMethod==='Credit Card' || t.paymentMethod==='Credit Card UPI');
    const hasTag = (t, tag)=> Array.isArray(t.tags) && t.tags.some(x=> x.toLowerCase()===tag.toLowerCase());
    const isSodexoSpend = (t)=> t.type==='expense' && (t.paymentMethod==='Sodexo / Meal Card' || t.category==='Sodexo / Meal Card');

    (transactions||[]).forEach(t=>{
      Object.keys(cards).forEach(tag=>{
        if (hasTag(t, tag)){
          if (isCardPurchase(t)) cardMap[tag] += Number(t.amount)||0;
          if (t.category==='Payment to Credit Card') cardMap[tag] -= Number(t.amount)||0;
        }
      });
      if (isSodexoSpend(t)) sodexo -= Number(t.amount)||0;
    });

    out.cards = Object.entries(cards).map(([tag,def])=> ({ tag, name: def.name, amount: Math.max(0, Math.round((cardMap[tag]||0)*100)/100) }));
    out.sodexo = { name: settings?.sodexo?.name||'Sodexo', amount: Math.max(0, Math.round(sodexo*100)/100) };
    return out;
  }, [transactions, settings?.cards, settings?.sodexo]);

  if (!settings?.cards) return null;

  return (
    <div className="card">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
        <h3>Balances</h3>
        <div className="small">Card tags: {Object.keys(settings.cards).join(', ')}</div>
      </div>
      <div className="cc-grid">
        {model.cards.map(b=> (
          <div key={b.tag} className="cc-item">
            <div className="cc-name">{b.name}</div>
            <div className="cc-amt danger">₹{b.amount.toFixed(2)}</div>
            <div className="small muted">Tag: {b.tag}</div>
          </div>
        ))}
        <div className="cc-item">
          <div className="cc-name">{model.sodexo.name} (Remaining)</div>
          <div className="cc-amt success">₹{model.sodexo.amount.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
