// A "pure" utility file. It does not import the Redux store.

// Safely gets the highest-quality URL from an image array.
const getImageUrl = (imageArray) => {
  if (!Array.isArray(imageArray) || imageArray.length === 0) return '';
  // Use the last item in the array, which is typically the highest quality.
  return imageArray[imageArray.length - 1]?.link || '';
};

// Safely gets the highest-quality playable audio URL from a downloadUrl array.
const getStreamUrl = (urlArray) => {
  if (!Array.isArray(urlArray) || urlArray.length === 0) return '';
  // Find the highest quality link (last in the array) that is a playable format.
  const supportedLink = urlArray.slice().reverse().find(q => q.link && (q.link.includes('.mp4') || q.link.includes('.m4a')));
  return supportedLink?.link || '';
};

// Normalizes a single item (song, album, etc.) into a consistent format.
export const getSingleData = (item, type) => {
  if (!item) return null;

  switch (type) {
    case 'tracks': // Use a consistent type name
      return {
        id: item.id,
        title: item.name || item.title,
        subtitle: item.primaryArtists || item.artists?.primary?.[0]?.name,
        image: getImageUrl(item.image),
        streamUrl: getStreamUrl(item.downloadUrl), // Create the simple streamUrl for the player
        duration: item.duration,
        language: item.language,
        album: item.album?.name,
        // Keep the original arrays if needed elsewhere
        downloadUrl: item.downloadUrl,
        allImages: item.image,
      };

    case 'albums':
      return {
        id: item.id,
        title: item.name || item.title,
        subtitle: item.artists?.[0]?.name || item.primaryArtists || '',
        image: getImageUrl(item.image),
        year: item.year,
      };
      
    default:
      // Return the item as is if the type is not recognized
      return item;
  }
};

// Processes an entire array of data.
export const getData = ({ type, data, library }) => {
  if (!data || !Array.isArray(data)) return [];

  // This function now correctly handles adding favorite/blacklist flags.
  const addFlags = (item) => {
    if (!library || !item) return item;
    const newItem = { ...item };
    const libraryType = type === 'songs' ? 'tracks' : type;
    newItem.favorite = library.favorites[libraryType]?.some(fav => fav.id === item.id);
    newItem.blacklist = library.blacklist[libraryType]?.some(bl => bl.id === item.id);
    return newItem;
  };

  return data
    .map(item => getSingleData(item, type)) // 1. Normalize the data structure
    .map(addFlags) // 2. Add favorite/blacklist flags
    .filter(Boolean); // 3. Remove any null items that failed processing
};