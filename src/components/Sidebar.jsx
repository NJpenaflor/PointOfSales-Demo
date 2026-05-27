import React from 'react'
import logo from '../assets/logo.jpg'

export default function Sidebar({ user, page, setPage, onLogout }){
  // Simple sidebar with role-aware links
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
        <img src={logo} alt="logo" width="56" />
        <div>
          <div style={{fontWeight:700}}>UPTOWN BREW</div>
          <div style={{fontSize:12}}>Villanueva Street</div>
        </div>
      </div>

      <nav>
        <button className="btn" style={{width:'100%',marginBottom:8}} onClick={()=>setPage('POS')}>POS</button>
        {user.role === 'admin' && (
          <>
            <div style={{height:8}} />
            <button className="btn" style={{width:'100%',background:'transparent',color:'var(--cream)',border:'1px solid rgba(255,255,255,0.08)',marginBottom:8,textAlign:'left',paddingLeft:12}} onClick={()=>setPage('Dashboard')}>Dashboard</button>
            <button className="btn" style={{width:'100%',background:'transparent',color:'var(--cream)',border:'1px solid rgba(255,255,255,0.08)',marginBottom:8,textAlign:'left',paddingLeft:12}} onClick={()=>setPage('Inventory')}>Inventory</button>
            <button className="btn" style={{width:'100%',background:'transparent',color:'var(--cream)',border:'1px solid rgba(255,255,255,0.08)',marginBottom:8,textAlign:'left',paddingLeft:12}} onClick={()=>setPage('Reports')}>Reports</button>
          </>
        )}

        <div style={{marginTop:20}}>
          <div className="small">Logged in as</div>
          <div style={{fontWeight:700}}>{user.username} ({user.role})</div>
        </div>

        <div style={{marginTop:12}}>
          <button className="btn" onClick={onLogout} style={{background:'#fff',color: 'var(--brown)'}}>Logout</button>
        </div>
      </nav>
    </div>
  )
}
