import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { STORAGE_KEYS } from '../constants.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { useBackup } from '../hooks/useBackup.js';

const Ctx = createContext(null);
export const useFin = ()=> useContext(Ctx);

const initialSettings = {
  currency: 'INR',
  backup: { frequency: 'Weekly', lastBackupAt: null, snoozedUntil: null, entriesSinceLastBackup: 0 },
  drive: { connected: false, folderId: null, fileId: null, autoSync: false, lastSyncAt: null }
};

export function TransactionsProvider({ children }){
  const [transactions, setTransactions] = useLocalStorage(STORAGE_KEYS.tx, []);
  const [budgets, setBudgets] = useLocalStorage(STORAGE_KEYS.budgets, {});
  const [settings, setSettings] = useLocalStorage(STORAGE_KEYS.settings, initialSettings);
  const backup = useBackup({ transactions, budgets, settings, setTransactions, setBudgets, setSettings });

  // Auto-import initial backup once if present and no data yet
  useEffect(()=>{
    const seedImported = localStorage.getItem('fintrack.seedImported');
    const empty = (!transactions?.length) && !Object.keys(budgets||{}).length && !!settings;
    if (!seedImported && empty) {
      fetch('/initial-backup.json').then(r=> r.ok ? r.json() : null).then(json=>{
        if (!json) return;
        backup.importBackup(json, { strategy: 'replace' });
        localStorage.setItem('fintrack.seedImported', '1');
      }).catch(()=>{});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addTransaction = (tx)=>{
    // basic validation
    if (!tx?.type || !['expense','income'].includes(tx.type)) throw new Error('Invalid type');
    if (!tx?.category) throw new Error('Category required');
    const amt = Number(tx.amount);
    if (!Number.isFinite(amt) || amt <= 0) throw new Error('Amount must be positive number');
    const entry = { id: crypto.randomUUID(), tags: [], notes: '', isRecurring: false, paymentMethod: 'Cash', ...tx, amount: amt };
    setTransactions(prev=>{
      const next = [entry, ...prev];
      setSettings(s=> ({...s, backup: {...s.backup, entriesSinceLastBackup: (s.backup?.entriesSinceLastBackup||0)+1 }}));
      return next;
    });
    return entry;
  };

  const updateTransaction = (id, patch)=> setTransactions(prev=> prev.map(t=> t.id===id? {...t, ...patch}: t));
  const removeTransaction = (id)=> setTransactions(prev=> prev.filter(t=> t.id!==id));

  const value = useMemo(()=>({
    transactions, setTransactions,
    budgets, setBudgets,
    settings, setSettings,
    addTransaction, updateTransaction, removeTransaction,
    backup
  }),[transactions, budgets, settings]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
