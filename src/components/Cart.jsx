import React, { useState } from 'react'

export default function Cart({ cartItems, onChangeQty, onCheckout }){
  const [showReceipt, setShowReceipt] = useState(false)
  const [receiptItems, setReceiptItems] = useState([])
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const subtotal = cartItems.reduce((s,i)=>s + i.price * i.qty,0)
  const receiptTotal = receiptItems.reduce((s,i)=>s + i.price * i.qty,0)

  async function handleCheckout(){
    setIsCheckingOut(true)
    const itemsSnapshot = cartItems.map(item => ({ ...item }))
    const saved = await onCheckout()
    setIsCheckingOut(false)
    if(saved){
      setReceiptItems(itemsSnapshot)
      setShowReceipt(true)
      setTimeout(()=>setShowReceipt(false), 4000)
    }
  }

  return (
    <div className="card cart">
      <h3>Cart</h3>
      {cartItems.length === 0 && <div className="small muted">No items</div>}
      {cartItems.map(item=> (
        <div key={item.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8}}>
          <div>
            <div style={{fontWeight:700}}>{item.name}</div>
            <div className="small">PHP {item.price}</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <button onClick={()=>onChangeQty(item.id, item.qty - 1)} className="btn">-</button>
            <div>{item.qty}</div>
            <button onClick={()=>onChangeQty(item.id, item.qty + 1)} className="btn">+</button>
          </div>
        </div>
      ))}

      <div style={{marginTop:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div className="small">Total</div>
        <div style={{fontWeight:700}}>PHP {subtotal}</div>
      </div>
      <div style={{marginTop:12}}>
        <button className="btn" onClick={handleCheckout} disabled={cartItems.length===0 || isCheckingOut}>
          {isCheckingOut ? 'Saving...' : 'Checkout'}
        </button>
      </div>

      {showReceipt && (
        <div className="card" style={{marginTop:12}}>
          <h4>Receipt Preview</h4>
          {receiptItems.map(i=> (
            <div key={i.id} style={{display:'flex',justifyContent:'space-between'}}>
              <div>{i.name} x{i.qty}</div>
              <div>PHP {i.qty * i.price}</div>
            </div>
          ))}
          <div style={{marginTop:8,fontWeight:700}}>Total: PHP {receiptTotal}</div>
        </div>
      )}
    </div>
  )
}
