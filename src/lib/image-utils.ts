"use client";

/**
 * Extracts the highest quality image URL from the API response.
 * Handles both array of objects and single string formats.
 */
export const getHighResImage = (image: any) => {
  const fallback = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=500';
  
  if (!image) return fallback;

  // If it's already a string
  if (typeof image === 'string') {
    return image.replace('http://', 'https://');
  }

  // If it's an array of image objects (standard Saavn API format)
  if (Array.isArray(image) && image.length > 0) {
    // Get the last item (highest quality)
    const imageObj = image[image.length - 1];
    
    // Handle both 'link' and 'url' properties
    const imageUrl = imageObj.link || imageObj.url;
    
    if (imageUrl && typeof imageUrl === 'string') {
      return imageUrl.replace('http://', 'https://');
    }
  }

  return fallback;
};