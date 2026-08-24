import React, { useMemo } from 'react';
import { useFin } from '../context/TransactionsContext.jsx';
import { BACKUP_FREQUENCIES } from '../constants.js';

function addDays(d, n){ const dt = new Date(d); dt.setDate(dt.getDate()+n); return dt; }

function due(settings, transactions){
  const freq = settings?.backup?.frequency || 'Weekly';
  if (freq==='Never') return { show:false };
  const last = settings?.backup?.lastBackupAt ? new Date(settings.backup.lastBackupAt) : null;
  const entriesSince = settings?.backup?.entriesSinceLastBackup||0;
  const snoozed = settings?.backup?.snoozedUntil ? new Date(settings.backup.snoozedUntil) : null;
  const now = new Date();
  if (snoozed && snoozed>now) return { show:false };
  const hasData = (transactions||[]).length>0;
  if (!hasData && !last) return { show:false };
  const days = freq==='Daily'?1: freq==='Weekly'?7: freq==='Every 2 weeks'?14: 30;
  const nextDue = last? addDays(last, days): new Date(0);
  const stale = now>nextDue;
  const manyNew = entriesSince>=25; // heuristic
  return { show: stale || (!last && hasData) || manyNew, manyNew };
}

export function useBackupReminderBanner(){
  const { settings, setSettings, transactions, backup } = useFin();
  const state = useMemo(()=> due(settings, transactions), [settings, transactions]);
  if (!state.show) return null;
  return (
    <div className="banner warn">
      <div><strong>Backup recommended.</strong> Configure frequency in Settings. {state.manyNew? 'You have many new entries since last backup.':''}</div>
      <div className="actions">
        <button onClick={()=>{ backup.exportBackup(); setSettings(s=> ({...s, backup:{...s.backup, lastBackupAt: new Date().toISOString(), entriesSinceLastBackup:0}})); }}>Export Now</button>
        <button onClick={()=> setSettings(s=> ({...s, backup:{...s.backup, snoozedUntil: new Date(Date.now()+3*24*3600*1000).toISOString()}}))}>Snooze 3 days</button>
      </div>
      <div className="small">Last backup: {settings?.backup?.lastBackupAt? new Date(settings.backup.lastBackupAt).toLocaleString(): 'Never'}</div>
    </div>
  );
}

export function BackupFrequencySelect(){
  const { settings, setSettings } = useFin();
  return (
    <select value={settings?.backup?.frequency||'Weekly'} onChange={(e)=> setSettings(s=> ({...s, backup:{...s.backup, frequency: e.target.value}}))}>
      {BACKUP_FREQUENCIES.map(x=> <option key={x} value={x}>{x}</option>)}
    </select>
  );
}
