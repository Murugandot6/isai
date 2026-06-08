"use client";

/**
 * Extracts the highest quality image URL from the API response.
 * Structure: [{ quality: "500x500", url: "..." }]
 */
export const getHighResImage = (image: any) => {
  const fallback = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=500';
  
  if (!image) return fallback;

  // If it's already a string
  if (typeof image === 'string') {
    return image.replace('http://', 'https://');
  }

  // If it's the new array structure
  if (Array.isArray(image) && image.length > 0) {
    // Try to find the 500x500 version as recommended
    const highRes = image.find(i => i.quality === '500x500') || image[image.length - 1];
    
    // The new API uses 'url'
    const imageUrl = highRes.url || highRes.link;
    
    if (imageUrl && typeof imageUrl === 'string') {
      return imageUrl.replace('http://', 'https://');
    }
  }

  return fallback;
};