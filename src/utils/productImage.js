const publicAssetPrefix = '/assets/'

export function getProductImageSrc(product){
  const rawValue = product?.img || product?.image || product?.imageUrl || product?.photo || ''
  const value = typeof rawValue === 'string' ? rawValue.trim() : ''

  if (!value) {
    return ''
  }

  if (
    value.startsWith('data:image/') ||
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('/') ||
    value.startsWith('./')
  ) {
    return value
  }

  if (value.startsWith('public/')) {
    return `/${value.replace(/^public\//, '')}`
  }

  const fileName = value.split(/[\\/]/).pop()
  return `${publicAssetPrefix}${fileName}`
}

export function imageFileToDataUrl(file){
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve('')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const image = new Image()
      image.onload = () => {
        const maxSize = 900
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height))
        const width = Math.round(image.width * scale)
        const height = Math.round(image.height * scale)

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const context = canvas.getContext('2d')
        context.drawImage(image, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      image.onerror = () => reject(new Error('Unable to read selected image'))
      image.src = reader.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
