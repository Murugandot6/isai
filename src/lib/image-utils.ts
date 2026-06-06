export const getHighResImage = (images: { link: string; quality: string }[] | undefined) => {
  const fallback = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=500';
  
  if (!images || !Array.isArray(images) || images.length === 0) {
    return fallback;
  }
  
  // Get the last item which is usually the highest quality
  const imageObj = images[images.length - 1];
  
  if (!imageObj || !imageObj.link) {
    return fallback;
  }
  
  const bestImage = imageObj.link;
  
  // Ensure HTTPS safely
  return typeof bestImage === 'string' 
    ? bestImage.replace('http://', 'https://') 
    : fallback;
};