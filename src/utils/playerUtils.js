"use client";

/**
 * Safely gets the highest quality URL from an image array or a single URL string.
 * Prioritizes larger dimensions from 'quality' or 'width'/'height' properties.
 * @param {Array|string} imageInput - The array of quality/url objects or a single URL string.
 * @returns {string} The URL string of the highest quality image, or an empty string if not found.
 */
export const getImageUrl = (imageInput) => {
  if (!imageInput) {
    return '';
  }
  if (typeof imageInput === 'string') {
    return imageInput;
  }
  if (Array.isArray(imageInput)) {
    if (imageInput.length === 0) {
      return '';
    }

    let bestImageUrl = '';
    let maxDimension = 0;

    for (const item of imageInput) {
      let currentLink = '';
      let currentDimension = 0;

      if (typeof item === 'string') {
        currentLink = item;
        // If we encounter a simple string URL, and haven't found a better structured one yet,
        // we can use it as a fallback. However, we prioritize structured objects with quality.
        // For now, let's just take the first valid string if no structured image is found later.
        // This will be handled after the loop.
      } else if (typeof item === 'object' && item !== null) {
        currentLink = item.link || item.url; // Check both 'link' and 'url'
        if (item.quality) {
          const dimensions = item.quality.split('x').map(Number);
          currentDimension = Math.max(...dimensions);
        } else if (item.width && item.height) {
          currentDimension = Math.max(item.width, item.height);
        }
      }

      if (currentLink && currentDimension > maxDimension) {
        maxDimension = currentDimension;
        bestImageUrl = currentLink;
      }
    }

    // Fallback: If no structured image with quality was found, try to return the first valid string URL from the array.
    if (!bestImageUrl && imageInput.length > 0) {
        for (const item of imageInput) {
            if (typeof item === 'string' && item !== '') {
                return item;
            }
        }
    }

    return bestImageUrl;
  }
  return '';
};

/**
 * Safely gets a playable audio stream URL from a downloadUrl array.
 * Prioritizes MP3, then any available link.
 * @param {Array} urlArray - The array of download URL objects (e.g., from Saavn API).
 * @returns {string} The playable audio URL string or an empty string if not found.
 */
export const getAudioStreamUrl = (urlArray) => {
  console.log('getAudioStreamUrl: Received urlArray:', urlArray);

  if (!Array.isArray(urlArray) || urlArray.length === 0) {
    console.log('getAudioStreamUrl: urlArray is not an array or is empty. Returning empty string.');
    return '';
  }

  let highestQualityMp3 = null;
  let highestQualityFallback = null;

  for (const item of urlArray) {
    const currentLink = item?.link || item?.url;
    if (currentLink) {
      const currentQuality = parseInt(item.quality);

      if (currentLink.includes('.mp3')) {
        if (!highestQualityMp3 || currentQuality > parseInt(highestQualityMp3.quality)) {
          highestQualityMp3 = { link: currentLink, quality: item.quality };
        }
      } else {
        if (!highestQualityFallback || currentQuality > parseInt(highestQualityFallback.quality)) {
          highestQualityFallback = { link: currentLink, quality: item.quality };
        }
      }
    }
  }

  let finalUrl = '';
  if (highestQualityMp3) {
    finalUrl = highestQualityMp3.link;
  } else if (highestQualityFallback) {
    finalUrl = highestQualityFallback.link;
  }

  console.log('getAudioStreamUrl: Returning URL:', finalUrl);
  return finalUrl;
};