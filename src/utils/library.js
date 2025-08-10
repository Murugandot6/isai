import { deletePlaylist, removeSongsFromPlaylist, addToFavorites, deleteFromFavorites, addToBlacklist, deleteFromBlacklist, createPlaylist, editPlaylist } from "../redux/features/librarySlice";
import { hidePrompt } from "../redux/features/promptSlice";
import { displayMessage } from "./prompt";
import { store } from '../redux/store';
import { supabase } from '../integrations/supabase/client'; // Import Supabase client

export const createNewPlaylist = async (data) => {
  try {
    if (!data?.name) {
      displayMessage('Couldn\'t create playlist! Playlist name is required.');
      throw new Error('Playlist name is required.');
    }

    const playlistId = Date.now().toString(); // Use a string ID for Supabase
    const newPlaylistData = { ...data, id: playlistId, type: 'user' }; // Mark as user playlist

    const { data: supabaseData, error } = await supabase
      .from('playlists')
      .insert([newPlaylistData])
      .select();

    if (error) {
      throw error;
    }

    store.dispatch(createPlaylist(newPlaylistData)); // Update Redux state
    displayMessage('Playlist created!');
    return playlistId; // Resolve with the new playlist's ID
  } catch (error) {
    console.error("Error creating playlist in Supabase:", error);
    displayMessage('Couldn\'t create playlist!');
    throw error; // Re-throw to be caught by the calling component
  }
};

export const editCurrentPlaylist = async (values) => {
  try {
    const { id, ...updateData } = values;
    const { error } = await supabase
      .from('playlists')
      .update(updateData)
      .eq('id', id);

    if (error) {
      throw error;
    }

    store.dispatch(editPlaylist(values));
    store.dispatch(hidePrompt());
    displayMessage('Playlist edited!');
  } catch (error) {
    console.error("Error editing playlist in Supabase:", error);
    displayMessage('Couldn\'t edit playlist!');
  }
};

export const removeFromPlaylist = async (data) => {
  try {
    // Fetch the current playlist from Supabase to get its tracks
    const { data: currentPlaylist, error: fetchError } = await supabase
      .from('playlists')
      .select('tracks')
      .eq('id', data.playlistid)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    const updatedTracks = currentPlaylist.tracks.filter(
      (track) => !data.tracks.map((elem) => elem.id).includes(track.id)
    );

    const { error: updateError } = await supabase
      .from('playlists')
      .update({ tracks: updatedTracks })
      .eq('id', data.playlistid);

    if (updateError) {
      throw updateError;
    }

    store.dispatch(removeSongsFromPlaylist(data));
    store.dispatch(hidePrompt());
    displayMessage('Songs Removed');
  } catch (error) {
    console.error("Error removing songs from playlist in Supabase:", error);
    displayMessage('Couldn\'t remove songs from playlist!');
  }
};

export const deletePlaylists = async (playlists) => {
  try {
    const idsToDelete = playlists.map(p => p.id);
    const { error } = await supabase
      .from('playlists')
      .delete()
      .in('id', idsToDelete);

    if (error) {
      throw error;
    }

    for(let playlist of playlists) {
      store.dispatch(deletePlaylist(playlist.id));
    }
    store.dispatch(hidePrompt());
    displayMessage('Playlist deleted.');
  } catch (error) {
    console.error("Error deleting playlist from Supabase:", error);
    displayMessage('Couldn\'t delete playlist!');
  }
};

export const addFavorites = (type, value) => {
  store.dispatch(addToFavorites({ type, value }));
  // Favorites are still managed in local storage for now
};

export const removeFavorites = (type, id) => {
  store.dispatch(deleteFromFavorites({ type, id }));
  // Favorites are still managed in local storage for now
};

export const addBlacklist = (type, value) => {
  store.dispatch(addToBlacklist({ type, value }));
  store.dispatch(hidePrompt());
  // Blacklist is still managed in local storage for now
};

export const removeBlacklist = (type, id) => {
  store.dispatch(deleteFromBlacklist({ type, id }));
  // Blacklist is still managed in local storage for now
};

export const playlistState = {
  genreNum: 5,
  playlistInfo: { id: '', name: '', img: '', genres: [], tracks: [] },
  suggestedSongs: [], genreAction: { action: '', id: null }
};
  
const dispatchActions = {
  moregenres: ({ state }) => ({ ...state, genreNum: null }),
  lessgenres: ({ state }) => ({ ...state, genreNum: 5 }),
  handlechange: ({ state, action }) => ({ ...state, playlistInfo: { ...state.playlistInfo, [action.id]: action.payload } }),
  reset: () => playlistState,
  setgenres: ({ state, action }) => ({ ...state, genres: action.payload }),
  addgenre: ({ state, action }) => ({
    ...state,
    genreAction: 'add', id: action.payload.id,
    playlistInfo: { ...state.playlistInfo, genres: [...state.playlistInfo.genres, action.payload] }
  }),
  removegenre: ({ state, action }) => ({
    ...state,
    genreAction: { action: 'remove', id: action.payload.id },
    playlistInfo: {
      ...state.playlistInfo,
      genres: state.playlistInfo.genres.filter(elem => elem.id !== action.payload)
    }
  }),
  addsong: ({ state, action }) => {
    const currentTracks = state.playlistInfo.tracks;
    const songsToAdd = Array.isArray(action.payload) ? action.payload : [action.payload];
    
    const newUniqueTracks = songsToAdd.filter(
      (newSong) => !currentTracks.some((existingSong) => existingSong.id === newSong.id)
    );

    return {
      ...state,
      playlistInfo: { 
        ...state.playlistInfo, 
        tracks: [...currentTracks, ...newUniqueTracks]
      }
    };
  },
  removesong: ({ state, action }) => ({
    ...state,
    playlistInfo: {
      ...state.playlistInfo,
      tracks: state.playlistInfo.tracks.filter(track => track.id !== action.payload.id)
    }
  }),
  addsuggestedsong: ({ state, action }) => ({ ...state, suggestedSongs: [...state.suggestedSongs, ...action.payload] }),
  removesuggestedsong: ({ state, action }) => ({ ...state, suggestedSongs: state.suggestedSongs.filter(song => song.genreid !== action.payload) }),
};

export const playlistDispatch = (state, action) => {
  const actionType = action.type.toLowerCase();
  const dispatchAction = dispatchActions[actionType]
  if (!dispatchAction) return state;
  return dispatchAction({ state, action });
}