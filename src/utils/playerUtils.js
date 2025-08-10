// This is a "pure" utility file. It has no Redux imports.

/**
 * Safely gets the highest quality URL from a Saavn API array (image or downloadUrl).
 * @param {Array} arr - The array of quality/url objects.
 * @returns {string} The URL string or an empty string if not found.
 */
export const getBestUrl = (arr) => {
  if (!Array.isArray(arr) || arr.length === 0) {
    return '';
  }
  // The last item in the array is the highest quality.
  // The key is sometimes 'url' and sometimes 'link'. We check for both.
  return arr[arr.length - 1]?.url || arr[arr.length - 1]?.link || '';
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
    image: getBestUrl(song.image),
    streamUrl: getBestUrl(song.downloadUrl), // This is the crucial fix for playback
    allImages: song.image,
  };
};