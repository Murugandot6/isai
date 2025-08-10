import React, { useEffect } from 'react';
import { Playlists } from '../components/List';
import { editorsPickPlaylists } => '../data/editorsPickPlaylists'; // Import the hardcoded data
import { Link } from 'react-router-dom'; // Import Link
import { useSelector } from 'react-redux'; // Import useSelector

const EditorsPick = () => {
  const { playlists: userPlaylists } = useSelector(state => state.library); // Get user's playlists

  useEffect(() => {
    document.getElementById('site_title').innerText = 'Isai - Editors Pick';
  }, []);

  return (
    <div className="px-2 flex md:px-4 relative overflow-hidden min-h-[90vh]">
      <div className="min-w-full">
        {/* Your Playlists section - now named "Editors' Pick" */}
        <div className="w-full flex justify-between items-center mb-4">
          <h3 className="font-bold text-white text-xl">Editors' Pick</h3> {/* This is the main heading */}
          <Link to="/playlists?add=true" className="flex items-center justify-center font-bold text-xs md:text-sm border border-white/5 px-4 h-8 md:h-10 rounded-full hover:bg-gray-400 text-black bg-gray-200">
            Create New
          </Link>
        </div>
        {userPlaylists.length > 0 ? (
          <Playlists playlists={userPlaylists} />
        ) : (
          <div className="mt-[-40px] flex flex-col items-center justify-center gap-4 h-[30vh]">
            <h3 className="text-gray-400 font-bold text-xl">You don't have any saved playlists.</h3>
            <Link to="/playlists?add=true" className="flex items-center justify-center font-bold text-xs md:text-sm border border-white/5 px-6 h-8 md:h-10 rounded-full bg-gray-200 hover:bg-gray-400 text-black">Create New</Link>
          </div>
        )}

        {/* Editors' Picks section (now the second section) - removed duplicate heading */}
        <div className="w-full flex justify-between items-center mb-4 mt-8">
          {/* Removed: <h3 className="font-bold text-white text-xl">Editors' Picks</h3> */}
          <Link to="/playlists?import=true" className="flex items-center justify-center font-bold text-xs md:text-sm border border-white/5 px-4 h-8 md:h-10 rounded-full hover:bg-gray-400 text-black bg-gray-200">
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
      </div>
    </div>
  );
};

export default EditorsPick;