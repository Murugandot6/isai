import { playSongs, pause } from './player.js'
import { getData } from './getData.js'
import { store } from '../redux/store.js';
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