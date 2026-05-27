import React, { useState } from 'react'
import { getProductImageSrc, imageFileToDataUrl } from '../utils/productImage'

export default function Inventory({ products, onAdd, onEdit, onDelete }){
  // Local form state for adding a product
  const [name, setName] = useState('')
  const [price, setPrice] = useState(50)
  const [stock, setStock] = useState(10)
  const [addImage, setAddImage] = useState(null)

  // Editing state for inline edits
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState(0)
  const [editStock, setEditStock] = useState(0)
  const [editImage, setEditImage] = useState(null)

  async function handleAdd(e){
    e.preventDefault()
    if(!name) return alert('Please enter a product name')
    let imgPath = ''
    if(addImage){
      imgPath = await imageFileToDataUrl(addImage)
    }
    const saved = await onAdd({ name, price: Number(price), stock: Number(stock), img: imgPath })
    if(saved){
      setName(''); setPrice(50); setStock(10)
      setAddImage(null)
    }
  }

  function startEdit(p){
    setEditingId(p.id)
    setEditName(p.name)
    setEditPrice(p.price)
    setEditStock(p.stock)
    setEditImage(p.img || p.image || p.imageUrl || p.photo || null)
  }

  async function saveEdit(){
    let imgPath = editImage
    if(editImage && typeof editImage === 'object'){
      imgPath = await imageFileToDataUrl(editImage)
    }
    const saved = await onEdit({ id: editingId, name: editName, price: Number(editPrice), stock: Number(editStock), img: imgPath })
    if(saved){
      setEditingId(null)
    }
  }

  function cancelEdit(){ setEditingId(null) }

  return (
    <div>
      <h2>Inventory</h2>

      <form className="card" onSubmit={handleAdd} style={{marginBottom:12}}>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <input placeholder="Product name" value={name} onChange={e=>setName(e.target.value)} style={{flex:1,padding:8,borderRadius:6,border:'1px solid #ddd'}} />
          <input type="number" value={price} onChange={e=>setPrice(e.target.value)} style={{width:100,padding:8,borderRadius:6,border:'1px solid #ddd'}} />
          <input type="number" value={stock} onChange={e=>setStock(e.target.value)} style={{width:100,padding:8,borderRadius:6,border:'1px solid #ddd'}} />
          <input type="file" accept="image/*" onChange={e=>setAddImage(e.target.files[0])} />
          <button className="btn" type="submit">Add Product</button>
        </div>
        <div style={{marginTop:8,display:'flex',alignItems:'center',gap:12}}>
          {addImage && <img src={URL.createObjectURL(addImage)} alt="preview" width={64} style={{borderRadius:8}} />}
          <div className="small muted">New products are saved to the database.</div>
        </div>
      </form>

      <div className="card">
        <table className="table">
          <thead>
            <tr><th>Image</th><th>Name</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>
                  {getProductImageSrc(p) ? (
                    <img src={getProductImageSrc(p)} alt={p.name} width={56} height={42} style={{borderRadius:6,objectFit:'cover'}} />
                  ) : (
                    <span className="small muted">No image</span>
                  )}
                </td>
                <td>
                  {editingId === p.id ? (
                    <input value={editName} onChange={e=>setEditName(e.target.value)} />
                  ) : (
                    p.name
                  )}
                </td>
                <td>
                  {editingId === p.id ? (
                    <input type="number" value={editPrice} onChange={e=>setEditPrice(e.target.value)} style={{width:100}} />
                  ) : (
                    `PHP ${p.price}`
                  )}
                </td>
                <td>
                  {editingId === p.id ? (
                    <input type="number" value={editStock} onChange={e=>setEditStock(e.target.value)} style={{width:80}} />
                  ) : (
                    p.stock
                  )}
                </td>
                <td>
                  {editingId === p.id ? (
                    <div style={{display:'flex',flexDirection:'column',gap:8}}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <input type="file" accept="image/*" onChange={e=>setEditImage(e.target.files[0])} />
                        {editImage && typeof editImage === 'string' && <img src={getProductImageSrc({ ...products.find(p => p.id === editingId), img: editImage })} alt="preview" width={48} style={{borderRadius:6}} />}
                        {editImage && typeof editImage === 'object' && <img src={URL.createObjectURL(editImage)} alt="preview" width={48} style={{borderRadius:6}} />}
                      </div>
                      <div style={{display:'flex',gap:8}}>
                        <button className="btn" onClick={saveEdit}>Save</button>
                        <button className="btn" onClick={cancelEdit} style={{marginLeft:8,background:'#fff',color:'var(--brown)'}}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button className="btn" onClick={()=>startEdit(p)}>Edit</button>
                      <button className="btn" onClick={()=>onDelete(p.id)} style={{marginLeft:8,background:'#fff',color:'var(--brown)'}}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
