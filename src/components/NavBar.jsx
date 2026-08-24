import React from 'react';
import { useFin } from '../context/TransactionsContext.jsx';

export default function NavBar({ items, current, setCurrent }){
  const { transactions } = useFin();
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="logo">₹</div>
        <div>
          <div className="brand-title">FinTrack</div>
          <div className="brand-sub">PLAN • TRACK • GROW</div>
        </div>
      </div>
      <nav className="side-nav">
        {items.map(i=> (
          <button key={i} className={"side-item "+(current===i? 'active':'')} onClick={()=> setCurrent(i)}>
            <span className="dot" />{i}
          </button>
        ))}
      </nav>
      <div className="side-footer small">{transactions?.length||0} records stored locally</div>
    </aside>
  );
}
