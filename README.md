# FinTrack

A client-side personal finance app built with React + Vite. Stores data in browser localStorage and supports portable backups.

## Features
- Transactions (expense/income) with categories, payment methods, tags, recurring flag
- Dashboard, Budgets, Analysis with Recharts
- Local persistence across restarts
- Backup export/import (JSON) with automatic reminders

## Tech
React, Vite, JavaScript/JSX, Recharts, localStorage. No backend.

## Run
```
cp .env.example .env.local   # set VITE_GOOGLE_CLIENT_ID
npm install
npm run dev
```
Open the printed local URL.

## OAuth setup
- Add Authorized JavaScript origins: http://localhost:5173 and https://tbmadhav.github.io
- Scopes: openid, email, https://www.googleapis.com/auth/drive.file, https://www.googleapis.com/auth/drive.metadata.readonly
- Drive Sync lives in Settings → Google Drive Sync

## Deploy (GitHub Pages)
- Push to main (or this branch) to trigger Actions.
- In GitHub → Settings → Pages → set Source: GitHub Actions.
- App URL: https://tbmadhav.github.io/fintrackapp/

## Storage keys
- fintrack.transactions.v1
- fintrack.budgets.v1
- fintrack.settings.v1

## Backup portability
Exports include transactions, budgets, settings, and reminder metadata. Import on any machine via Settings → Import Backup.
