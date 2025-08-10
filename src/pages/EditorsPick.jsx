import React, { useEffect } from 'react';
import { Playlists } from '../components/List';
import { editorsPickPlaylists } from '../data/editorsPickPlaylists'; // Import the hardcoded data

const EditorsPick = () => {
  useEffect(() => {
    document.getElementById('site_title').innerText = 'Isai - Editors Pick';
  }, []);

  return (
    <div className="px-2 flex md:px-4 relative overflow-hidden min-h-[90vh]">
      <div className="min-w-full">
        <div className="w-full flex justify-between items-center mb-4">
          <h3 className="font-bold text-white text-xl">Editors' Picks</h3>
        </div>
        {editorsPickPlaylists.length > 0 ? (
          <Playlists playlists={editorsPickPlaylists} />
        ) : (
          <div className="mt-[-40px] flex flex-col items-center justify-center gap-4 h-[60vh]">
            <h3 className="text-gray-400 font-bold text-xl">No editor's pick playlists available yet.</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorsPick;