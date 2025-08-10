// This is a "pure" utility file. It has no Redux imports.

/**
 * Safely gets the highest quality URL from an image array or a single URL string.
 * @param {Array|string} imageInput - The array of quality/url objects or a single URL string.
 * @returns {string} The URL string or an empty string if not found.
 */
export const getImageUrl = (imageInput) => {
  if (typeof imageInput === 'string') { // If it's already a string URL
    return imageInput;
  }
  if (!Array.isArray(imageInput) || imageInput.length === 0) {
    return '';
  }
  // Use the last item in the array, which is typically the highest quality.
  // The key is sometimes 'url' and sometimes 'link'. We check for both.
  return imageInput[imageInput.length - 1]?.link || imageInput[imageInput.length - 1]?.url || '';
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

// Removed normalizeSong function as it's no longer needed.