import { useCallback, useEffect, useRef, useState } from 'react';
import { STORAGE_KEYS } from '../constants.js';

const SCOPES = [
  'openid',
  'email',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata.readonly'
].join(' ');

const FOLDER_NAME = 'FinTrack';
const FILE_NAME = 'fintrack-backup.json';

function loadGIS(){
  return new Promise((resolve)=>{
    if (window.google && window.google.accounts && window.google.accounts.oauth2) return resolve();
    const id = 'gis-loader';
    if (document.getElementById(id)) return document.getElementById(id).addEventListener('load', ()=> resolve());
    const s = document.createElement('script'); s.id = id; s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.defer = true;
    s.onload = ()=> resolve(); document.head.appendChild(s);
  });
}

export function useDriveSync({ transactions, budgets, settings, setSettings }){
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const tokenRef = useRef(null);
  const tokenClientRef = useRef(null);
  const [status, setStatus] = useState('idle');

  const ensureToken = useCallback(async(prompt='')=>{
    await loadGIS();
    if (!tokenClientRef.current){
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES,
        callback: (resp)=>{ tokenRef.current = { access_token: resp.access_token, obtainedAt: Date.now(), expires_in: 3300 }; },
      });
    }
    return new Promise((resolve, reject)=>{
      tokenClientRef.current.callback = (resp)=>{
        if (resp && resp.access_token){ tokenRef.current = { access_token: resp.access_token, obtainedAt: Date.now(), expires_in: 3300 }; resolve(tokenRef.current.access_token); }
        else reject(new Error('Auth failed'));
      };
      tokenClientRef.current.requestAccessToken({ prompt });
    });
  }, [clientId]);

  const authHeader = ()=> ({ Authorization: `Bearer ${tokenRef.current?.access_token}` });

  const driveFetch = async(url, opts={})=>{
    const res = await fetch(url, { ...opts, headers: { ...(opts.headers||{}), ...authHeader() } });
    if (res.status===401){ await ensureToken(''); return driveFetch(url, opts); }
    if (!res.ok) throw new Error(await res.text());
    return res;
  };

  const findOrCreateFolder = useCallback(async()=>{
    const q = encodeURIComponent(`name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
    const list = await driveFetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`);
    const data = await list.json();
    if (data.files && data.files.length){ return data.files[0].id; }
    const meta = { name: FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' };
    const res = await driveFetch('https://www.googleapis.com/drive/v3/files', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(meta) });
    const created = await res.json();
    return created.id;
  }, []);

  const findFileInFolder = useCallback(async(folderId)=>{
    const q = encodeURIComponent(`name='${FILE_NAME}' and '${folderId}' in parents and trashed=false`);
    const list = await driveFetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,modifiedTime)`);
    const data = await list.json();
    return data.files && data.files[0] ? data.files[0] : null;
  }, []);

  const getFileMeta = useCallback(async(fileId)=>{
    const res = await driveFetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,modifiedTime`);
    return res.json();
  }, []);

  const uploadBackup = useCallback(async(folderId, fileId)=>{
    const payload = {
       version: 1,
       meta: { exportedAt: new Date().toISOString(), source: 'fintrack-web' },
       transactions,
       budgets,
       settings
    };
    // Only set parents on create. Updates must not include `parents` (Drive API requires addParents/removeParents params)
    const metadata = fileId ? { name: FILE_NAME } : { name: FILE_NAME, parents: [folderId] };
    const boundary = 'fintrack-' + Math.random().toString(36).slice(2);
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelim = `\r\n--${boundary}--`;
    const body =
      delimiter + 'Content-Type: application/json; charset=UTF-8\r\n\r\n' + JSON.stringify(metadata) +
      delimiter + 'Content-Type: application/json\r\n\r\n' + JSON.stringify(payload) +
      closeDelim;
    const url = fileId
      ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
      : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
    const res = await driveFetch(url, { method: fileId? 'PATCH':'POST', headers: { 'Content-Type': `multipart/related; boundary=${boundary}` }, body });
    return res.json();
  }, [transactions, budgets, settings]);

  const downloadBackup = useCallback(async(fileId)=>{
    const fileRes = await driveFetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`);
    return fileRes.json();
  }, []);

  const connect = useCallback(async()=>{
    setStatus('auth'); await ensureToken('consent'); setStatus('listing');
    const folderId = await findOrCreateFolder();
    const file = await findFileInFolder(folderId);
    setSettings(s=> ({...s, drive: { ...(s.drive||{}), connected: true, folderId, fileId: file?.id||null }}));
    setStatus('ready');
  }, [ensureToken, findOrCreateFolder, findFileInFolder, setSettings]);

  const syncNow = useCallback(async()=>{
    try{
      setStatus('syncing'); if (!settings?.drive?.connected) await connect();
      const folderId = settings?.drive?.folderId || (await findOrCreateFolder());
      const existing = settings?.drive?.fileId ? { id: settings.drive.fileId } : await findFileInFolder(folderId);
      const res = await uploadBackup(folderId, existing?.id);
      // fetch meta to capture server modified time
      const meta = await getFileMeta(res.id);
      setSettings(s=> ({...s, drive: { ...(s.drive||{}), connected: true, folderId, fileId: res.id, lastSyncAt: new Date().toISOString(), lastRemoteMTime: meta?.modifiedTime||null }}));
      setStatus('ready');
    }catch(e){ setStatus('error'); throw e; }
  }, [settings, connect, findOrCreateFolder, findFileInFolder, uploadBackup, getFileMeta, setSettings]);

  const importFromDrive = useCallback(async()=>{
    setStatus('downloading'); if (!settings?.drive?.connected) await connect();
    const folderId = settings?.drive?.folderId || (await findOrCreateFolder());
    const file = settings?.drive?.fileId ? { id: settings.drive.fileId } : await findFileInFolder(folderId);
    if (!file) throw new Error('No remote backup found');
    const json = await downloadBackup(file.id);
    if (!json || typeof json!=='object' || !('transactions' in json) || !('budgets' in json) || !('settings' in json)) throw new Error('Invalid backup format');
    localStorage.setItem(STORAGE_KEYS.tx, JSON.stringify(json.transactions||[]));
    localStorage.setItem(STORAGE_KEYS.budgets, JSON.stringify(json.budgets||{}));
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(json.settings||{}));
    // track the remote modifiedTime we just consumed
    try{ const meta = await getFileMeta(file.id); setSettings(s=> ({...s, drive: { ...(s.drive||{}), lastRemoteMTime: meta?.modifiedTime||s.drive?.lastRemoteMTime||null }})); }catch{}
    setStatus('ready');
    location.reload();
  }, [settings, connect, findOrCreateFolder, findFileInFolder, downloadBackup, getFileMeta, setSettings]);

  // Auto-sync uploads when local data changes
  useEffect(()=>{
    if (!settings?.drive?.autoSync || !settings?.drive?.connected) return;
    const t = setTimeout(()=>{ syncNow().catch(()=>{}); }, 1500);
    return ()=> clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(transactions), JSON.stringify(budgets), settings?.drive?.autoSync, settings?.drive?.connected]);

  // Auto-pull: on start and every 60s, if remote modifiedTime > lastSyncAt, pull
  useEffect(()=>{
    // Avoid triggering OAuth prompt automatically: require a token in this tab/session first
    if (!settings?.drive?.autoSync || !settings?.drive?.connected || !tokenRef.current?.access_token) return;
    let stopped = false;
    const check = async()=>{
      try{
        const folderId = settings?.drive?.folderId || (await findOrCreateFolder());
        const file = settings?.drive?.fileId ? { id: settings.drive.fileId } : await findFileInFolder(folderId);
        if (!file) return;
        const meta = await getFileMeta(file.id);
        const remote = meta?.modifiedTime? new Date(meta.modifiedTime).getTime() : 0;
        const last = settings?.drive?.lastRemoteMTime? new Date(settings.drive.lastRemoteMTime).getTime() : (settings?.drive?.lastSyncAt? new Date(settings.drive.lastSyncAt).getTime():0);
        if (remote && remote>last && !stopped){ await importFromDrive(); }
      }catch{ /* ignore transient errors */ }
    };
    check();
    const iv = setInterval(check, 60000);
    return ()=>{ stopped = true; clearInterval(iv); };
  }, [settings?.drive?.autoSync, settings?.drive?.connected, settings?.drive?.folderId, settings?.drive?.fileId, settings?.drive?.lastRemoteMTime, settings?.drive?.lastSyncAt, findOrCreateFolder, findFileInFolder, getFileMeta, importFromDrive]);

  const disconnect = useCallback(()=>{
    setSettings(s=> ({...s, drive: { connected: false, folderId: null, fileId: null, autoSync: false, lastSyncAt: null, lastRemoteMTime: null }}));
  }, [setSettings]);

  return {
    connected: !!settings?.drive?.connected,
    status,
    connect,
    syncNow,
    importFromDrive,
    disconnect,
    autoSync: !!settings?.drive?.autoSync,
    setAutoSync: (v)=> setSettings(s=> ({...s, drive: { ...(s.drive||{}), autoSync: !!v }})),
    lastSyncAt: settings?.drive?.lastSyncAt || null
  };
}
