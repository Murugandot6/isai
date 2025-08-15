"use client";

/**
 * Safely gets the highest quality URL from an image array or a single URL string.
 * Prioritizes larger dimensions from 'quality' or 'width'/'height' properties,
 * and also handles objects where keys are dimensions (e.g., "50x50").
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

    // Iterate from the end, assuming higher quality images are often at the end of the array
    for (let i = imageInput.length - 1; i >= 0; i--) {
      const item = imageInput[i];
      let currentLink = '';
      let currentDimension = 0;

      if (typeof item === 'object' && item !== null) {
        // Prioritize 'link' or 'url' properties
        currentLink = item.link || item.url;
        if (item.quality) {
          const dimensions = item.quality.split('x').map(Number);
          currentDimension = Math.max(...dimensions);
        } else if (item.width && item.height) {
          currentDimension = Math.max(item.width, item.height);
        } else {
          // If no 'link'/'url' or explicit dimensions, check if object keys are dimensions
          // This handles cases like { "50x50": "url1", "150x150": "url2" }
          for (const key in item) {
            if (Object.prototype.hasOwnProperty.call(item, key) && typeof item[key] === 'string') {
              // Try to parse dimension from key (e.g., "50x50")
              const dimsMatch = key.match(/(\d+)x(\d+)/);
              if (dimsMatch) {
                const dim = Math.max(parseInt(dimsMatch[1]), parseInt(dimsMatch[2]));
                if (dim > currentDimension) {
                  currentDimension = dim;
                  currentLink = item[key];
                }
              } else if (!isNaN(parseInt(key)) && parseInt(key) > currentDimension) { // Handle cases where key is just a number (e.g., "500")
                currentDimension = parseInt(key);
                currentLink = item[key];
              }
            }
          }
        }
      } else if (typeof item === 'string') {
        currentLink = item;
        // For string items, we can't determine dimension easily, so treat as fallback
        // and only use if no better option is found.
      }

      // Update best image if current one is better or equal (preferring later items in array)
      if (currentLink && currentDimension >= maxDimension) {
        maxDimension = currentDimension;
        bestImageUrl = currentLink;
      }
    }

    // Final fallback: if no best image was found by dimension, just return the last valid string URL
    // or the link/value from the last object in the array.
    if (!bestImageUrl && imageInput.length > 0) {
        const lastItem = imageInput[imageInput.length - 1];
        if (typeof lastItem === 'string' && lastItem !== '') {
            return lastItem;
        } else if (typeof lastItem === 'object' && lastItem !== null) {
            return lastItem.link || lastItem.url || Object.values(lastItem).find(val => typeof val === 'string') || '';
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