import { useEffect, useMemo, useReducer, useState } from 'react'

import { useNavigate, useSearchParams, Link } from 'react-router-dom';

import CreatePlaylist from '../components/CreatePlaylist';
import ImportForm from '../components/CreatePlaylist/ImportForm'; // Use the new ImportForm component

import { fetchSuggestedSongs } from '../utils/fetchData'
import { createNewPlaylist, playlistDispatch, playlistState } from '../utils/library'
import { useSelector } from 'react-redux';
import { Playlists } from '../components/List'; // Ensure Playlists is imported

const Playlist = () => {
  const genres = { data: [] }; // Mock empty genres data as Saavn API doesn't provide this directly
  const isFetching = false; // Set to false as we're not fetching
  const error = false; // Set to false as we're not fetching

  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [newPlaylist, setNewPlaylist] = useReducer(playlistDispatch, playlistState);
  const isInAddPage = useMemo(() => params.get('add') === 'true', [params]);
  const isImportPage = useMemo(() => params.get('import') === 'true', [params]);
  const [errorSavingPlaylist, setErrorSavingPlaylist] = useState(false);

  const { playlists: userPlaylists } = useSelector(state => state.library); 

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const { playlistInfo } = newPlaylist;
      const newPlaylistId = await createNewPlaylist(playlistInfo); // Get the ID of the new playlist
      setNewPlaylist({ type: 'RESET' });
      navigate(`/playlists/${newPlaylistId}?edit=true`); // Redirect to the new playlist's edit page
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
  }, [])

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
    <div className="px-2 flex md:px-4 relative overflow-hidden min-h-[90vh]">
      {isInAddPage ? (
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
      ) : isImportPage ? (
        <ImportForm // Use the new ImportForm component here
          handleSubmit={handleSubmit}
          playlistInfo={newPlaylist.playlistInfo}
          setNewPlaylist={setNewPlaylist}
          errorSavingPlaylist={errorSavingPlaylist}
        />
      ) : (
        <div className="min-w-full">
          <div className="w-full flex justify-between items-center mb-4">
            <h3 className="font-bold text-white text-xl">Your Playlists</h3>
            <Link to="/playlists?add=true" className="flex items-center justify-center font-bold text-xs md:text-sm border border-white/5 px-4 h-8 md:h-10 rounded-full hover:bg-gray-400 text-black bg-gray-200">
              Create New
            </Link>
          </div>
          {userPlaylists.length > 0 ? (
            <Playlists playlists={userPlaylists} />
          ) : (
            <div className="mt-[-40px] flex flex-col items-center justify-center gap-4 h-[30vh]">
              <h3 className="text-gray-400 font-bold text-xl">You don't have any saved playlists.</h3>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Playlist;