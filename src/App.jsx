import React, { useEffect, useState } from 'react'
import { initialProducts, sampleTransactions } from './data'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import POS from './pages/POS'
import Inventory from './pages/Inventory'
import Reports from './pages/Reports'

const API_BASE = import.meta.env?.VITE_API_BASE || ''
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
    if (!API_BASE) localStorage.setItem(DEMO_STORAGE.products, JSON.stringify(products))
  }, [products])

  useEffect(() => {
    if (!API_BASE) localStorage.setItem(DEMO_STORAGE.transactions, JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    if (!API_BASE) return

    async function loadData(){
      try {
        const [productsResponse, transactionsResponse] = await Promise.all([
          fetch(`${API_BASE}/api/products`),
          fetch(`${API_BASE}/api/transactions`),
        ])

        if (!productsResponse.ok) {
          throw new Error('Unable to load products')
        }

        const productsResult = await productsResponse.json()
        setProducts(productsResult.products || [])

        if (transactionsResponse.ok) {
          const transactionsResult = await transactionsResponse.json()
          setTransactions(transactionsResult.transactions || [])
        }
      } catch (error) {
        console.error('Initial data request failed:', error)
      }
    }

    loadData()
  }, [])

  async function handleLogin(username, password){
    if (!API_BASE) {
      if (!username || !password) return false
      const normalizedUsername = username.toLowerCase()
      const users = readDemoData(DEMO_STORAGE.users, [])
      const user = users.find(item => item.username === normalizedUsername && item.password === password)
      const isDefaultAdmin = normalizedUsername === 'admin' && password === 'admin123'
      if (normalizedUsername === 'admin' && !isDefaultAdmin && !user) return false
      const demoUser = user || (isDefaultAdmin
        ? { username: 'admin', role: 'admin' }
        : { username: normalizedUsername, role: 'cashier' })
      setUser(demoUser)
      setPage(demoUser.role === 'admin' ? 'Dashboard' : 'POS')
      return true
    }

    try {
      const response = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        return false
      }

      const userData = await response.json()
      setUser(userData)
      setPage(userData.role === 'admin' ? 'Dashboard' : 'POS')
      return true
    } catch (error) {
      console.error('Login request failed:', error)
      return false
    }
  }

  async function handleSignup(username, password, confirmPassword, role){
    if (password !== confirmPassword) {
      return { success: false, message: 'Passwords do not match' }
    }

    if (!API_BASE) {
      const users = readDemoData(DEMO_STORAGE.users, [])
      const normalizedUsername = username.trim().toLowerCase()
      if (users.some(item => item.username === normalizedUsername)) {
        return { success: false, message: 'Username already exists' }
      }
      localStorage.setItem(DEMO_STORAGE.users, JSON.stringify([
        ...users,
        { username: normalizedUsername, password, role },
      ]))
      return { success: true, message: 'Account created. Please sign in.' }
    }

    try {
      const response = await fetch(`${API_BASE}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
      })

      const result = await response.json()
      if (!response.ok) {
        return { success: false, message: result.error || 'Unable to create account' }
      }

      return { success: true, message: 'Account created. Please sign in.' }
    } catch (error) {
      console.error('Signup request failed:', error)
      return { success: false, message: 'Unable to connect to server' }
    }
  }

  function handleLogout(){ setUser(null); setPage('POS') }

  async function addTransaction(tx){
    if (!API_BASE) {
      setTransactions(prev => [
        { ...tx, id: `demo-${Date.now()}` },
        ...prev,
      ])
      setProducts(prev => prev.map(product => {
        const sold = tx.items.find(item => item.id === product.id)
        return sold ? { ...product, stock: Math.max(0, product.stock - sold.qty) } : product
      }))
      return true
    }

    try {
      const response = await fetch(`${API_BASE}/api/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tx),
      })

      const result = await response.json()
      if (!response.ok) {
        alert(result.error || 'Unable to save transaction')
        return false
      }

      setTransactions(prev => [result.transaction, ...prev])
      setProducts(prev => prev.map(product => {
        const updatedProduct = result.products.find(p => p.id === product.id)
        return updatedProduct || product
      }))
      return true
    } catch (error) {
      console.error('Transaction create failed:', error)
      alert('Unable to connect to server')
      return false
    }
  }

  async function updateProduct(updated){
    if (!API_BASE) {
      setProducts(prev => prev.map(product => product.id === updated.id ? updated : product))
      return true
    }

    try {
      const response = await fetch(`${API_BASE}/api/products/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })

      const result = await response.json()
      if (!response.ok) {
        alert(result.error || 'Unable to update product')
        return false
      }

      setProducts(prev => prev.map(p => p.id === updated.id ? result.product : p))
      return true
    } catch (error) {
      console.error('Product update failed:', error)
      alert('Unable to connect to server')
      return false
    }
  }

  async function addProduct(newProduct){
    if (!API_BASE) {
      setProducts(prev => [{ ...newProduct, id: `demo-${Date.now()}` }, ...prev])
      return true
    }

    try {
      const response = await fetch(`${API_BASE}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      })

      const result = await response.json()
      if (!response.ok) {
        alert(result.error || 'Unable to add product')
        return false
      }

      setProducts(prev => [result.product, ...prev])
      return true
    } catch (error) {
      console.error('Product create failed:', error)
      alert('Unable to connect to server')
      return false
    }
  }

  async function deleteProduct(id){
    if (!API_BASE) {
      setProducts(prev => prev.filter(product => product.id !== id))
      return
    }

    try {
      const response = await fetch(`${API_BASE}/api/products/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()
      if (!response.ok) {
        alert(result.error || 'Unable to delete product')
        return
      }

      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (error) {
      console.error('Product delete failed:', error)
      alert('Unable to connect to server')
    }
  }

  async function clearTransactions(){
    if (!API_BASE) {
      setTransactions([])
      return
    }

    try {
      const response = await fetch(`${API_BASE}/api/transactions`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const result = await response.json()
        alert(result.error || 'Unable to clear transactions')
        return
      }

      setTransactions([])
    } catch (error) {
      console.error('Transactions clear failed:', error)
      alert('Unable to connect to server')
    }
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
