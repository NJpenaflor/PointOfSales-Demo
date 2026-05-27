import React from 'react'

function formatTransactionItems(items){
  return items.map(item => `${item.name} ${item.qty}x`).join(', ')
}

export default function Dashboard({ products, transactions, onClearTransactions }){
  // calculate simple stats
  const soldProducts = transactions.reduce(
    (sum, tx) => sum + tx.items.reduce((itemSum, item) => itemSum + item.qty, 0),
    0
  )
  const revenue = transactions.reduce((s,t)=>s + t.total, 0)
  const lowStock = products.filter(p=>p.stock <= 5)

  return (
    <div>
      <h2>Dashboard</h2>
      <div style={{display:'flex',gap:12}}>
        <div className="card" style={{flex:1}}>
          <div className="small">Sold Products</div>
          <div style={{fontSize:24,fontWeight:700}}>{soldProducts}</div>
        </div>
        <div className="card" style={{flex:1}}>
          <div className="small">Revenue</div>
          <div style={{fontSize:24,fontWeight:700}}>PHP {revenue}</div>
        </div>
        <div className="card" style={{flex:1}}>
          <div className="small">Low Stock Alerts</div>
          {lowStock.length === 0 ? <div className="small muted">All good</div> : lowStock.map(p=> <div key={p.id}>{p.name} ({p.stock})</div>)}
        </div>
      </div>

      <div style={{marginTop:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h4>Recent Transactions</h4>
        <button className="btn" style={{background:'#fff',color:'var(--brown)'}} onClick={onClearTransactions}>Clear Today</button>
      </div>
      <div className="card">
        {transactions.length === 0 && <div className="small muted">No transactions yet</div>}
        {transactions.map((t,i)=> (
          <div key={i} style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}>
            <div>
              <div style={{fontWeight:700}}>{formatTransactionItems(t.items)}</div>
              <div className="small muted">{t.date ? `${t.date}, ${t.time}` : t.time}</div>
            </div>
            <div>PHP {t.total}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
