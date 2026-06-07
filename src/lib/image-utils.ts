"use client";

/**
 * Extracts the highest quality image URL from the API response.
 * Follows the documentation best practice of using the 500x500 quality item.
 */
export const getHighResImage = (image: any) => {
  const fallback = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=500';
  
  if (!image) return fallback;

  // If it's already a string
  if (typeof image === 'string') {
    return image.replace('http://', 'https://');
  }

  // Documentation shows an array of objects with a 'url' property
  if (Array.isArray(image) && image.length > 0) {
    // Try to find the 500x500 version specifically as recommended
    const highRes = image.find(i => i.quality === '500x500') || image[image.length - 1];
    
    // Prioritize 'url' over 'link' as seen in the examples
    const imageUrl = highRes.url || highRes.link;
    
    if (imageUrl && typeof imageUrl === 'string') {
      return imageUrl.replace('http://', 'https://');
    }
  }

  return fallback;
};