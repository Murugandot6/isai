import { useLayoutEffect } from 'react';
import { useDispatch } from 'react-redux';
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
} from './pages';
import ArtistsList from './pages/ArtistsList'; // Import the new ArtistsList component
import Details from './components/Details';
import { setPlayer } from './redux/features/playerSlice';
import { setLibrary } from './redux/features/librarySlice';
import Layout from './Layout';

// import { recordVisitor } from './utils/db'; // Removed import
// import { importAllPlaylistsFromCsv } from './utils/bulkPlaylistImport'; // Commented out to prevent 404 errors

const App = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    // recordVisitor(searchParams); // Removed call to record visitor

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

    // importAllPlaylistsFromCsv(); // Commented out: Please ensure CSV files are in the public directory if you enable this.
  }, []);

  return (
    <Routes>
      <Route element={<Layout />}>
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
        <Route path="/artists" element={<ArtistsList />} /> {/* New Artists List route */}
      </Route>
    </Routes>
  );
};

export default App;