import { useEffect, useMemo, useReducer, useState } from 'react'

import { useNavigate, useSearchParams } from 'react-router-dom';

import CreatePlaylist from '../components/CreatePlaylist';
import ImportPlaylist from '../components/CreatePlaylist/ImportPlaylist';

import { fetchSuggestedSongs } from '../utils/fetchData'
import { createNewPlaylist, playlistDispatch, playlistState } from '../utils/library'
import PlaylistsFront from '../components/PlaylistsFront'

const Playlist = () => {
  const genres = { data: [] }; // Mock empty genres data as Saavn API doesn't provide this directly
  const isFetching = false; // Set to false as we're not fetching
  const error = false; // Set to false as we're not fetching

  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [newPlaylist, setNewPlaylist] = useReducer(playlistDispatch, playlistState);
  const isInAddPage = useMemo(() => params.get('add') === 'true', [params]);
  const isImportPage = useMemo(() => params.get('import') === 'true', [params]); // New state for import page
  const [errorSavingPlaylist, setErrorSavingPlaylist] = useState(false);

  // Determine if the default playlists front should be shown
  const showPlaylistsFront = useMemo(() => !isInAddPage && !isImportPage, [isInAddPage, isImportPage]);

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const { playlistInfo } = newPlaylist;
      await createNewPlaylist(playlistInfo);
      setNewPlaylist({ type: 'RESET' });
      navigate('/playlists');
    } catch (error) {
      setErrorSavingPlaylist(true);
    }
  }

  const handleChange = (e) => {
    setNewPlaylist({ type: 'HANDLECHANGE', id: e.target.id, payload: e.target.value });
    setErrorSavingPlaylist(false);
  }

  useEffect(() => { 
    setNewPlaylist({ type: 'SETGENRES', payload: genres.data });
  }, []) // Changed dependency array to empty to run only once on mount

  useEffect(() => {
    if (newPlaylist.genreAction === 'remove') {
      const id = newPlaylist.genreAction.id
      setNewPlaylist({ type: 'REMOVESUGGESTEDSONG', payload: id })
    }
    if (newPlaylist.genreAction === 'add') {
      const id = newPlaylist.genreAction.id;
      const suggestedSongsIds = newPlaylist.suggestedSongs.map(song => song.id);
      fetchSuggestedSongs({ id, setNewPlaylist, suggestedSongsIds })
        .then(songs => setNewPlaylist({ type: 'ADDSUGGESTEDSONG', payload: songs }))
        .catch((error) => console.error(error));
    }
  }, [newPlaylist.genreAction])

  useEffect(() => {
    const text = `Isai - ${isInAddPage ? 'Create New Playlist' : isImportPage ? 'Import Playlist' : 'Playlists'}`
    document.getElementById('site_title').innerText = text
  }, [params])

  return (
    <div className="px-2 flex md:px-4 relative overflow-hidden">
      <PlaylistsFront isVisible={showPlaylistsFront} />
      <CreatePlaylist
        handleSubmit={handleSubmit}
        isInAddPage={isInAddPage}
        playlistInfo={newPlaylist.playlistInfo}
        setNewPlaylist={setNewPlaylist}
        handleChange={handleChange}
        genres={genres}
        isFetching={isFetching}
        error={error}
        genreNum={newPlaylist.genreNum}
        suggestedSongs={newPlaylist.suggestedSongs}
        errorSavingPlaylist={errorSavingPlaylist}
      />
      <ImportPlaylist
        handleSubmit={handleSubmit}
        playlistInfo={newPlaylist.playlistInfo}
        setNewPlaylist={setNewPlaylist}
        errorSavingPlaylist={errorSavingPlaylist}
        isImportPage={isImportPage}
      />
    </div>
  )
}

export default Playlist