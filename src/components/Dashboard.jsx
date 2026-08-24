import React from 'react';
import { useFin } from '../context/TransactionsContext.jsx';
import { useAnalytics } from '../hooks/useAnalytics.js';
import CategoryPie from './charts/CategoryPie.jsx';
import MonthlyBar from './charts/MonthlyBar.jsx';
import RunningBalance from './charts/RunningBalance.jsx';

export default function Dashboard(){
  const { transactions, budgets } = useFin();
  const a = useAnalytics(transactions, budgets);
  return (
    <>
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
