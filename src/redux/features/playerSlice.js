import { createSlice } from '@reduxjs/toolkit';
import shuffle from '../../utils/shuffle'
import { getSingleData, getData } from '../../utils/getData'; // Import getSingleData and getData
import { store } from '../store'; // Import store to get state

const initialState = {
  currentSongs: [],
  unshuffledSongs: [],
  currentIndex: 0,
  isActive: false,
  isPlaying: false,
  activeSong: {},
  shuffle: false,
  repeat: false,
  nowPlaying: false,
  bitrate: '3', // Default bitrate from Saavn's index.html (160kbps)
  shuffleLanguageIndex: 0, // New state for cycling through languages
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setActiveSong: (state, action) => {
      const library = store.getState().library; // Get library state here

      // Normalize the individual song
      const normalizedSong = getSingleData({ type: 'tracks', data: action.payload.song, library });

      // Normalize the entire tracks array
      const normalizedTracks = getData({ type: 'tracks', data: action.payload.tracks, library });

      state.currentSongs = state.unshuffledSongs = normalizedTracks;
      state.activeSong = normalizedSong;
      state.currentIndex = action.payload.i;
      state.isActive = true;
    },
    addToUpNext: (state, action) => {
      if(state.currentSongs.length < 1) {
        state.currentSongs = action.payload
        state.activeSong = action.payload[0]
        state.currentIndex = 0
        state.isActive = state.isPlaying = true
      } else {
        let songs = state.currentSongs;
        songs.splice(state.currentIndex + 1, 0, ...action.payload);
        state.currentSongs = songs
      }
    },

    stop: (state) => {
      state.activeSong = {} 
      state.isActive = state.isPlaying = false
    },

    nextSong: (state, action) => {
      if (state.currentSongs[action.payload]) {
        state.activeSong = state.currentSongs[action.payload];
        state.currentIndex = action.payload;
        state.isActive = state.isPlaying = true;
      }
      else if (state.repeat) {
        state.activeSong = state.currentSongs[0];
        state.currentIndex = 0
        state.isActive = state.isPlaying = true
      }
      else {
        state.activeSong = state.currentSongs[state.currentSongs.length - 1] 
        state.isPlaying = false
      }
    },

    prevSong: (state, action) => {
      if (state.currentSongs[action.payload]) {
        state.activeSong = state.currentSongs[action.payload]
        state.currentIndex = action.payload;
        state.isActive = state.isPlaying = true
      }
      else if (state.repeat) {
        state.activeSong = state.currentSongs.length - 1;
        state.currentIndex = state.currentSongs.length - 1
        state.isActive = state.isPlaying = true
      }
      else {
        state.activeSong = state.currentSongs[0] 
        state.isPlaying = false
      }
    },
    
    shuffleOn: (state, action) => {
      const currentSongs = [...state.currentSongs];
      const showActiveSong = action.payload;
      const activeSong = showActiveSong ? state.activeSong : null
      const { tracks, i, song } = shuffle(currentSongs, activeSong);
      state.shuffle = true;
      state.currentSongs = tracks;
      state.currentIndex = i;
      state.activeSong = song
    },

    shuffleOff: (state) => {
      state.shuffle = false
      state.currentSongs = state.unshuffledSongs
      state.currentIndex = state.unshuffledSongs.findIndex(song => song.id === state.activeSong.id);
    },

    setRepeat: (state) => {
      const repeat = state.repeat
      state.repeat = !repeat
    },

    playPause: (state, action) => {
      state.isPlaying = action.payload;
    },

    setAlbum: (state, action) => {
      let songs = [...state.currentSongs]
      songs = songs.map( song => song.album ? song : {...song, album: action.payload} )
      state.currentSongs = state.unshuffledSongs = songs
    },

    setSongIsrc: (state, action) => {
      state.songIsrc = action.payload
    },

    setNowPlaying: (state, action) => {
      state.nowPlaying = action.payload
    },
    setPlayer: (state, action) => {
      for(let [entry, value] of Object.entries(action.payload)) {
        if(entry == 'isPlaying' || entry == 'nowPlaying' || entry == 'isActive') {
          state[entry] = false
        } else {
          state[entry] = value
        }
      }
    },
    setBitrate: (state, action) => {
      state.bitrate = action.payload;
    },
    incrementShuffleLanguageIndex: (state) => { // New reducer
      state.shuffleLanguageIndex = (state.shuffleLanguageIndex + 1) % 3; // Cycle through 3 languages
    }
  },
});

export const { setActiveSong, addToUpNext, nextSong, prevSong, stop, shuffleOn, shuffleOff, setRepeat, playPause, selectGenreListId, setAlbum, setNowPlaying, setPlayer, setBitrate, incrementShuffleLanguageIndex } = playerSlice.actions;

export default playerSlice.reducer;