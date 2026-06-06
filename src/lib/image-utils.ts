export const getHighResImage = (images: { link: string; quality: string }[] | undefined) => {
  if (!images || images.length === 0) return 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=500';
  
  // Sort by quality or just pick the last one which is usually 500x500
  const bestImage = images[images.length - 1].link;
  
  // Ensure HTTPS
  return bestImage.replace('http://', 'https://');
};