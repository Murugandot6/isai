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
import { setLibrary } from './redux/features/librarySlice';
import Layout from './Layout';

import { recordVisitor } from './utils/db';
import { supabase } from './integrations/supabase/client'; // Import Supabase client

const App = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    recordVisitor(searchParams);

    // Fetch player state from local storage (still used for player settings)
    const playerStorage = localStorage.getItem('player');
    if (playerStorage) dispatch(setPlayer(JSON.parse(playerStorage)));

    // Fetch library data (playlists and editor's picks) from Supabase
    const fetchLibraryFromSupabase = async () => {
      try {
        const { data: playlistsData, error: playlistsError } = await supabase
          .from('playlists')
          .select('*')
          .eq('type', 'user'); // Fetch user-created playlists

        const { data: editorsPickData, error: editorsPickError } = await supabase
          .from('playlists')
          .select('*')
          .eq('type', 'editors_pick'); // Fetch editor's pick playlists

        if (playlistsError) throw playlistsError;
        if (editorsPickError) throw editorsPickError;

        dispatch(setLibrary({
          playlists: playlistsData || [],
          editorsPick: editorsPickData || [],
          // Favorites and Blacklist are still managed in local storage for now
          favorites: JSON.parse(localStorage.getItem('library_favorites') || '{}'),
          blacklist: JSON.parse(localStorage.getItem('library_blacklist') || '{}'),
        }));
      } catch (error) {
        console.error("Error fetching library from Supabase:", error);
        // Fallback to local storage for favorites/blacklist if Supabase fails
        dispatch(setLibrary({
          playlists: [],
          editorsPick: [],
          favorites: JSON.parse(localStorage.getItem('library_favorites') || '{}'),
          blacklist: JSON.parse(localStorage.getItem('library_blacklist') || '{}'),
        }));
      }
    };

    fetchLibraryFromSupabase();
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