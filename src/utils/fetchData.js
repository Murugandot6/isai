"use client";

import { playSongs, pause } from './player.js';
import { store } from '../redux/store';
import { saavnApi } from '../redux/services/saavnApi.js';
import { getImageUrl, getAudioStreamUrl } from './playerUtils.js'; // Import the new utility functions

// Normalizes a single item (song, album, etc.) into a consistent format.
export const getSingleData = (item, type) => {
  if (!item) return null;

  switch (type) {
    case 'tracks':
      return {
        id: item.id,
        title: item.name || item.title || item.song, // Added item.song as fallback for title
        subtitle: item.primaryArtists || item.artists?.primary?.[0]?.name || item.artist, // Added item.artist as fallback for subtitle
        image: getImageUrl(item.image || item.album?.image || item.artist?.image), // Added fallbacks for image
        streamUrl: getAudioStreamUrl(item.downloadUrl),
        duration: item.duration,
        language: item.language,
        album: { // Ensure album is an object with name and id
          id: item.album?.id,
          name: item.album?.name || item.album?.title,
        },
        artist: { // Ensure artist is an object with name and id
          id: item.artist?.id || item.artists?.primary?.[0]?.id,
          name: item.primaryArtists || item.artist?.name || item.artists?.primary?.[0]?.name,
        },
        downloadUrl: item.downloadUrl,
        allImages: item.image, // Keep original for other uses if needed
        explicitContent: item.explicitContent, // Keep explicit content flag
      };
    case 'albums':
      return {
        id: item.id,
        name: item.name || item.title, // Ensure 'name' property is present
        title: item.name || item.title, // Keep 'title' for consistency if other components use it
        primaryArtists: item.primaryArtists || item.artists?.[0]?.name, // Ensure primaryArtists is present
        image: getImageUrl(item.image), // Use getImageUrl
        year: item.year,
        songCount: item.songCount, // Add songCount if available
        duration: item.duration, // Add duration if available
        type: item.type, // Add type if available
      };
    case 'artists': // Add explicit handling for artists
      return {
        id: item.id,
        name: item.name,
        image: getImageUrl(item.image), // Use getImageUrl
        type: item.type,
        followerCount: item.followerCount,
        allImages: item.image, // Keep original for other uses if needed
      };
    case 'radios': // Add explicit handling for radios
      return {
        id: item.stationuuid, // Use stationuuid as ID for radios
        name: item.name,
        title: item.name,
        image: getImageUrl([{ link: item.favicon }]), // Favicon is usually the image
        country: item.country,
        language: item.language,
        streamUrl: item.url_resolved, // *** ADDED THIS LINE ***
        type: 'radio', // Explicitly set type
      };
    default:
      return item;
  }
};

// Processes an entire array of data.
export const getData = ({ type, data, library, selectedLanguage }) => {
  if (!data || !Array.isArray(data)) return [];

  const addFlags = (item) => {
    if (!library || !item) return item;
    const newItem = { ...item };
    const libraryType = type === 'songs' ? 'tracks' : type;
    newItem.favorite = library.favorites[libraryType]?.some(fav => fav.id === item.id);
    newItem.blacklist = library.blacklist[libraryType]?.some(bl => bl.id === item.id);
    return newItem;
  };

  let processedData = data
    .map(item => getSingleData(item, type))
    .filter(Boolean);

  // Apply language filter ONLY if the type is 'tracks' AND a specific language is selected
  if (selectedLanguage && selectedLanguage !== "" && type === 'tracks') {
    processedData = processedData.filter(item => 
      item.language?.toLowerCase() === selectedLanguage.toLowerCase()
    );
  }

  return processedData.map(addFlags);
};

export const fetchSongs = async (album) => {
    pause();
    try {
        const { data: result } = await store.dispatch(saavnApi.endpoints.searchSongs.initiate(album.name));
        if(!result || result.data.results.length === 0) throw 'No songs found for this album';
        
        const tracks = result.data.results; // Removed .slice(0, 20)
        const song = tracks[0];
        const i = 0;
        playSongs({ song, tracks, i, album });
    } catch (error) {
        // console.log(error); // Removed debug log
    }
}

export const fetchSuggestedSongs = ({ id, suggestedSongsIds }) => new Promise(
    async function(resolve, reject) {
        try {
            const { data: result } = await store.dispatch(saavnApi.endpoints.searchSongs.initiate('top songs'));
            if (!result || result.data.results.length === 0) throw 'error occured';
            
            const library = store.getState().library;
            const { selectedLanguage } = store.getState().settings; // Get selected language
            const res = getData({ type: 'tracks', data: result.data.results, library, selectedLanguage }); // Pass selected language
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
            const { selectedLanguage } = store.getState().settings; // Get selected language
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
            const { selectedLanguage } = store.getState().settings; // Get selected language
            return getData({ type: 'tracks', data: searchResults.data.results, library, selectedLanguage }); // Pass selected language
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
        const { selectedLanguage } = store.getState().settings; // Get selected language

        // Normalize data
        const normalizedArtist = getSingleData(artist, 'artists');
        const topSongs = getData({ type: 'tracks', data: artist.topSongs, library, selectedLanguage }); // Pass selected language
        const topAlbums = getData({ type: 'albums', data: artist.topAlbums, library, selectedLanguage }); // Pass selected language

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