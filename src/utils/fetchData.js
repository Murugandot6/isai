import { playSongs, pause } from './player.js'
import { getData, getSingleData } from './getData.js'
import { store } from '../redux/store';
import { saavnApi } from '../redux/services/saavnApi.js';

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
        const cleanedTitle = title.replace(/[^a-zA-Z0-9\s]/g, '');
        const cleanedArtist = artist.split(',')[0].replace(/[^a-zA-Z0-9\s]/g, ''); 
        const query = `${cleanedTitle} ${cleanedArtist}`;
        
        const { data: searchResults } = await store.dispatch(saavnApi.endpoints.searchSongs.initiate(query));

        if (searchResults?.data?.results?.length > 0) {
            const bestMatch = searchResults.data.results.find(song => 
                song.name?.toLowerCase() === title?.toLowerCase() && 
                song.primaryArtists?.toLowerCase().includes(artist?.toLowerCase())
            );
            
            if (bestMatch) {
                const { library } = store.getState();
                return getSingleData({ type: 'tracks', data: bestMatch, favorites: library.favorites, blacklist: library.blacklist });
            } else {
                const { library } = store.getState();
                return getSingleData({ type: 'tracks', data: searchResults.data.results[0], favorites: library.favorites, blacklist: library.blacklist });
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
            return getData({ type: 'tracks', data: searchResults.data.results });
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

        // Normalize data
        const normalizedArtist = getSingleData({ type: 'artists', data: artist });
        const topSongs = getData({ type: 'tracks', data: artist.topSongs }); // Get topSongs directly
        const topAlbums = getData({ type: 'albums', data: artist.topAlbums }); // Get topAlbums directly

        return {
            artist: normalizedArtist,
            topSongs: topSongs,
            albums: topAlbums, // Renamed from topAlbums to albums for consistency with component props
        };

    } catch (error) {
        console.error(`Error fetching data for artist "${artistName}":`, error);
        return null;
    }
};