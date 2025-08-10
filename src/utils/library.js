import { deletePlaylist, removeSongsFromPlaylist, addToFavorites, deleteFromFavorites, addToBlacklist, deleteFromBlacklist, createPlaylist, editPlaylist, setLibraryStorage } from "../redux/features/librarySlice";
import { hidePrompt } from "../redux/features/promptSlice";
import { displayMessage } from "./prompt";
import { store } from '../redux/store';

export const createNewPlaylist = async (data, playlistType = 'user') => { // Added playlistType parameter
  try {
    if (!data?.name) {
      displayMessage('Couldn\'t create playlist! Playlist name is required.');
      throw new Error('Playlist name is required.');
    }

    const playlistId = Date.now().toString(); // Use a string ID
    const newPlaylistData = { ...data, id: playlistId, type: playlistType }; // Use the provided type

    store.dispatch(createPlaylist(newPlaylistData)); // Update Redux state
    store.dispatch(setLibraryStorage()); // Save to local storage
    displayMessage('Playlist created!');
    return playlistId; // Resolve with the new playlist's ID
  } catch (error) {
    console.error("Error creating playlist:", error);
    displayMessage('Couldn\'t create playlist!');
    throw error; // Re-throw to be caught by the calling component
  }
};

export const editCurrentPlaylist = async (values) => {
  try {
    store.dispatch(editPlaylist(values));
    store.dispatch(setLibraryStorage()); // Save to local storage
    store.dispatch(hidePrompt());
    displayMessage('Playlist edited!');
  } catch (error) {
    console.error("Error editing playlist:", error);
    displayMessage('Couldn\'t edit playlist!');
  }
};

export const removeFromPlaylist = async (data) => {
  try {
    // Get current state to find the playlist and its tracks
    const { playlists } = store.getState().library;
    const playlistIndex = playlists.findIndex(p => p.id === data.playlistid);

    if (playlistIndex === -1) {
      throw new Error('Playlist not found.');
    }

    const currentPlaylist = playlists[playlistIndex];
    const updatedTracks = currentPlaylist.tracks.filter(
      (track) => !data.tracks.map((elem) => elem.id).includes(track.id)
    );

    // Dispatch an edit action with the updated tracks
    store.dispatch(editPlaylist({ ...currentPlaylist, tracks: updatedTracks }));
    store.dispatch(setLibraryStorage()); // Save to local storage
    store.dispatch(hidePrompt());
    displayMessage('Songs Removed');
  } catch (error) {
    console.error("Error removing songs from playlist:", error);
    displayMessage('Couldn\'t remove songs from playlist!');
  }
};

export const deletePlaylists = async (playlists) => {
  try {
    for(let playlist of playlists) {
      store.dispatch(deletePlaylist(playlist.id));
    }
    store.dispatch(setLibraryStorage()); // Save to local storage
    store.dispatch(hidePrompt());
    displayMessage('Playlist deleted.');
  } catch (error) {
    console.error("Error deleting playlist:", error);
    displayMessage('Couldn\'t delete playlist!');
  }
};

export const addFavorites = (type, value) => {
  store.dispatch(addToFavorites({ type, value }));
  // Favorites are still managed in local storage for now
  store.dispatch(setLibraryStorage());
};

export const removeFavorites = (type, id) => {
  store.dispatch(deleteFromFavorites({ type, id }));
  // Favorites are still managed in local storage for now
  store.dispatch(setLibraryStorage());
};

export const addBlacklist = (type, value) => {
  store.dispatch(addToBlacklist({ type, value }));
  store.dispatch(hidePrompt());
  // Blacklist is still managed in local storage for now
  store.dispatch(setLibraryStorage());
};

export const removeBlacklist = (type, id) => {
  store.dispatch(deleteFromBlacklist({ type, id }));
  // Blacklist is still managed in local storage for now
  store.dispatch(setLibraryStorage());
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