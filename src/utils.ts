// 判断是否是 URL
export const isUrl = (value: string): boolean => {
  if (!value || typeof value !== 'string') return false
  return value.startsWith('http://') || value.startsWith('https://')
}

// 判断是否是图片 URL
export const isImageUrl = (value: string): boolean => {
  if (!isUrl(value)) return false
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico']
  const lowerValue = value.toLowerCase().split('?')[0]
  if (imageExtensions.some(ext => lowerValue.endsWith(ext))) {
    return true
  }
  const imagePatterns = [
    /\/image\//i,
    /\/img\//i,
    /\/photo\//i,
    /\/pic\//i,
    /\.image$/i,
    /format=(?:jpg|jpeg|png|gif|webp)/i,
  ]
  return imagePatterns.some(pattern => pattern.test(value))
}
