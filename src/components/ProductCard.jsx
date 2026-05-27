import React from 'react'
import { getProductImageSrc } from '../utils/productImage'

export default function ProductCard({ product, onAdd }){
  const imageSrc = getProductImageSrc(product)

  return (
    <div className="card product-card">
      {imageSrc ? (
        <img src={imageSrc} alt={product.name} />
      ) : (
        <div className="product-image-empty">No image</div>
      )}
      <div className="meta">
        <div>
          <div style={{fontWeight:700}}>{product.name}</div>
          <div className="small">PHP {product.price}</div>
        </div>
        <div>
          <button className="btn" onClick={()=>onAdd(product)}>Add</button>
        </div>
      </div>
    </div>
  )
}
