import React from 'react';
export default function NavBar({ items, current, setCurrent }){
  return (
    <div className="nav">
      {items.map(i=> (
        <button key={i} className={current===i? 'active':''} onClick={()=> setCurrent(i)}>{i}</button>
      ))}
    </div>
  );
}
