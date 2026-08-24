import React, { useState } from 'react';
import NavBar from './components/NavBar.jsx';
import Dashboard from './components/Dashboard.jsx';
import AddEntryForm from './components/AddEntryForm.jsx';
import TransactionsList from './components/TransactionsList.jsx';
import Budgets from './components/Budgets.jsx';
import Analysis from './components/Analysis.jsx';
import Settings from './components/Settings.jsx';
import { useBackupReminderBanner } from './hooks/useBackupReminder.jsx';

const sections = ['Dashboard','Add Entry','Transactions','Budgets','Analysis','Settings'];

export default function App(){
  const [tab, setTab] = useState('Dashboard');
  const banner = useBackupReminderBanner();

  return (
    <div className="container">
      <h1>FinTrack</h1>
      {banner}
      <NavBar current={tab} setCurrent={setTab} items={sections} />
      <div className="content">
        {tab === 'Dashboard' && <Dashboard />} 
        {tab === 'Add Entry' && <AddEntryForm onSaved={()=>setTab('Transactions')} />} 
        {tab === 'Transactions' && <TransactionsList />} 
        {tab === 'Budgets' && <Budgets />} 
        {tab === 'Analysis' && <Analysis />} 
        {tab === 'Settings' && <Settings />} 
      </div>
    </div>
  );
}
