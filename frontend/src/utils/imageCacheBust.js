 /**
 * @param {string} imageUrl - URL original de la imagen
 * @returns {string} URL con parámetro de timestamp
 */
export function addCacheBust(imageUrl) {
  if (!imageUrl) return imageUrl;
  
  const separator = imageUrl.includes('?') ? '&' : '?';
  return `${imageUrl}${separator}t=${Date.now()}`;
}
