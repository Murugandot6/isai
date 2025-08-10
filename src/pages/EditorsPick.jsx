import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { Playlists } from '../components/List';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import editorsPickPlaylists from '../data/editorsPickPlaylists'; // Import the hardcoded playlists
import ImportPlaylist from '../components/CreatePlaylist/ImportPlaylist'; // Import the ImportPlaylist component
import { playlistDispatch, playlistState, createNewPlaylist } from '../utils/library'; // Import playlist utilities

const EditorsPick = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [newPlaylist, setNewPlaylist] = useReducer(playlistDispatch, playlistState);
  const isImportPage = useMemo(() => params.get('import') === 'true', [params]);
  const [errorSavingPlaylist, setErrorSavingPlaylist] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { playlistInfo } = newPlaylist;
      const newPlaylistId = await createNewPlaylist(playlistInfo);
      setNewPlaylist({ type: 'RESET' });
      navigate(`/playlists/${newPlaylistId}?edit=true`); // Redirect to the new playlist's edit page
    } catch (error) {
      setErrorSavingPlaylist(true);
    }
  };

  const handleChange = (e) => {
    setNewPlaylist({ type: 'HANDLECHANGE', id: e.target.id, payload: e.target.value });
    setErrorSavingPlaylist(false);
  };

  useEffect(() => {
    document.getElementById('site_title').innerText = `Isai - ${isImportPage ? 'Import Playlist' : 'Editors Pick'}`;
  }, [isImportPage]);

  return (
    <div className="px-2 flex md:px-4 relative">
      <div className="min-w-full">
        {isImportPage ? (
          <ImportPlaylist
            handleSubmit={handleSubmit}
            playlistInfo={newPlaylist.playlistInfo}
            setNewPlaylist={setNewPlaylist}
            errorSavingPlaylist={errorSavingPlaylist}
            isImportPage={isImportPage}
          />
        ) : (
          <>
            {/* Editors' Pick Playlists Section */}
            <div className="w-full flex justify-between items-center mb-4">
              <h3 className="font-bold text-white text-xl">Editors' Pick Playlists</h3>
              <Link 
                to="/editors-pick?import=true" 
                className="flex items-center justify-center font-bold text-xs md:text-sm border border-white/5 px-4 h-8 md:h-10 rounded-full hover:bg-gray-400 text-black bg-gray-200"
              >
                Import Playlist
              </Link>
            </div>
            {editorsPickPlaylists.length > 0 ? (
              <Playlists playlists={editorsPickPlaylists} />
            ) : (
              <div className="mt-[-40px] flex flex-col items-center justify-center gap-4 h-[30vh]">
                <h3 className="text-gray-400 font-bold text-xl">No editor's pick playlists available yet.</h3>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EditorsPick;