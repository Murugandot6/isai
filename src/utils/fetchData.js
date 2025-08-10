"use client";

import { playSongs, pause } from './player.js';
import { store } from '../redux/store';
import { saavnApi } from '../redux/services/saavnApi.js';

// --- Start of logic moved from getData.js ---

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
    case 'tracks':
      return {
        id: item.id,
        title: item.name || item.title,
        subtitle: item.primaryArtists || item.artists?.primary?.[0]?.name,
        image: getImageUrl(item.image),
        streamUrl: getStreamUrl(item.downloadUrl),
        duration: item.duration,
        language: item.language,
        album: item.album?.name,
        downloadUrl: item.downloadUrl,
        allImages: item.image, // Keep original for other uses if needed
      };
    case 'albums':
      return {
        id: item.id,
        title: item.name || item.title,
        subtitle: item.artists?.[0]?.name || item.primaryArtists || '',
        image: getImageUrl(item.image),
        year: item.year,
      };
    case 'artists': // Add explicit handling for artists
      return {
        id: item.id,
        name: item.name,
        image: getImageUrl(item.image), // Normalize image here
        type: item.type,
        followerCount: item.followerCount,
        allImages: item.image, // Keep original for other uses if needed
      };
    default:
      return item;
  }
};

// Processes an entire array of data.
export const getData = ({ type, data, library }) => {
  if (!data || !Array.isArray(data)) return [];

  const addFlags = (item) => {
    if (!library || !item) return item;
    const newItem = { ...item };
    const libraryType = type === 'songs' ? 'tracks' : type;
    newItem.favorite = library.favorites[libraryType]?.some(fav => fav.id === item.id);
    newItem.blacklist = library.blacklist[libraryType]?.some(bl => bl.id === item.id);
    return newItem;
  };

  return data
    .map(item => getSingleData(item, type))
    .map(addFlags)
    .filter(Boolean);
};

// --- End of logic moved from getData.js ---


export const fetchSongs = async (album) => {
    pause();
    try {
        const { data: result } = await store.dispatch(saavnApi.endpoints.searchSongs.initiate(album.name));
        if(!result || result.data.results.length === 0) throw 'No songs found for this album';
        
        const tracks = result.data.results.slice(0, 20);
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