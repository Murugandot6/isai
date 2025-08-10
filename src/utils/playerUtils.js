// This is a "pure" utility file. It has no Redux imports.

/**
 * Safely gets the highest quality URL from an image array.
 * @param {Array} arr - The array of quality/url objects.
 * @returns {string} The URL string or an empty string if not found.
 */
export const getImageUrl = (imageArray) => {
  if (!Array.isArray(imageArray) || imageArray.length === 0) {
    return '';
  }
  // Use the last item in the array, which is typically the highest quality.
  // The key is sometimes 'url' and sometimes 'link'. We check for both.
  return imageArray[imageArray.length - 1]?.link || imageArray[imageArray.length - 1]?.url || '';
};

/**
 * Safely gets a playable audio stream URL from a downloadUrl array.
 * Prioritizes MP3, then any available link.
 * @param {Array} urlArray - The array of download URL objects (e.g., from Saavn API).
 * @returns {string} The playable audio URL string or an empty string if not found.
 */
export const getAudioStreamUrl = (urlArray) => {
  if (!Array.isArray(urlArray) || urlArray.length === 0) {
    return '';
  }

  // Prioritize MP3 links
  const mp3Link = urlArray.find(q => q.link && q.link.includes('.mp3'));
  if (mp3Link) {
    return mp3Link.link;
  }

  // Fallback to any available link (highest quality is usually last)
  return urlArray[urlArray.length - 1]?.link || '';
};


/**
 * Normalizes a raw song object from the API into a simple, flat structure.
 * @param {object} song - The raw song object.
 * @returns {object} A clean song object with a `streamUrl`.
 */
export const normalizeSong = (song) => {
  if (!song || !song.id) return null; // Return null if the song is invalid
  return {
    ...song, // Keep all original properties
    title: song.name, // Map `name` to `title` for consistency
    subtitle: song.primaryArtists,
    image: getImageUrl(song.image), // Use getImageUrl for consistency
    streamUrl: getAudioStreamUrl(song.downloadUrl), // Use new audio stream URL getter
    allImages: song.image, // Keep original for other uses if needed
  };
};