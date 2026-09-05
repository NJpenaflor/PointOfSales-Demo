import React from 'react'

export default function Reports({ transactions, products, onClearTransactions }){
  // simple aggregates
  const total = transactions.length
  const revenue = transactions.reduce((s,t)=>s + t.total, 0)
  // best selling by counting items
  const counts = {}
  transactions.forEach(tx => tx.items.forEach(i => { counts[i.name] = (counts[i.name]||0) + i.qty }))
  const best = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,5)

  return (
    <div>
      <h2>Reports</h2>
      <div className="stats-row">
        <div className="card" style={{flex:1}}>
          <div className="small">Total Transactions</div>
          <div style={{fontWeight:700,fontSize:20}}>{total}</div>
        </div>
        <div className="card" style={{flex:1}}>
          <div className="small">Revenue</div>
          <div style={{fontWeight:700,fontSize:20}}>PHP {revenue}</div>
        </div>
      </div>

      <div style={{marginTop:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h4>Best Selling</h4>
        <button className="btn" style={{background:'#fff',color:'var(--brown)'}} onClick={onClearTransactions}>Clear Sales</button>
      </div>
      <div className="card">
        {best.length === 0 && <div className="small muted">No sales yet</div>}
        {best.map(([name,qty]) => (
          <div key={name} style={{display:'flex',justifyContent:'space-between'}}>
            <div>{name}</div>
            <div>{qty}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
