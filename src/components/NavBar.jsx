import React from 'react';
import { useFin } from '../context/TransactionsContext.jsx';

export default function NavBar({ items, current, setCurrent, mobileOpen=false, setMobileOpen }){
  const { transactions } = useFin();
  const onClickItem = (i)=>{ setCurrent(i); if (window.innerWidth<=960 && setMobileOpen) setMobileOpen(false); };
  return (
    <aside className={"sidebar" + (mobileOpen? " open":"")}>
      <div className="brand">
        <div className="logo">₹</div>
        <div style={{flex:1}}>
          <div className="brand-title">FinTrack</div>
          <div className="brand-sub">PLAN • TRACK • GROW</div>
        </div>
        {setMobileOpen && (
          <button className="close-side" aria-label="Close menu" onClick={()=> setMobileOpen(false)}>✕</button>
        )}
      </div>
      <nav className="side-nav">
        {items.map(i=> (
          <button key={i} className={"side-item "+(current===i? 'active':'')} onClick={()=> onClickItem(i)}>
            <span className="dot" />{i}
          </button>
        ))}
      </nav>
      <div className="side-footer small">{transactions?.length||0} records stored locally</div>
    </aside>
  );
}
