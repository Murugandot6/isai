import { useLayoutEffect, useState } from 'react'; // Import useState
import { useDispatch, useSelector } from 'react-redux'; // Import useSelector
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
import ArtistsList from './pages/ArtistsList';
import Details from './components/Details';
import { setPlayer } from './redux/features/playerSlice';
import { setLibrary } from './redux/features/librarySlice';
import Layout from './Layout';
import { Loader } from './components/LoadersAndError'; // Import Loader component

const App = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const library = useSelector(state => state.library); // Get library state
  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false); // New state for library loading

  useLayoutEffect(() => {
    const playerStorage = localStorage.getItem('player');
    if (playerStorage) dispatch(setPlayer(JSON.parse(playerStorage)));

    const libraryStorage = localStorage.getItem('library');
    if (libraryStorage) {
      const storedLibrary = JSON.parse(libraryStorage);
      dispatch(setLibrary(storedLibrary));
    } else {
      // Initialize with a complete structure to prevent undefined errors
      dispatch(setLibrary({
        playlists: [],
        editorsPick: [],
        favorites: { tracks: [], genres: [], artists: [], albums: [], radios: [] },
        blacklist: { tracks: [], genres: [], artists: [], albums: [], radios: [] },
      }));
    }
    setIsLibraryLoaded(true); // Mark library as loaded after dispatching initial state
  }, []);

  // Render a loader if library is not yet loaded
  if (!isLibraryLoaded) {
    return <Loader title="Loading application..." />;
  }

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
        <Route path="/artists" element={<ArtistsList />} />
      </Route>
    </Routes>
  );
};

export default App;