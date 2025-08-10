import { useLayoutEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Route, Routes, useSearchParams } from 'react-router-dom';
import {
  ArtistDetails, // Will be a placeholder
  Discover,
  Search,
  SongDetails,
  TopCharts, // Will be a placeholder
  AlbumDetails, // Will be a placeholder
  Genres, // Will be a placeholder
  Playlist,
  GenreDetails, // Will be a placeholder
  PlaylistDetails,
  Favorites,
  Blacklist,
  EditorsPick, // New import
  Radio,
} from './pages';
import Details from './components/Details';
import { setPlayer } from './redux/features/playerSlice';
import { setLibrary, setEditorsPickPlaylists } from './redux/features/librarySlice'; // Import setEditorsPickPlaylists
import Layout from './Layout';

import { recordVisitor } from './utils/db';
import hardcodedEditorsPickPlaylists from './data/editorsPickPlaylists'; // Import hardcoded playlists

const App = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    recordVisitor(searchParams);

    // Fetch player state from local storage (still used for player settings)
    const playerStorage = localStorage.getItem('player');
    if (playerStorage) dispatch(setPlayer(JSON.parse(playerStorage)));

    // Fetch library data (playlists, editorsPick, favorites, blacklist) from local storage
    const libraryStorage = localStorage.getItem('library');
    if (libraryStorage) {
      const storedLibrary = JSON.parse(libraryStorage);
      // Ensure editorsPick is always overwritten by hardcoded values on app load
      dispatch(setLibrary({
        ...storedLibrary,
        editorsPick: hardcodedEditorsPickPlaylists, // Always use hardcoded for editorsPick
      }));
    } else {
      // Initialize with empty state and hardcoded editorsPick if nothing in local storage
      dispatch(setLibrary({
        playlists: [],
        editorsPick: hardcodedEditorsPickPlaylists, // Use hardcoded for editorsPick
        favorites: { tracks: [], genres: [], artists: [], albums: [], radios: [] },
        blacklist: { tracks: [], genres: [], artists: [], albums: [], radios: [] },
      }));
    }
  }, []);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/charts" element={<TopCharts />} /> {/* Placeholder */}
        <Route path="/*" element={<Discover />} />
        <Route element={<Details />}>
          <Route path="/artists/:id" element={<ArtistDetails />} /> {/* Placeholder */}
          <Route path="/albums/:id" element={<AlbumDetails />} /> {/* Placeholder */}
          <Route path="/songs/:songid" element={<SongDetails />} />
        </Route>
        <Route path="/search/:searchTerm" element={<Search />} />

        <Route path="/genres/" element={<Genres />} /> {/* Placeholder */}
        <Route path="/genres/:id" element={<GenreDetails />} /> {/* Placeholder */}
                  
        <Route path="/playlists/" element={<Playlist />} />
        <Route path="/playlists/:id" element={<PlaylistDetails />} />

        <Route path="/favorites" element={<Favorites />} />
        <Route path="/blacklist" element={<Blacklist />} />
        <Route path="/editors-pick" element={<EditorsPick />} /> {/* New route */}
        <Route path="/radio" element={<Radio />} />
      </Route>
    </Routes>
  );
};

export default App;