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
    console.log('getAudioStreamUrl: Input urlArray is empty or not an array.');
    return '';
  }

  // Find the highest quality MP3 link if available
  let highestQualityMp3 = null;
  for (const item of urlArray) {
    if (item.link && item.link.includes('.mp3')) {
      // Assuming quality is in the 'quality' property, e.g., "128kbps"
      const currentQuality = parseInt(item.quality);
      if (!highestQualityMp3 || currentQuality > parseInt(highestQualityMp3.quality)) {
        highestQualityMp3 = item;
      }
    }
  }

  if (highestQualityMp3) {
    console.log(`getAudioStreamUrl: Found highest quality MP3: ${highestQualityMp3.link}`);
    return highestQualityMp3.link;
  }

  // Fallback to any available link if no MP3 is found (highest quality is usually last)
  const fallbackLink = urlArray[urlArray.length - 1]?.link || '';
  if (fallbackLink) {
    console.log(`getAudioStreamUrl: Falling back to: ${fallbackLink}`);
  } else {
    console.log('getAudioStreamUrl: No valid audio link found after all attempts.', urlArray);
  }
  return fallbackLink;
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