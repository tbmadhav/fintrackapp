import React from 'react';
import { useFin } from '../context/TransactionsContext.jsx';
import { useAnalytics } from '../hooks/useAnalytics.js';
import CategoryPie from './charts/CategoryPie.jsx';
import MonthlyBar from './charts/MonthlyBar.jsx';
import RunningBalance from './charts/RunningBalance.jsx';

export default function Analysis(){
  const { transactions, budgets } = useFin();
  const a = useAnalytics(transactions, budgets);
  return (
    <div className="grid">
      <div className="card"><h3>Category-wise Expenses</h3><CategoryPie data={a.catSeries} /></div>
      <div className="card"><h3>Monthly Trends</h3><MonthlyBar data={a.monthlySeries} /></div>
      <div className="card"><h3>Running Balance</h3><RunningBalance data={a.running} /></div>
      <div className="card">
        <h3>Top Tags</h3>
        <ul>
          {a.topTags.map(t=> <li key={t.name}>{t.name} - {t.count}</li>)}
        </ul>
      </div>
      <div className="card">
        <h3>Recurring vs Non-Recurring</h3>
        <div className="row"><span>Recurring</span><strong>{a.recurring}</strong></div>
        <div className="row"><span>Non-Recurring</span><strong>{a.nonRecurring}</strong></div>
        <div className="row"><span>Average Expense</span><strong>₹{a.avgExpense.toFixed(2)}</strong></div>
      </div>
      <div className="card">
        <h3>Budget Usage (Current Month)</h3>
        <table className="table"><thead><tr><th>Category</th><th>Limit</th><th>Spend</th><th>Remaining</th><th>Status</th></tr></thead>
          <tbody>
            {a.budgetUsage.map(b=> (
              <tr key={b.category}><td>{b.category}</td><td>₹{b.limit.toFixed(2)}</td><td>₹{b.spend.toFixed(2)}</td><td>₹{b.remaining.toFixed(2)}</td><td>{b.over? 'Over':'OK'}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
