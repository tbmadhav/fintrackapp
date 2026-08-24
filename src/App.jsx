import React, { useState } from 'react';
import NavBar from './components/NavBar.jsx';
import Dashboard from './components/Dashboard.jsx';
import AddEntryForm from './components/AddEntryForm.jsx';
import TransactionsList from './components/TransactionsList.jsx';
import Budgets from './components/Budgets.jsx';
import Analysis from './components/Analysis.jsx';
import Settings from './components/Settings.jsx';

const sections = ['Dashboard','Add Entry','Transactions','Budgets','Analysis','Settings'];

export default function App(){
  const [tab, setTab] = useState('Dashboard');
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-layout">
      <NavBar current={tab} setCurrent={setTab} items={sections} mobileOpen={menuOpen} setMobileOpen={setMenuOpen} />
      <main className="main">
        <header className="page-header">
          <button className="hamburger" aria-label="Open menu" onClick={()=> setMenuOpen(true)}>☰</button>
          <h2>{tab}</h2>
        </header>
        <div className="content">
          {tab === 'Dashboard' && <Dashboard />}
          {tab === 'Add Entry' && <AddEntryForm onSaved={()=>setTab('Transactions')} />}
          {tab === 'Transactions' && <TransactionsList />}
          {tab === 'Budgets' && <Budgets />}
          {tab === 'Analysis' && <Analysis />}
          {tab === 'Settings' && <Settings />}
        </div>
      </main>
      {menuOpen && <div className="backdrop" onClick={()=> setMenuOpen(false)} />}
      <button className="fab" aria-label="Open menu" onClick={()=> setMenuOpen(true)}>☰</button>
    </div>
  );
}
