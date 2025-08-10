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

  let foundStreamUrl = '';

  // Iterate through the array to find any valid link
  for (const item of urlArray) {
    if (item && item.link) {
      console.log(`getAudioStreamUrl: Found link in item: ${item.link}`);
      // Prioritize MP3 if available, otherwise take the first valid link
      if (item.link.includes('.mp3')) {
        // If we find an MP3, we can stop searching for a better one for now, or implement more complex quality logic later.
        // For now, let's just take the first MP3 we find.
        foundStreamUrl = item.link;
        break; // Found an MP3, let's use it.
      } else if (!foundStreamUrl) { // If no MP3 yet, take the first non-MP3 link as a fallback
        foundStreamUrl = item.link;
      }
    } else {
      console.log('getAudioStreamUrl: Item in urlArray does not have a "link" property or is null/undefined:', item);
    }
  }

  if (!foundStreamUrl) {
    console.log('getAudioStreamUrl: No valid audio link found after checking all items. Full urlArray:', urlArray);
  } else {
    console.log(`getAudioStreamUrl: Final selected streamUrl: ${foundStreamUrl}`);
  }

  return foundStreamUrl;
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