# Copilot Project Guidance: FinTrack

Coding conventions:
- Client-only React + Vite (JavaScript/JSX). No backend, no auth.
- Persist with localStorage keys exactly:
  - fintrack.transactions.v1
  - fintrack.budgets.v1
  - fintrack.settings.v1
- Keep components small; put shared state in src/context/TransactionsContext.jsx.
- Recharts for charts; avoid extra deps.

Backup/restore:
- Export JSON must include { transactions, budgets, settings, meta }.
- Import accepts same JSON and replaces or merges predictably.
- Update settings.backup.lastBackupAt and entriesSinceLastBackup accordingly.

Reminder logic:
- Frequency options: Never, Daily, Weekly, Every 2 weeks, Monthly.
- Show banner if: never backed up with data, last backup older than interval, or many new entries.

Compatibility:
- Do not rename storage keys or change schema without versioning. Preserve v1.
