"use client";

import { useLayoutEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Routes, useSearchParams } from 'react-router-dom';
import {
  ArtistDetails,
  Discover,
  Search,
  SongDetails,
  TopCharts,
  AlbumDetails,
  Genres,
  Playlist,
  GenreDetails,
  PlaylistDetails,
  Favorites,
  Blacklist,
  EditorsPick,
  Radio,
  ArtistsList,
  LanguageSettings,
} from './pages';
import Details from './components/Details';
import { setPlayer } from './redux/features/playerSlice';
import { setLibrary } from './redux/features/librarySlice';
import Layout from './Layout';
import { Loader } from './components/LoadersAndError';
import Player from './components/MusicPlayer/Player';
import { next, onShuffle, stop } from './utils/player'; // Import onShuffle and stop
import { store } from './redux/store'; // Import store to access getState

const App = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const library = useSelector(state => state.library);
  const { activeSong, isPlaying, currentIndex, currentSongs, repeat } = useSelector((state) => state.player); // Get currentSongs and repeat state
  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false);

  // Player states lifted to App.jsx
  const [duration, setDuration] = useState(0);
  const [seekTime, setSeekTime] = useState(0);
  const [appTime, setAppTime] = useState(0);
  const [volume, setVolume] = useState(0.3);

  // Player handlers
  const onEnded = () => {
    if (repeat) {
      // If repeat is on, the nextSong reducer will handle looping to the start
      next(currentIndex + 1);
    } else if (currentIndex + 1 < currentSongs.length) {
      // If there's a next song in the current queue and repeat is off, play it
      next(currentIndex + 1);
    } else {
      // If no more songs in the current queue and repeat is off,
      // try to get more songs based on the active song's language or selected language
      const currentSongLanguage = activeSong?.language;
      const { selectedLanguage } = store.getState().settings; // Get selected language from settings

      console.log("onEnded: Current queue exhausted. Attempting smart next song.");
      console.log("onEnded: Active song language:", currentSongLanguage);
      console.log("onEnded: Global selected language:", selectedLanguage);

      if (currentSongLanguage) {
        // If the current song has a language, try to shuffle based on that language.
        // The onShuffle function will now use this language if it's passed, or fallback to global/default.
        // Note: onShuffle currently uses `selectedLanguage` from store.
        // To prioritize `currentSongLanguage`, we'd need to modify `onShuffle` to accept a preferred language.
        // For simplicity and to align with the current `onShuffle` implementation,
        // we'll let `onShuffle` decide the language based on `selectedLanguage` or its internal default.
        // The user's request is "same language song will playing", which implies a general preference.
        // So, using `selectedLanguage` (or its default) for the next set of songs is appropriate.
        dispatch(onShuffle(true)); // Pass true to indicate a song is playing, so it shuffles around the current active song
      } else if (selectedLanguage) {
        // If the current song has no language, but a global language is set, use that for shuffle.
        dispatch(onShuffle(true));
      } else {
        // If neither is available, stop playback.
        console.log("onEnded: No specific song language or global language set. Stopping playback.");
        dispatch(stop());
      }
    }
  };
  const onTimeUpdate = (event) => setAppTime(event.target.currentTime);
  const onLoadedData = (event) => setDuration(event.target.duration);

  useLayoutEffect(() => {
    const playerStorage = localStorage.getItem('player');
    if (playerStorage) dispatch(setPlayer(JSON.parse(playerStorage)));

    const libraryStorage = localStorage.getItem('library');
    if (libraryStorage) {
      const storedLibrary = JSON.parse(libraryStorage);
      dispatch(setLibrary(storedLibrary));
    } else {
      dispatch(setLibrary({
        playlists: [],
        editorsPick: [],
        favorites: { tracks: [], genres: [], artists: [], albums: [], radios: [] },
        blacklist: { tracks: [], genres: [], artists: [], albums: [], radios: [] },
      }));
    }
    setIsLibraryLoaded(true);
  }, []);

  if (!isLibraryLoaded) {
    return <Loader title="Loading application..." />;
  }

  // Create a single object to pass player-related props
  const playerProps = {
    activeSong,
    isPlaying,
    volume,
    seekTime,
    onEnded,
    onTimeUpdate,
    onLoadedData,
    duration,
    appTime,
    setSeekTime,
    setVolume,
    currentIndex,
  };

  return (
    <>
      {/* The single audio element, now always rendered */}
      <Player
        activeSong={playerProps.activeSong}
        volume={playerProps.volume}
        isPlaying={playerProps.isPlaying}
        seekTime={playerProps.seekTime}
        onEnded={playerProps.onEnded}
        onTimeUpdate={playerProps.onTimeUpdate}
        onLoadedData={playerProps.onLoadedData}
      />

      <Routes>
        <Route element={<Layout playerProps={playerProps} />}>
          <Route path="/charts" element={<TopCharts />} />
          <Route path="/*" element={<Discover />} />
          <Route element={<Details />}>
            <Route path="/artists/:id" element={<ArtistDetails />} />
            <Route path="/albums/:id" element={<AlbumDetails />} />
            <Route path="/songs/:songid" element={<SongDetails />} />
          </Route>
          <Route path="/search/:searchTerm" element={<Search />} />

          <Route path="/genres/" element={<Genres />} />
          <Route path="/genres/:id" element={<GenreDetails />} />
                    
          <Route path="/playlists/" element={<Playlist />} />
          <Route path="/playlists/:id" element={<PlaylistDetails />} />

          <Route path="/favorites" element={<Favorites />} />
          <Route path="/blacklist" element={<Blacklist />} />
          <Route path="/editors-pick" element={<EditorsPick />} />
          <Route path="/radio" element={<Radio />} />
          <Route path="/artists" element={<ArtistsList />} />
          <Route path="/language-settings" element={<LanguageSettings />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;