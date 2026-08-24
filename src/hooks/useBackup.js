import { STORAGE_KEYS } from '../constants.js';

export function useBackup({ transactions, budgets, settings, setTransactions, setBudgets, setSettings }){
  const exportBackup = ()=>{
    const payload = {
      version: 1,
      meta: { exportedAt: new Date().toISOString() },
      transactions,
      budgets,
      settings
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `fintrack-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const validate = (data)=>{
    if (!data || typeof data !== 'object') throw new Error('Invalid JSON');
    if (!('transactions' in data) || !('budgets' in data) || !('settings' in data)) throw new Error('Missing fields');
    if (!Array.isArray(data.transactions)) throw new Error('transactions must be array');
    if (typeof data.budgets !== 'object' || data.budgets===null) throw new Error('budgets must be object');
    if (typeof data.settings !== 'object' || data.settings===null) throw new Error('settings must be object');
    return true;
  };

  const importBackup = (data, { strategy = 'replace' } = {})=>{
    validate(data);
    if (strategy === 'replace'){
      setTransactions(data.transactions || []);
      setBudgets(data.budgets || {});
      setSettings(data.settings || {});
    } else if (strategy === 'merge'){
      setTransactions(prev=> [...(data.transactions||[]), ...prev]);
      setBudgets(prev=> ({...prev, ...(data.budgets||{})}));
      setSettings(prev=> ({...prev, ...(data.settings||{})}));
    }
    // persist explicitly to guarantee portability
    localStorage.setItem(STORAGE_KEYS.tx, JSON.stringify(data.transactions||[]));
    localStorage.setItem(STORAGE_KEYS.budgets, JSON.stringify(data.budgets||{}));
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(data.settings||{}));
  };

  const eraseAll = ()=>{
    setTransactions([]);
    setBudgets({});
    setSettings({});
    localStorage.removeItem(STORAGE_KEYS.tx);
    localStorage.removeItem(STORAGE_KEYS.budgets);
    localStorage.removeItem(STORAGE_KEYS.settings);
  };

  return { exportBackup, importBackup, eraseAll };
}
