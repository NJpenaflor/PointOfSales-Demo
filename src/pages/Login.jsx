import React, { useState } from 'react'
import logo from '../assets/logo.jpg'

export default function Login({ onLogin, onSignup }){
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('cashier')
  const [error, setError] = useState(null)
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  async function submit(e){
    e.preventDefault()
    setError(null)
    setStatus(null)
    setLoading(true)

    if(mode === 'signup'){
      const result = await onSignup(username.trim(), password, confirmPassword, role)
      setLoading(false)
      if(result.success){
        setStatus(result.message)
        setMode('login')
        setUsername('')
        setPassword('')
        setConfirmPassword('')
        setRole('cashier')
        return
      }
      setError(result.message)
      return
    }

    const ok = await onLogin(username.trim(), password)
    setLoading(false)
    if(!ok) setError('Invalid credentials')
  }

  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh'}}>
      <div style={{width:420}}>
        <div style={{textAlign:'center',marginBottom:12}}>
          <img src={logo} alt="logo" width="140" />
          <h2>UPTOWN BREW</h2>
          <div className="small muted">Demo Mode Only</div>
        </div>
        <form className="card" onSubmit={submit}>
          <div style={{marginBottom:8}}>
            <label className="small">Username Ex: Admin</label>
            <input value={username} onChange={e=>setUsername(e.target.value)} style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #ddd'}} />
          </div>
          <div style={{marginBottom:8}}>
            <label className="small">Password Ex: Admin123</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #ddd'}} />
          </div>
          {mode === 'signup' && (
            <>
              <div style={{marginBottom:8}}>
                <label className="small">Role</label>
                <select value={role} onChange={e=>setRole(e.target.value)} style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #ddd'}}>
                  <option value="cashier">Cashier</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{marginBottom:8}}>
                <label className="small">Confirm password</label>
                <input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #ddd'}} />
              </div>
            </>
          )}
          {error && <div style={{color:'red',marginBottom:8}}>{error}</div>}
          {status && <div style={{color:'green',marginBottom:8}}>{status}</div>}
          <div style={{marginTop:12,display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
            <button type="button" className="btn btn-secondary" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setStatus(null) }}>
              {mode === 'login' ? 'Create a new account' : 'Back to login'}
            </button>
            <button className="btn" type="submit" disabled={loading}>{mode === 'signup' ? 'Sign Up' : 'Login'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
