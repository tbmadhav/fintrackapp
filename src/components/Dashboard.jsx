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
    <div className="grid">
      <div className="card">
        <h3>Summary</h3>
        <div className="row"><span>Total Income</span><strong>₹ {a.income.toFixed(2)}</strong></div>
        <div className="row"><span>Total Expenses</span><strong>₹ {a.expense.toFixed(2)}</strong></div>
        <div className="row"><span>Net Balance</span><strong>₹ {a.net.toFixed(2)}</strong></div>
        <div className="row"><span>Savings Rate</span><strong>{a.savingsRate.toFixed(1)}%</strong></div>
        {a.largestExpense && <div className="row small">Largest expense: {a.largestExpense.category} ₹{a.largestExpense.amount.toFixed(2)}</div>}
      </div>
      <div className="card">
        <h3>Category Distribution</h3>
        <CategoryPie data={a.catSeries} />
      </div>
      <div className="card">
        <h3>Monthly Income vs Expense</h3>
        <MonthlyBar data={a.monthlySeries} />
      </div>
      <div className="card">
        <h3>Running Balance</h3>
        <RunningBalance data={a.running} />
      </div>
    </div>
  );
}
