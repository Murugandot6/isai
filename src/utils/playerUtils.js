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
    console.log('getAudioStreamUrl: Input urlArray is empty or not an array. Returning empty string.', urlArray);
    return '';
  }

  let highestQualityMp3 = null;
  let highestQualityFallback = null; // To store the best non-mp3 link if no mp3 is found

  for (const item of urlArray) {
    const currentLink = item?.link || item?.url; // Check for both 'link' and 'url'
    if (currentLink) {
      const currentQuality = parseInt(item.quality); // Assuming quality is always present and parseable

      if (currentLink.includes('.mp3')) {
        if (!highestQualityMp3 || currentQuality > parseInt(highestQualityMp3.quality)) {
          highestQualityMp3 = { link: currentLink, quality: item.quality };
        }
      } else { // Not an MP3, but a valid link
        if (!highestQualityFallback || currentQuality > parseInt(highestQualityFallback.quality)) {
          highestQualityFallback = { link: currentLink, quality: item.quality };
        }
      }
    }
  }

  if (highestQualityMp3) {
    console.log(`getAudioStreamUrl: Found highest quality MP3: ${highestQualityMp3.link}`);
    return highestQualityMp3.link;
  }

  if (highestQualityFallback) {
    console.log(`getAudioStreamUrl: No MP3 found, falling back to highest quality non-MP3: ${highestQualityFallback.link}`);
    return highestQualityFallback.link;
  }

  console.log('getAudioStreamUrl: No valid audio link (MP3 or other) found after checking all items. Full urlArray:', urlArray);
  return '';
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