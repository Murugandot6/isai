import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { Playlists } from '../components/List';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
// Removed direct import of editorsPickPlaylists from data/editorsPickPlaylists
import ImportForm from '../components/CreatePlaylist/ImportForm';
import { playlistDispatch, playlistState, createNewPlaylist } from '../utils/library';
// Removed importAllPlaylistsFromCsv
import { Loader, Error } from '../components/LoadersAndError';

const EditorsPick = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [newPlaylist, setNewPlaylist] = useReducer(playlistDispatch, playlistState);
  const [showImportForm, setShowImportForm] = useState(false);
  const [errorSavingPlaylist, setErrorSavingPlaylist] = useState(false);

  // Get editorsPick playlists from Redux state
  const editorsPickPlaylists = useSelector(state => state.library.editorsPick);

  // Removed isBulkImporting and bulkImportReport state

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { playlistInfo } = newPlaylist;
      // Pass 'editors_pick' as the playlist type for single CSV imports on this page
      const newPlaylistId = await createNewPlaylist(playlistInfo, 'editors_pick'); 
      setNewPlaylist({ type: 'RESET' });
      setShowImportForm(false);
      navigate(`/playlists/${newPlaylistId}?edit=true`);
    } catch (error) {
      setErrorSavingPlaylist(true);
    }
  };

  const handleChange = (e) => {
    setNewPlaylist({ type: 'HANDLECHANGE', id: e.target.id, payload: e.target.value });
    setErrorSavingPlaylist(false);
  };

  // Removed handleBulkImport function

  useEffect(() => {
    document.getElementById('site_title').innerText = 'Isai - Editors Pick';
  }, []);

  return (
    <div className="px-2 flex md:px-4 relative">
      <div className="min-w-full">
        <div className="w-full flex justify-between items-center mb-4">
          <h3 className="font-bold text-white text-xl">Editors' Pick Playlists</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowImportForm(prev => !prev)}
              className="flex items-center justify-center font-bold text-xs md:text-sm border border-white/5 px-4 h-8 md:h-10 rounded-full hover:bg-gray-400 text-black bg-gray-200"
            >
              {showImportForm ? 'Hide Import Form' : 'Import Single CSV'}
            </button>
          </div>
        </div>
        
        {/* Removed isBulkImporting and bulkImportReport display */}

        {showImportForm && (
          <div className="mb-8">
            <ImportForm
              handleSubmit={handleSubmit}
              playlistInfo={newPlaylist.playlistInfo}
              setNewPlaylist={setNewPlaylist}
              errorSavingPlaylist={errorSavingPlaylist}
            />
          </div>
        )}

        {editorsPickPlaylists.length > 0 ? (
          <Playlists playlists={editorsPickPlaylists} />
        ) : (
          <div className="mt-[-40px] flex flex-col items-center justify-center gap-4 h-[30vh]">
            <h3 className="text-gray-400 font-bold text-xl">No editor's pick playlists available yet.</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorsPick;