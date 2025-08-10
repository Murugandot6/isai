"use client";

import { playSongs, pause } from './player.js';
import { store } from '../redux/store';
import { saavnApi } from '../redux/services/saavnApi.js';
import { songImage as defaultSongImage, albumImage as defaultAlbumImage, artistImage as defaultArtistImage, radioImage as defaultRadioImage } from '../assets/images';


// --- Start of logic moved from getData.js ---

/**
 * Safely gets the highest quality URL from a Saavn API array (image or downloadUrl).
 * @param {Array} arr - The array of quality/url objects.
 * @param {string} defaultImg - A default image URL to use if no valid URL is found.
 * @returns {string} The URL string or the default image if not found.
 */
const getImageUrl = (imageArray, defaultImg = '') => {
  if (!Array.isArray(imageArray) || imageArray.length === 0) {
    return defaultImg;
  }
  // The last item in the array is often the highest quality.
  // The key is sometimes 'url' and sometimes 'link'. We check for both.
  const bestUrl = imageArray[imageArray.length - 1]?.link || imageArray[imageArray.length - 1]?.url;
  return bestUrl || defaultImg;
};

// Safely gets the highest-quality playable audio URL from a downloadUrl array.
const getStreamUrl = (urlArray) => {
  if (!Array.isArray(urlArray) || urlArray.length === 0) return '';
  // Find the highest quality link (last in the array) that is a playable format.
  const supportedLink = urlArray.slice().reverse().find(q => q.link && (q.link.includes('.mp4') || q.link.includes('.m4a') || q.link.includes('.mp3')));
  return supportedLink?.link || '';
};

/**
 * Normalizes a single item (song, album, etc.) into a consistent flat structure.
 * @param {object} item - The raw item object.
 * @param {string} type - The type of item ('tracks', 'albums', 'artists', 'radios').
 * @returns {object} A clean item object with normalized properties.
 */
export const getSingleData = (item, type) => {
  if (!item || !item.id) return null; // Return null if the item is invalid or lacks an ID

  const base = {
    id: item.id,
    name: item.name || item.title, // Use 'name' as primary, fallback to 'title'
    type: item.type,
    favorite: item.favorite, // These flags will be added by getData
    blacklist: item.blacklist, // These flags will be added by getData
  };

  switch (type) {
    case 'tracks':
      return {
        ...base,
        title: item.name || item.title,
        subtitle: item.primaryArtists || item.artists?.primary?.[0]?.name,
        image: getImageUrl(item.image, defaultSongImage),
        streamUrl: getStreamUrl(item.downloadUrl),
        duration: item.duration,
        language: item.language,
        album: {
          id: item.album?.id,
          name: item.album?.name,
          image: getImageUrl(item.album?.image, defaultAlbumImage),
        },
        artist: {
          id: item.artistMap?.artists?.[0]?.id || item.primaryArtists, // Use primaryArtists as fallback for artist ID
          name: item.primaryArtists || item.artistMap?.artists?.[0]?.name,
          image: getImageUrl(item.artistMap?.artists?.[0]?.image, defaultArtistImage),
        },
        downloadUrl: item.downloadUrl,
        explicitContent: item.explicitContent,
      };
    case 'albums':
      return {
        ...base,
        title: item.name || item.title,
        image: getImageUrl(item.image, defaultAlbumImage),
        year: item.year,
        songCount: item.songCount,
        artist: {
          id: item.artistMap?.artists?.[0]?.id || item.primaryArtists,
          name: item.primaryArtists || item.artistMap?.artists?.[0]?.name,
          image: getImageUrl(item.artistMap?.artists?.[0]?.image, defaultArtistImage),
        },
      };
    case 'artists':
      return {
        ...base,
        name: item.name,
        image: getImageUrl(item.image, defaultArtistImage),
        followerCount: item.followerCount,
      };
    case 'genres':
      return {
        ...base,
        name: item.name,
        image: getImageUrl(item.image, defaultAlbumImage), // Using album default for genres
      };
    case 'radios':
      return {
        ...base,
        name: item.name,
        image: getImageUrl(item.favicon || item.image, defaultRadioImage), // RadioBrowser uses favicon, Saavn uses image
        country: item.country,
        language: item.language,
        url_resolved: item.url_resolved,
      };
    default:
      return item;
  }
};

/**
 * Processes an entire array of data, normalizing each item and adding favorite/blacklist flags.
 * @param {object} options - Options object.
 * @param {string} options.type - The type of items in the array ('tracks', 'albums', 'artists', 'genres', 'radios').
 * @param {Array} options.data - The raw array of items.
 * @param {object} options.library - The Redux library state (favorites, blacklist).
 * @param {boolean} [options.noFilter=false] - If true, skips blacklist filtering.
 * @param {string} [options.sortType=''] - Type of sorting ('popular', 'recent').
 * @param {string} [options.albumFilter=''] - Filter for album record type (e.g., 'EP', 'Single').
 * @returns {Array} An array of normalized and flagged items.
 */
export const getData = ({ type, data, library, noFilter = false, sortType = '', albumFilter = '' }) => {
  if (!data || !Array.isArray(data)) return [];

  const addFlags = (item) => {
    if (!library || !item) return item;
    const newItem = { ...item };
    const libraryType = type === 'songs' ? 'tracks' : type; // 'songs' maps to 'tracks' in library
    newItem.favorite = library.favorites[libraryType]?.some(fav => fav.id === item.id);
    newItem.blacklist = library.blacklist[libraryType]?.some(bl => bl.id === item.id);
    return newItem;
  };

  const sortData = (a, b) => {
    if (sortType === 'popular') {
      return (b.playCount || 0) - (a.playCount || 0); // Assuming playCount for popularity
    } else if (sortType === 'recent') {
      return (b.year || 0) - (a.year || 0); // Assuming year for recency
    }
    return 0;
  };

  const filterData = (item) => {
    const isNotBlacklisted = noFilter || !item.blacklist;
    const matchesAlbumFilter = albumFilter ? new RegExp(albumFilter, 'i').test(item.record_type || '') : true;
    return isNotBlacklisted && matchesAlbumFilter;
  };

  return data
    .map(item => getSingleData(item, type))
    .filter(Boolean) // Remove any nulls from normalization
    .map(addFlags)
    .filter(filterData)
    .sort(sortData);
};

// --- End of logic moved from getData.js ---


export const fetchSongs = async (album) => {
    pause();
    try {
        const { data: result } = await store.dispatch(saavnApi.endpoints.searchSongs.initiate(album.name));
        if(!result || result.data.results.length === 0) throw 'No songs found for this album';
        
        const library = store.getState().library;
        const tracks = getData({ type: 'tracks', data: result.data.results, library });
        const song = tracks[0];
        const i = 0;
        playSongs({ song, tracks, i, album });
    } catch (error) {
        console.log(error);
    }
}

export const fetchSuggestedSongs = ({ id, suggestedSongsIds }) => new Promise(
    async function(resolve, reject) {
        try {
            const { data: result } = await store.dispatch(saavnApi.endpoints.searchSongs.initiate('top songs'));
            if (!result || result.data.results.length === 0) throw 'error occured';
            
            const library = store.getState().library;
            const res = getData({ type: 'tracks', data: result.data.results, library });
            const data = res.filter(song => !suggestedSongsIds.includes(song.id));
            resolve(data);
        } catch (error) {
            reject(error);
        }
    }
)

export const searchSongByTitleAndArtist = async (title, artist) => {
    try {
        const cleanedTitle = title.replace(/[^a-zA-Z0-9\s]/g, '');
        const cleanedArtist = artist.split(',')[0].replace(/[^a-zA-Z0-9\s]/g, ''); 
        const query = `${cleanedTitle} ${cleanedArtist}`;
        
        const { data: searchResults } = await store.dispatch(saavnApi.endpoints.searchSongs.initiate(query));

        if (searchResults?.data?.results?.length > 0) {
            const bestMatch = searchResults.data.results.find(song => 
                song.name?.toLowerCase() === title?.toLowerCase() && 
                song.primaryArtists?.toLowerCase().includes(artist?.toLowerCase())
            );
            
            const library = store.getState().library;
            if (bestMatch) {
                return getSingleData(bestMatch, 'tracks');
            } else {
                return getSingleData(searchResults.data.results[0], 'tracks');
            }
        }
        return null;
    } catch (error) {
        console.error("Error searching song by title and artist:", error);
        return null;
    }
};

export const fetchTrendingSongsByLanguage = async (language) => {
    try {
        const query = `trending ${language} songs`;
        const { data: searchResults } = await store.dispatch(saavnApi.endpoints.searchSongs.initiate(query));
        if (searchResults?.data?.results?.length > 0) {
            const library = store.getState().library;
            return getData({ type: 'tracks', data: searchResults.data.results, library });
        }
        return [];
    } catch (error) {
        console.error(`Error fetching trending ${language} songs:`, error);
        return [];
    }
};

export const fetchArtistDetailsAndContent = async (artistName) => {
    try {
        // Step 1: Search for the artist to get their ID
        const { data: searchArtistsResult } = await store.dispatch(saavnApi.endpoints.searchArtists.initiate(artistName));
        const artistId = searchArtistsResult?.data?.results?.[0]?.id;

        if (!artistId) {
            console.warn(`Artist "${artistName}" not found in search results.`);
            return null;
        }

        // Step 2: Get artist details, which now includes topSongs and topAlbums
        const { data: artistDetailsResult } = await store.dispatch(saavnApi.endpoints.getArtistDetails.initiate({ id: artistId }));
        const artist = artistDetailsResult?.data;

        if (!artist) {
            console.warn(`Details for artist "${artistName}" (ID: ${artistId}) could not be fetched.`);
            return null;
        }

        const library = store.getState().library;

        // Normalize data
        const normalizedArtist = getSingleData(artist, 'artists');
        const topSongs = getData({ type: 'tracks', data: artist.topSongs, library });
        const topAlbums = getData({ type: 'albums', data: artist.topAlbums, library });

        return {
            artist: normalizedArtist,
            topSongs: topSongs,
            albums: topAlbums,
        };

    } catch (error) {
        console.error(`Error fetching data for artist "${artistName}":`, error);
        return null;
    }
};