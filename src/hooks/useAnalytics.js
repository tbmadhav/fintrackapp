import { useMemo } from 'react';

export function useAnalytics(transactions, budgets){
  return useMemo(()=>{
    const tx = Array.isArray(transactions)? transactions: [];
    const income = tx.filter(t=> t.type==='income').reduce((s,t)=> s+t.amount, 0);
    const expense = tx.filter(t=> t.type==='expense').reduce((s,t)=> s+t.amount, 0);
    const net = income - expense;
    const savingsRate = income ? Math.max(0, ((income - expense)/income)*100) : 0;

    // Monthly groups
    const byMonth = {};
    for(const t of tx){
      const m = (t.date||'').slice(0,7);
      if(!byMonth[m]) byMonth[m] = { income:0, expense:0 };
      byMonth[m][t.type] += t.amount;
    }
    const monthlySeries = Object.keys(byMonth).sort().map(m=> ({ month: m, income: byMonth[m].income, expense: byMonth[m].expense }));

    // Category distribution (expenses only)
    const byCat = {};
    for(const t of tx.filter(x=>x.type==='expense')){
      byCat[t.category] = (byCat[t.category]||0) + t.amount;
    }
    const catSeries = Object.entries(byCat).map(([name,value])=> ({ name, value }))
      .sort((a,b)=> b.value-a.value);

    // Payment method usage
    const byPay = {};
    for(const t of tx){ byPay[t.paymentMethod||'Other'] = (byPay[t.paymentMethod||'Other']||0) + t.amount; }
    const paymentSeries = Object.entries(byPay).map(([name,value])=> ({ name, value }));

    // Running balance
    const run = [...tx].sort((a,b)=> (a.date||'').localeCompare(b.date));
    let bal = 0; const running = run.map(r=>{ bal += (r.type==='income'? r.amount: -r.amount); return { date: r.date, balance: bal }; });

    // Largest expense
    const largestExpense = tx.filter(t=> t.type==='expense').sort((a,b)=> b.amount-a.amount)[0]||null;

    // Averages
    const avgExpense = tx.filter(t=> t.type==='expense');
    const avg = avgExpense.length? avgExpense.reduce((s,t)=> s+t.amount,0)/avgExpense.length : 0;

    // Recurring split
    const recurring = tx.filter(t=> t.isRecurring).length;
    const nonRecurring = tx.length - recurring;

    // Top tags
    const tagMap = {};
    for(const t of tx){
      (t.tags||[]).forEach(tag=> tagMap[tag]=(tagMap[tag]||0)+1);
    }
    const topTags = Object.entries(tagMap).map(([name,count])=>({name,count})).sort((a,b)=> b.count-a.count).slice(0,10);

    // Budget usage (current month)
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    const monthSpendByCat = {};
    tx.filter(t=> t.type==='expense' && (t.date||'').startsWith(ym)).forEach(t=>{
      monthSpendByCat[t.category]=(monthSpendByCat[t.category]||0)+t.amount;
    });
    const monthBudgets = (budgets?.[ym]?.expense)||{};
    const budgetUsage = Object.keys(monthBudgets).map(cat=>{
      const limit = Number(monthBudgets[cat]||0);
      const spend = Number(monthSpendByCat[cat]||0);
      return { category: cat, limit, spend, remaining: Math.max(0, limit-spend), over: spend>limit };
    }).sort((a,b)=> a.category.localeCompare(b.category));

    return { income, expense, net, savingsRate, monthlySeries, catSeries, paymentSeries, running, largestExpense, avgExpense: avg, recurring, nonRecurring, topTags, budgetUsage };
  }, [transactions, budgets]);
}
