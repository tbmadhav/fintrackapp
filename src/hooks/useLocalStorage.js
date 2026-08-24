import { useEffect, useState } from 'react';

export function useLocalStorage(key, defaultValue){
  const [state, setState] = useState(()=>{
    try{
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    }catch{
      return defaultValue;
    }
  });

  useEffect(()=>{
    try{ localStorage.setItem(key, JSON.stringify(state)); }catch{}
  },[key, state]);

  return [state, setState];
}
