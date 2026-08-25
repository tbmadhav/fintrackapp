import { useMemo } from 'react';

export function useAnalytics(transactions, budgets, settings){
  return useMemo(()=>{
    const tx = Array.isArray(transactions)? transactions: [];

    const cardTags = Object.keys(settings?.cards||{});
    const hasCardTag = (t)=> (t.tags||[]).some(tag=> cardTags.includes(tag));
    const isCardMethod = (t)=> t.paymentMethod==='Credit Card' || t.paymentMethod==='Credit Card UPI';
    const isSodexoSpend = (t)=> t.paymentMethod==='Sodexo / Meal Card' || t.category==='Sodexo / Meal Card';

    // Cashflow expenses exclude card-tagged purchases and Sodexo spends; include repayments
    const income = tx.filter(t=> t.type==='income').reduce((s,t)=> s+t.amount, 0);
    const cashExpense = tx.filter(t=> t.type==='expense')
      .filter(t=> !(isCardMethod(t) && hasCardTag(t)))
      .filter(t=> !isSodexoSpend(t))
      .reduce((s,t)=> s+t.amount, 0);
    const net = income - cashExpense;
    const savingsRate = income ? Math.max(0, ((income - cashExpense)/income)*100) : 0;

    // Monthly groups (cashflow)
    const byMonth = {};
    for(const t of tx){
      const m = (t.date||'').slice(0,7);
      if(!byMonth[m]) byMonth[m] = { income:0, expense:0 };
      if (t.type==='income') byMonth[m].income += t.amount;
      else if (t.type==='expense'){
        if (!(isCardMethod(t) && hasCardTag(t)) && !isSodexoSpend(t)) byMonth[m].expense += t.amount;
      }
    }
    const monthlySeries = Object.keys(byMonth).sort().map(m=> ({ month: m, income: byMonth[m].income, expense: byMonth[m].expense }));

    // Category distribution (show all spend regardless of funding source)
    const byCat = {};
    for(const t of tx.filter(x=>x.type==='expense')){
      byCat[t.category] = (byCat[t.category]||0) + t.amount;
    }
    const catSeries = Object.entries(byCat).map(([name,value])=> ({ name, value }))
      .sort((a,b)=> b.value-a.value);

    // Payment method usage (all)
    const byPay = {};
    for(const t of tx){ byPay[t.paymentMethod||'Other'] = (byPay[t.paymentMethod||'Other']||0) + t.amount; }
    const paymentSeries = Object.entries(byPay).map(([name,value])=> ({ name, value }));

    // Running balance (cashflow)
    const run = [...tx].sort((a,b)=> (a.date||'').localeCompare(b.date));
    let bal = 0; const running = run.map(r=>{
      if (r.type==='income') bal += r.amount;
      else if (r.type==='expense'){
        if (!(isCardMethod(r) && hasCardTag(r)) && !isSodexoSpend(r)) bal -= r.amount; // exclude CC purchases and Sodexo spends
      }
      return { date: r.date, balance: bal };
    });

    // Largest expense (overall spend)
    const largestExpense = tx.filter(t=> t.type==='expense').sort((a,b)=> b.amount-a.amount)[0]||null;

    // Averages (overall spend)
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

    // Budget usage (current month) — count all spend
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

    return { income, expense: cashExpense, net, savingsRate, monthlySeries, catSeries, paymentSeries, running, largestExpense, avgExpense: avg, recurring, nonRecurring, topTags, budgetUsage };
  }, [transactions, budgets, settings]);
}
