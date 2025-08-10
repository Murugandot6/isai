import { AiOutlineDelete } from "react-icons/ai"
import React, { useState } from 'react';
import Papa from 'papaparse';
import { Loader, Error } from '../../LoadersAndError';
import { searchSongByTitleAndArtist } from '../../../utils/fetchData';
import { displayMessage } from '../../../utils/prompt';

const EditPlaylistDetails = ({ editData, playlist, handleChange, songsToBeDeleted, handleEdit, setParams, params, handleDelete }) => { // Receive params here
  const [isLoading, setIsLoading] = useState(false);
  const [importError, setImportError] = useState(null);
  const [processedSongsCount, setProcessedSongsCount] = useState(0);
  const [totalSongsToProcess, setTotalSongsToProcess] = useState(0);

  const isImportMode = params.get('import') === 'true'; // Use params.get here

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImportError(null);
      setIsLoading(true);
      setProcessedSongsCount(0);
      setTotalSongsToProcess(0);

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const songsFromCsv = results.data;
          setTotalSongsToProcess(songsFromCsv.length);
          const newTracks = [];
          let songsAdded = 0;

          for (const songData of songsFromCsv) {
            const trackName = songData['Track Name'] || songData['track_name'];
            const artistName = songData['Artist Name(s)'] || songData['artist_name(s)'] || songData['Artist'];

            if (trackName && artistName) {
              try {
                const foundSong = await searchSongByTitleAndArtist(trackName, artistName);
                // Prevent duplicates by checking against current editData.tracks
                if (foundSong && !editData.tracks.some(t => t.id === foundSong.id)) {
                  newTracks.push(foundSong);
                  songsAdded++;
                }
              } catch (error) {
                console.error(`Error searching for ${trackName} by ${artistName}:`, error);
              }
            }
            setProcessedSongsCount(prev => prev + 1);
          }

          if (newTracks.length > 0) {
            // Update the editData with new unique tracks
            handleChange({ target: { id: 'tracks', value: [...editData.tracks, ...newTracks] } });
            displayMessage(`${songsAdded} song${songsAdded === 1 ? '' : 's'} added from CSV!`);
          } else {
            displayMessage("No new songs could be added from the CSV.");
          }
          setIsLoading(false);
        },
        error: (err) => {
          setImportError("Failed to parse CSV file. Please ensure it's a valid CSV.");
          setIsLoading(false);
          console.error("CSV parsing error:", err);
        }
      });
    }
  };

  return (
    <div className="relative z-[1] flex-col flex-1">
      <input
        className="px-2 md:px-4 h-[40px] md:h-[50px] rounded-[25px] text-white text-base bg-white/10 focus:outline-none block w-fit placeholder:text-gray-400"
        value={editData.name}
        placeholder={playlist.name}
        onChange={handleChange}
        type="text"
      />
      <p className="text-gray-400 text-base mt-2 mb-5 px-2 md:px-4">
        {songsToBeDeleted.length} song{songsToBeDeleted.length === 1 ? '' : 's'} selected
      </p>

      <div className="flex flex-row gap-4 flex-wrap justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={handleEdit} className="px-3 md:px-4 h-[34px] md:h-[44px] rounded-[15px] font-bold transition-colors bg-gray-300 hover:bg-white border border-gray-300 hover:border-gray-100 text-black">Done</button>
          <button onClick={() => setParams({})} className="px-3 md:px-4 h-[34px] md:h-[44px] rounded-[15px] font-bold bg-white/5 hover:bg-white/10 border border-white/5 hover:text-white text-gray-300">Cancel</button>
        </div>
        {
          songsToBeDeleted.length > 0 &&
          <button onClick={handleDelete} className="flex items-center justify-center bg-black/80 text-red-500 h-[40px] w-[40px] rounded-[10px]">
            <AiOutlineDelete size={25} />
          </button>
        }
      </div>

      {isImportMode && (
        <div className="mt-6">
          <label htmlFor="csv-upload" className="block text-gray-300 text-sm font-bold mb-2">
            Upload Spotify Exported CSV
          </label>
          <input
            type="file"
            id="csv-upload"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-gray-200 file:text-black
              hover:file:bg-gray-300"
          />
          {isLoading && (
            <div className="mt-4">
              <Loader title={`Processing songs... (${processedSongsCount}/${totalSongsToProcess})`} />
            </div>
          )}
          {importError && <Error title={importError} />}
        </div>
      )}
    </div>
  )
}

export default EditPlaylistDetails