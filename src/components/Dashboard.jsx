import React from 'react';
import { useFin } from '../context/TransactionsContext.jsx';
import { useAnalytics } from '../hooks/useAnalytics.js';
import { useDriveSync } from '../hooks/useDriveSync.jsx';
import CategoryPie from './charts/CategoryPie.jsx';
import MonthlyBar from './charts/MonthlyBar.jsx';
import RunningBalance from './charts/RunningBalance.jsx';
import CreditCardBalances from './CreditCardBalances.jsx';

export default function Dashboard(){
  const { transactions, budgets, settings, setSettings } = useFin();
  const drive = useDriveSync({ transactions, budgets, settings, setSettings });
  const a = useAnalytics(transactions, budgets);
  return (
    <>
      <div className="card" style={{marginBottom:12, display:'flex', alignItems:'center', gap:12, justifyContent:'space-between'}}>
        <div>
          <strong>Sync</strong>
          <div className="small">Status: {drive.status} · Last Drive sync: {drive.lastSyncAt? new Date(drive.lastSyncAt).toLocaleString(): 'Never'}</div>
        </div>
        {!drive.connected ? (
          <button className="btn btn-primary" onClick={drive.connect}>Connect Google Drive</button>
        ) : (
          <div className="row">
            <button className="btn btn-primary" onClick={async()=>{ try{ await drive.syncNow(); alert('Synced to Drive'); }catch(e){ console.error(e); alert('Sync failed: '+ (e?.message||e)); } }}>Sync Now</button>
            <button className="btn btn-secondary" onClick={async()=>{ try{ await drive.importFromDrive(); }catch(e){ console.error(e); alert('Import failed: '+ (e?.message||e)); } }}>Pull Latest</button>
          </div>
        )}
      </div>

      <CreditCardBalances />

      <div className="metrics4">
        <div className="card metric"><div className="label">Total Income</div><div className="value">₹ {a.income.toFixed(2)}</div></div>
        <div className="card metric"><div className="label">Total Expense</div><div className="value">₹ {a.expense.toFixed(2)}</div></div>
        <div className="card metric"><div className="label">Net Balance</div><div className="value">₹ {a.net.toFixed(2)}</div></div>
        <div className="card metric"><div className="label">Savings Rate</div><div className="value">{a.savingsRate.toFixed(1)}%</div></div>
      </div>
      <div className="grid">
        <div className="card">
          <h3>Spend by Category</h3>
          <CategoryPie data={a.catSeries} />
        </div>
        <div className="card">
          <h3>Income vs Expense (last 12 months)</h3>
          <MonthlyBar data={a.monthlySeries} />
        </div>
        <div className="card" style={{gridColumn:'1 / -1'}}>
          <h3>Running Balance</h3>
          <RunningBalance data={a.running} />
        </div>
      </div>
    </>
  );
}
