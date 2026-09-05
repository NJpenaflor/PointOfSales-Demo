import React, { useEffect, useState } from 'react'
import { initialProducts, sampleTransactions } from './data'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import POS from './pages/POS'
import Inventory from './pages/Inventory'
import Reports from './pages/Reports'

const DEMO_STORAGE = {
  products: 'uptown-brew-demo-products',
  transactions: 'uptown-brew-demo-transactions',
  users: 'uptown-brew-demo-users',
}

function readDemoData(key, fallback){
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch (error) {
    console.error('Demo data read failed:', error)
    return fallback
  }
}

export default function App(){
  // top-level app state
  const [user, setUser] = useState(null) // {username, role}
  const [page, setPage] = useState('POS')
  const [products, setProducts] = useState(() => readDemoData(DEMO_STORAGE.products, initialProducts))
  const [transactions, setTransactions] = useState(() => readDemoData(DEMO_STORAGE.transactions, sampleTransactions))

  useEffect(() => {
    localStorage.setItem(DEMO_STORAGE.products, JSON.stringify(products))
  }, [products])

  useEffect(() => {
    localStorage.setItem(DEMO_STORAGE.transactions, JSON.stringify(transactions))
  }, [transactions])

  function handleLogin(username, password){
    if (!username || !password) return false

    const normalizedUsername = username.trim().toLowerCase()
    const users = readDemoData(DEMO_STORAGE.users, [])
    const savedUser = users.find(item => item.username === normalizedUsername && item.password === password)
    const isDefaultAdmin = normalizedUsername === 'admin' && password === 'admin123'

    if (normalizedUsername === 'admin' && !isDefaultAdmin && !savedUser) return false

    const loggedInUser = savedUser || (isDefaultAdmin
      ? { username: 'admin', role: 'admin' }
      : { username: normalizedUsername, role: 'cashier' })

    setUser(loggedInUser)
    setPage(loggedInUser.role === 'admin' ? 'Dashboard' : 'POS')
    return true
  }

  function handleSignup(username, password, confirmPassword, role){
    if (password !== confirmPassword) {
      return { success: false, message: 'Passwords do not match' }
    }

    const normalizedUsername = username.trim().toLowerCase()
    if (!normalizedUsername || !password) {
      return { success: false, message: 'Username and password are required' }
    }

    const users = readDemoData(DEMO_STORAGE.users, [])
    if (users.some(item => item.username === normalizedUsername)) {
      return { success: false, message: 'Username already exists' }
    }

    localStorage.setItem(DEMO_STORAGE.users, JSON.stringify([
      ...users,
      { username: normalizedUsername, password, role },
    ]))
    return { success: true, message: 'Account created. Please sign in.' }
  }

  function handleLogout(){ setUser(null); setPage('POS') }

  function addTransaction(tx){
    setTransactions(prev => [{ ...tx, id: `demo-${Date.now()}` }, ...prev])
    setProducts(prev => prev.map(product => {
      const sold = tx.items.find(item => item.id === product.id)
      return sold ? { ...product, stock: Math.max(0, product.stock - sold.qty) } : product
    }))
    return true
  }

  function updateProduct(updated){
    setProducts(prev => prev.map(product => product.id === updated.id ? updated : product))
    return true
  }

  function addProduct(newProduct){
    setProducts(prev => [{ ...newProduct, id: `demo-${Date.now()}` }, ...prev])
    return true
  }

  function deleteProduct(id){
    setProducts(prev => prev.filter(product => product.id !== id))
  }

  function clearTransactions(){
    setTransactions([])
  }

  // role-based page access
  if(!user) return <Login onLogin={handleLogin} onSignup={handleSignup} />

  return (
    <div className="app">
      <div className="sidebar">
        <Sidebar user={user} page={page} setPage={setPage} onLogout={handleLogout} />
      </div>
      <div className="main">
        <div className="navbar card">
          <Navbar user={user} />
        </div>
        <div className="content">
          {page === 'Dashboard' && user.role === 'admin' && (
            <Dashboard products={products} transactions={transactions} onClearTransactions={clearTransactions} />
          )}

          {page === 'POS' && (
            <POS products={products} onAddTransaction={addTransaction} />
          )}

          {page === 'Inventory' && user.role === 'admin' && (
            <Inventory products={products} onAdd={addProduct} onEdit={updateProduct} onDelete={deleteProduct} />
          )}

          {page === 'Reports' && user.role === 'admin' && (
            <Reports transactions={transactions} products={products} onClearTransactions={clearTransactions} />
          )}
        </div>
      </div>
    </div>
  )
}
