const express = require('express')
const { MongoClient, ObjectId } = require('mongodb')
const bcrypt = require('bcryptjs')
const cors = require('cors')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 3001
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017'
const dbName = process.env.DB_NAME || 'uptownbrew'
const client = new MongoClient(mongoUri)

let usersCollection
let logsCollection
let productsCollection
let transactionsCollection

function createPhilippineTimestamp() {
  const createdAt = new Date()
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
  const parts = Object.fromEntries(
    formatter.formatToParts(createdAt).map((part) => [part.type, part.value])
  )

  return {
    createdAt,
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}:${parts.second} ${parts.dayPeriod}`,
    philippineTimeZone: 'Asia/Manila',
  }
}

function createAuthLog(action, username, role) {
  const timestamp = createPhilippineTimestamp()

  return {
    action,
    username,
    role,
    ...timestamp,
  }
}

async function seedAdmin() {
  try {
    const existing = await usersCollection.findOne({ username: 'admin' })
    if (!existing) {
      const passwordHash = bcrypt.hashSync('admin123', 10)
      const timestamp = createPhilippineTimestamp()
      await usersCollection.insertOne({
        username: 'admin',
        passwordHash,
        role: 'admin',
        ...timestamp,
      })
      await logsCollection.insertOne(createAuthLog('seed_admin', 'admin', 'admin'))
      console.log('Seeded default admin account: admin / admin123')
    }
  } catch (error) {
    console.error('Error seeding admin user:', error)
  }
}

async function initDatabase() {
  await client.connect()
  const db = client.db(dbName)
  usersCollection = db.collection('users')
  logsCollection = db.collection('auth_logs')
  productsCollection = db.collection('products')
  transactionsCollection = db.collection('transactions')

  await usersCollection.createIndex({ username: 1 }, { unique: true })
  await logsCollection.createIndex({ createdAt: 1 })
  await productsCollection.createIndex({ createdAt: 1 })
  await transactionsCollection.createIndex({ createdAt: -1 })

  await seedAdmin()
  console.log(`Connected to MongoDB database: ${dbName}`)
}

function logAuth(action, username, role) {
  if (!logsCollection) return
  logsCollection.insertOne(createAuthLog(action, username, role)).catch(console.error)
}

function getImageValue(body) {
  const value = body?.img || body?.image || body?.imageUrl || body?.photo || ''
  return typeof value === 'string' ? value.trim() : ''
}

function serializeTransaction(transaction) {
  const { _id, ...rest } = transaction
  return {
    ...rest,
    id: _id.toString(),
  }
}

app.use(cors())
app.use(express.json({ limit: '25mb' }))

app.post('/api/signup', async (req, res) => {
  const { username, password, role } = req.body || {}
  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Username, password, and role are required' })
  }

  const normalizedUsername = username.trim().toLowerCase()
  const normalizedRole = role.trim().toLowerCase()
  if (!normalizedUsername) {
    return res.status(400).json({ error: 'Invalid username' })
  }
  if (!['admin', 'cashier'].includes(normalizedRole)) {
    return res.status(400).json({ error: 'Role must be admin or cashier' })
  }

  try {
    const existingUser = await usersCollection.findOne({ username: normalizedUsername })
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' })
    }

    const passwordHash = bcrypt.hashSync(password, 10)
    const timestamp = createPhilippineTimestamp()
    const createdUser = {
      username: normalizedUsername,
      passwordHash,
      role: normalizedRole,
      ...timestamp,
    }

    await usersCollection.insertOne(createdUser)
    logAuth('signup', normalizedUsername, normalizedRole)

    return res.json({ username: normalizedUsername, role: normalizedRole })
  } catch (error) {
    console.error('Signup error:', error)
    return res.status(500).json({ error: 'Unable to create account' })
  }
})

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' })
  }

  const normalizedUsername = username.trim().toLowerCase()
  try {
    const user = await usersCollection.findOne({ username: normalizedUsername })
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isPasswordOk = bcrypt.compareSync(password, user.passwordHash)
    if (!isPasswordOk) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    logAuth('login', normalizedUsername, user.role)
    return res.json({ username: user.username, role: user.role })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ error: 'Unable to complete login' })
  }
})

app.get('/api/users', async (req, res) => {
  try {
    const users = await usersCollection
      .find({}, { projection: { passwordHash: 0 } })
      .toArray()
    return res.json({ users })
  } catch (error) {
    console.error('Users list error:', error)
    return res.status(500).json({ error: 'Unable to fetch users' })
  }
})

app.get('/api/products', async (req, res) => {
  try {
    const products = await productsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray()
    return res.json({
      products: products.map(({ _id, ...product }) => ({
        ...product,
        id: _id.toString(),
      })),
    })
  } catch (error) {
    console.error('Products list error:', error)
    return res.status(500).json({ error: 'Unable to fetch products' })
  }
})

app.post('/api/products', async (req, res) => {
  const { name, price, stock } = req.body || {}
  const normalizedName = typeof name === 'string' ? name.trim() : ''

  if (!normalizedName) {
    return res.status(400).json({ error: 'Product name is required' })
  }

  const product = {
    name: normalizedName,
    price: Number(price) || 0,
    stock: Number(stock) || 0,
    img: getImageValue(req.body),
    ...createPhilippineTimestamp(),
  }

  try {
    const result = await productsCollection.insertOne(product)
    return res.status(201).json({
      product: {
        ...product,
        id: result.insertedId.toString(),
      },
    })
  } catch (error) {
    console.error('Product create error:', error)
    return res.status(500).json({ error: 'Unable to create product' })
  }
})

app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params
  const { name, price, stock } = req.body || {}

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid product id' })
  }

  const normalizedName = typeof name === 'string' ? name.trim() : ''
  if (!normalizedName) {
    return res.status(400).json({ error: 'Product name is required' })
  }

  const update = {
    name: normalizedName,
    price: Number(price) || 0,
    stock: Number(stock) || 0,
    img: getImageValue(req.body),
    updatedAt: new Date(),
  }

  try {
    const result = await productsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    )

    if (!result) {
      return res.status(404).json({ error: 'Product not found' })
    }

    const { _id, ...product } = result
    return res.json({
      product: {
        ...product,
        id: _id.toString(),
      },
    })
  } catch (error) {
    console.error('Product update error:', error)
    return res.status(500).json({ error: 'Unable to update product' })
  }
})

app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid product id' })
  }

  try {
    const result = await productsCollection.deleteOne({ _id: new ObjectId(id) })
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }

    return res.json({ success: true })
  } catch (error) {
    console.error('Product delete error:', error)
    return res.status(500).json({ error: 'Unable to delete product' })
  }
})

app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await transactionsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    return res.json({ transactions: transactions.map(serializeTransaction) })
  } catch (error) {
    console.error('Transactions list error:', error)
    return res.status(500).json({ error: 'Unable to fetch transactions' })
  }
})

app.post('/api/transactions', async (req, res) => {
  const { items } = req.body || {}
  const normalizedItems = Array.isArray(items)
    ? items.map((item) => ({
        id: item.id,
        name: typeof item.name === 'string' ? item.name.trim() : '',
        price: Number(item.price) || 0,
        qty: Math.floor(Number(item.qty) || 0),
      }))
    : []

  if (normalizedItems.length === 0) {
    return res.status(400).json({ error: 'Transaction must include at least one item' })
  }

  if (normalizedItems.some((item) => !ObjectId.isValid(item.id) || item.qty <= 0)) {
    return res.status(400).json({ error: 'Transaction contains invalid items' })
  }

  try {
    const productIds = normalizedItems.map((item) => new ObjectId(item.id))
    const products = await productsCollection
      .find({ _id: { $in: productIds } })
      .toArray()
    const productMap = new Map(products.map((product) => [product._id.toString(), product]))

    for (const item of normalizedItems) {
      const product = productMap.get(item.id)
      if (!product) {
        throw new Error(`Product not found: ${item.name || item.id}`)
      }
      if (Number(product.stock) < item.qty) {
        throw new Error(`Not enough stock for ${product.name}`)
      }
    }

    for (const item of normalizedItems) {
      const result = await productsCollection.updateOne(
        { _id: new ObjectId(item.id), stock: { $gte: item.qty } },
        { $inc: { stock: -item.qty }, $set: { updatedAt: new Date() } }
      )

      if (result.modifiedCount !== 1) {
        throw new Error(`Unable to update stock for ${item.name || item.id}`)
      }
    }

    const timestamp = createPhilippineTimestamp()
    const transaction = {
      items: normalizedItems.map((item) => ({
        productId: new ObjectId(item.id),
        id: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty,
        subtotal: item.price * item.qty,
      })),
      total: normalizedItems.reduce((sum, item) => sum + item.price * item.qty, 0),
      ...timestamp,
    }

    const insertResult = await transactionsCollection.insertOne(transaction)
    const savedTransaction = serializeTransaction({
      ...transaction,
      _id: insertResult.insertedId,
    })

    const updatedProducts = await productsCollection
      .find({ _id: { $in: productIds } })
      .toArray()

    return res.status(201).json({
      transaction: savedTransaction,
      products: updatedProducts.map(({ _id, ...product }) => ({
        ...product,
        id: _id.toString(),
      })),
    })
  } catch (error) {
    console.error('Transaction create error:', error)
    return res.status(400).json({ error: error.message || 'Unable to create transaction' })
  }
})

app.delete('/api/transactions', async (req, res) => {
  try {
    await transactionsCollection.deleteMany({})
    return res.json({ success: true })
  } catch (error) {
    console.error('Transactions clear error:', error)
    return res.status(500).json({ error: 'Unable to clear transactions' })
  }
})

app.use((error, req, res, next) => {
  if (error?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Image is too large. Please choose a smaller image.' })
  }

  return next(error)
})

initDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`)
    })
  })
  .catch((error) => {
    console.error('Failed to start server:', error)
    process.exit(1)
  })
