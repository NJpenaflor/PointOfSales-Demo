import React, { useState } from 'react'
import ProductCard from '../components/ProductCard'
import Cart from '../components/Cart'

export default function POS({ products, onAddTransaction }){
  const [query, setQuery] = useState('')
  const [cart, setCart] = useState([])

  const list = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))

  function addToCart(product){
    setCart(prev => {
      const found = prev.find(i=>i.id===product.id)
      if(found) return prev.map(i => i.id===product.id ? {...i, qty: i.qty+1} : i)
      return [{ id: product.id, name: product.name, price: product.price, qty:1 }, ...prev]
    })
  }

  function changeQty(id, qty){
    setCart(prev => prev.map(i=> i.id===id ? {...i, qty: Math.max(0, qty)} : i).filter(i=>i.qty>0))
  }

  async function checkout(){
    const total = cart.reduce((s,i)=>s + i.price*i.qty, 0)
    const createdAt = new Date()
    const tx = {
      items: cart.map(item => ({ ...item })),
      total,
      date: createdAt.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' }),
      time: createdAt.toLocaleTimeString('en-US', { timeZone: 'Asia/Manila' }),
    }
    const saved = await onAddTransaction(tx)
    if(saved){
      setCart([])
    }
    return saved
  }

  return (
    <div style={{display:'flex',gap:12}}>
      <div style={{flex:1}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <input placeholder="Search products..." value={query} onChange={e=>setQuery(e.target.value)} style={{padding:8,borderRadius:8,border:'1px solid #ddd',width:'60%'}} />
          <div className="small muted">Products: {list.length}</div>
        </div>

        <div className="grid">
          {list.length > 0 ? (
            list.map(p => (
              <ProductCard key={p.id} product={p} onAdd={addToCart} />
            ))
          ) : (
            <div className="card" style={{padding:16,gridColumn:'1/-1'}}>
              <div className="small muted">No products yet. Admin can add inventory first.</div>
            </div>
          )}
        </div>
      </div>

      <div style={{width:360}}>
        <Cart cartItems={cart} onChangeQty={changeQty} onCheckout={checkout} />
      </div>
    </div>
  )
}
