import React from 'react'
import logo from '../assets/logo.jpg'

export default function Navbar({ user }){
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <img src={logo} alt="logo" width="40" />
        <div>
          <div style={{fontWeight:700}}>UPTOWN BREW</div>
          <div className="small">{user.role.toUpperCase()}</div>
        </div>
      </div>
    </div>
  )
}
