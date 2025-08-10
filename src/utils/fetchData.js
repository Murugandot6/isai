import { playSongs, pause } from './player.js'
import { getData, getSingleData } from './getData.js' // Import getSingleData
import { store } from '../redux/store';
import { saavnApi } from '../redux/services/saavnApi.js';

export const fetchSongs = async (album) => {
    pause();
    try {
        // Saavn API doesn't have a direct album tracks endpoint like Deezer.
        // We'll simulate by searching for the album name and taking the first few results.
        // This is a simplification due to API differences.
        const { data: result } = await store.dispatch(saavnApi.endpoints.searchSongs.initiate(album.name));
        if(!result || result.data.results.length === 0) throw 'No songs found for this album';
        
        const tracks = result.data.results.slice(0, 20); // Take first 20 songs as album tracks
        const song = tracks[0];
        const i = 0;
        playSongs({ song, tracks, i, album });
    } catch (error) {
        console.log(error);
        // Optionally display a toast message here
    }
}

export const fetchSuggestedSongs = ({ id, suggestedSongsIds }) => new Promise(
    async function(resolve, reject) {
        try {
            // Saavn API doesn't have charts by ID directly.
            // We'll simulate by searching for a generic term or a popular artist.
            // For now, let's use a generic search for 'top songs' or similar.
            const { data: result } = await store.dispatch(saavnApi.endpoints.searchSongs.initiate('top songs'));
            if (!result || result.data.results.length === 0) throw 'error occured';
            
            const res = getData({ type: 'tracks', data: result.data.results });
            const data = res.filter(song => !suggestedSongsIds.includes(song.id));
            resolve(data);
        } catch (error) {
            reject(error);
        }
    }
)

export const searchSongByTitleAndArtist = async (title, artist) => {
    try {
        // Simplify the query to just title and primary artist, remove problematic characters
        const cleanedTitle = title.replace(/[^a-zA-Z0-9\s]/g, '');
        // Take only the first artist from the comma-separated list and clean it
        const cleanedArtist = artist.split(',')[0].replace(/[^a-zA-Z0-9\s]/g, ''); 
        const query = `${cleanedTitle} ${cleanedArtist}`;
        
        const { data: searchResults } = await store.dispatch(saavnApi.endpoints.searchSongs.initiate(query));

        if (searchResults?.data?.results?.length > 0) {
            // Find the best match by checking if artist name is present in primaryArtists
            const bestMatch = searchResults.data.results.find(song => 
                song.name?.toLowerCase() === title?.toLowerCase() && 
                song.primaryArtists?.toLowerCase().includes(artist?.toLowerCase())
            );
            
            if (bestMatch) {
                // Normalize the data using getSingleData
                const { library } = store.getState();
                return getSingleData({ type: 'tracks', data: bestMatch, favorites: library.favorites, blacklist: library.blacklist });
            } else {
                // If no exact match, return the first result and normalize it
                const { library } = store.getState();
                return getSingleData({ type: 'tracks', data: searchResults.data.results[0], favorites: library.favorites, blacklist: library.blacklist });
            }
        }
        return null;
    } catch (error) {
        console.error("Error searching song by title and artist:", error);
        // Do not re-throw, just return null or handle gracefully
        return null;
    }
};

export const fetchTrendingSongsByLanguage = async (language) => {
    try {
        const query = `trending ${language} songs`;
        const { data: searchResults } = await store.dispatch(saavnApi.endpoints.searchSongs.initiate(query));
        if (searchResults?.data?.results?.length > 0) {
            return getData({ type: 'tracks', data: searchResults.data.results });
        }
        return [];
    } catch (error) {
        console.error(`Error fetching trending ${language} songs:`, error);
        return [];
    }
};