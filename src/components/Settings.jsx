import React, { useRef, useState } from 'react';
import { useFin } from '../context/TransactionsContext.jsx';
import { BackupFrequencySelect } from '../hooks/useBackupReminder.jsx';
import { useDriveSync } from '../hooks/useDriveSync.jsx';

export default function Settings(){
  const { settings, setSettings, backup, transactions, budgets } = useFin();
  const drive = useDriveSync({ transactions, budgets, settings, setSettings });
  const fileRef = useRef();
  const [strategy, setStrategy] = useState('replace');

  const importFile = async()=>{
    const f = fileRef.current.files?.[0];
    if(!f) return;
    try{
      const text = await f.text();
      const json = JSON.parse(text);
      backup.importBackup(json, { strategy });
      alert('Import successful');
    }catch(e){ alert('Import failed: '+ e.message); }
  };

  return (
    <div className="card">
      <h3>Settings</h3>
      <div className="row">
        <label>Currency</label>
        <input value={settings?.currency||'INR'} onChange={e=> setSettings(s=> ({...s, currency: e.target.value}))} />
      </div>
      <div className="row" style={{marginTop:8}}>
        <label>Backup frequency</label>
        <BackupFrequencySelect />
      </div>
      <hr />
      <div className="row">
        <button onClick={backup.exportBackup}>Export Backup</button>
        <input type="file" accept="application/json" ref={fileRef} />
        <select value={strategy} onChange={e=> setStrategy(e.target.value)}>
          <option value="replace">Replace</option>
          <option value="merge">Merge</option>
        </select>
        <button onClick={importFile}>Import Backup</button>
      </div>
      <div className="row" style={{marginTop:8}}>
        <button onClick={()=>{ if(confirm('Erase all data?')) backup.eraseAll(); }}>Erase All Data</button>
      </div>
      <div className="small" style={{marginTop:8}}>Last backup: {settings?.backup?.lastBackupAt? new Date(settings.backup.lastBackupAt).toLocaleString(): 'Never'}</div>

      <hr />
      <h4>Google Drive Sync</h4>
      {!drive.connected ? (
        <div className="row">
          <button onClick={drive.connect}>Connect Google Drive</button>
          <span className="small">Status: {drive.status}</span>
        </div>
      ) : (
        <>
          <div className="row">
            <button onClick={drive.syncNow}>Sync Now (Upload)</button>
            <button onClick={drive.importFromDrive}>Import From Drive</button>
            <label style={{display:'flex',alignItems:'center',gap:6}}>
              <input type="checkbox" checked={drive.autoSync} onChange={e=> drive.setAutoSync(e.target.checked)} /> Auto-sync changes
            </label>
            <button onClick={drive.disconnect}>Disconnect</button>
          </div>
          <div className="small">Last Drive sync: {drive.lastSyncAt? new Date(drive.lastSyncAt).toLocaleString(): 'Never'}</div>
        </>
      )}
    </div>
  );
}
