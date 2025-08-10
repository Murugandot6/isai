import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  favorites: {
    tracks: [],
    genres: [],
    artists: [],
    albums: [],
    radios: []
  },
  blacklist: {
    tracks: [],
    genres: [],
    artists: [],
    albums: [],
    radios: []
  },
  playlists: [],
  editorsPick: [], // New: Dedicated array for editor's pick playlists
};

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    addToFavorites: (state, action) => {
      const blacklistType = state.blacklist[action.payload.type]
      const favoritesType = state.favorites[action.payload.type]

      if(!favoritesType) return;

      if(!favoritesType.map(elem => elem.id).includes(action.payload.value.id)) {
        favoritesType.push(action.payload.value)
        state.favorites[action.payload.type] = favoritesType

        state.blacklist[action.payload.type] = blacklistType.filter( elem => elem.id !== action.payload.value.id )
      }
    },

    deleteFromFavorites: (state, action) => {
      const favoritesType = state.favorites[action.payload.type]
      const favoritesTypeNew = favoritesType.filter( elem => elem.id !== action.payload.id )
      state.favorites[action.payload.type] = favoritesTypeNew
    },

    addToBlacklist: (state, action) => {
      const blacklistType = state.blacklist[action.payload.type]
      const favoritesType = state.favorites[action.payload.type]
      
      if(!blacklistType) return;

      if(!blacklistType.map(elem => elem.id).includes(action.payload.value.id)) {
        blacklistType.push(action.payload.value)
        state.blacklist[action.payload.type] = blacklistType

        state.favorites[action.payload.type] = favoritesType.filter( elem => elem.id !== action.payload.value.id )
      }
    },

    deleteFromBlacklist: (state, action) => {
      const blacklistType = state.blacklist[action.payload.type]
      const blacklistTypeNew = blacklistType.filter( elem => elem.id !== action.payload.id )
      state.blacklist[action.payload.type] = blacklistTypeNew
    },

    createPlaylist: (state, action) => {
      const playlists = state.playlists
      playlists.push(action.payload)
      state.playlists = playlists
    },

    removeSongsFromPlaylist: (state, action) => {
      const playlists = state.playlists
      const index = playlists.findIndex(elem => elem.id == action.payload.playlistid)
      const oldTracks = playlists[index].tracks
      const newTracks = oldTracks.filter( track => !action.payload.tracks.map( elem => elem.id ).includes( track.id ) )
      playlists[index].tracks = newTracks
      state.playlists = [...playlists]
    },

    editPlaylist: (state, action) => {
      const playlists = state.playlists
      const index = playlists.findIndex( elem => elem.id === action.payload.id )
      playlists[index] = action.payload
      state.playlists = playlists
    },

    deletePlaylist: (state, action) => {
      const playlists = state.playlists
      const newPlaylists = playlists.filter( elem => elem.id !== action.payload )
      state.playlists = newPlaylists
    },

    setEditorsPickPlaylists: (state, action) => { // New reducer
      state.editorsPick = action.payload;
    },

    // setLibraryStorage is removed as data will now be persisted in Supabase
    // setLibraryStorage: (state) => {
    //   localStorage.setItem('library', JSON.stringify({...state}))
    // },

    setLibrary: (state, action) => {
      // This action will now be used to populate the state from Supabase
      // It expects an object with 'playlists' and 'editorsPick' arrays
      state.playlists = action.payload.playlists || [];
      state.editorsPick = action.payload.editorsPick || [];
      // Favorites and Blacklist will still be managed in local storage for now
      // or could be moved to Supabase profiles table if user auth is implemented
    }
  },
});

export const { addToFavorites, deleteFromFavorites, addToBlacklist, deleteFromBlacklist, createPlaylist, editPlaylist, removeSongsFromPlaylist, deletePlaylist, setLibrary, setEditorsPickPlaylists } = librarySlice.actions;

export default librarySlice.reducer;