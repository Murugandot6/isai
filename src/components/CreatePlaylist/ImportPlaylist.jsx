"use client";

import React, { useState } from 'react';
import Papa from 'papaparse';
import { Loader, Error } from '../../components/LoadersAndError';
import { searchSongByTitleAndArtist } from '../../utils/fetchData';
import { displayMessage } from '../../utils/prompt';
import { MdPlaylistAdd } from 'react-icons/md';
import Header from './Header'; // Import the Header component

const ImportPlaylist = ({ setNewPlaylist, playlistInfo, handleSubmit, errorSavingPlaylist, isImportPage }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [importError, setImportError] = useState(null);
  const [processedSongsCount, setProcessedSongsCount] = useState(0);
  const [totalSongsToProcess, setTotalSongsToProcess] = useState(0);

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
                if (foundSong && !playlistInfo.tracks.some(t => t.id === foundSong.id)) {
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
            setNewPlaylist({ type: 'ADDSONG', payload: newTracks });
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
    <form onSubmit={handleSubmit} className={`min-w-full min-h-[90vh] transition-[transform,opacity] duration-300 ease-in-out absolute top-0 left-0 ${isImportPage ? 'translate-x-0 opacity-100' : 'translate-x-[100%] opacity-0 pointer-events-none'} px-3`}>
      <Header /> {/* Now using the shared Header component */}

      <div className="flex flex-col md:flex-row items-start md:items-end gap-4 mb-6">
        <div className="aspect-square rounded-[10px] w-[150px] bg-white/5 flex items-center justify-center">
          {
            playlistInfo.tracks.length > 0 ?
              <img
                src={playlistInfo.tracks[playlistInfo.tracks.length - 1].image?.[1]?.link || playlistInfo.tracks[playlistInfo.tracks.length - 1].image?.[0]?.link}
                className="h-full w-full block rounded-[10px]"
                alt="Playlist cover"
              /> :
              <span className="text-gray-400 text-sm">No songs yet</span>
          }
        </div>
        <div className="flex-1 flex flex-row flex-wrap gap-4 justify-between items-end">
          <input
            type="text"
            id="name"
            value={playlistInfo.name}
            onChange={(e) => setNewPlaylist({ type: 'HANDLECHANGE', id: e.target.id, payload: e.target.value })}
            className={`md:max-w-[400px] w-full ${errorSavingPlaylist ? 'bg-red-600/10 border-red-600/50 placeholder:text-red-300' : 'bg-white/5 focus:bg-transparent border-transparent focus:border-white/20 text-white placeholder:text-gray-400'} border h-[40px] md:h-[50px] rounded-[20px] px-4 outline-none transition-colors`}
            placeholder="Playlist title"
          />
          <button type="submit" className="flex w-fit truncate items-center justify-center gap-[3px] bg-gray-200 text-black text-xs md:text-sm border border-white/5 h-[30px] md:h-[40px] rounded-[20px] px-2 md:px-3 transition-[background-color] hover:bg-white/5 hover:text-gray-200">
            <MdPlaylistAdd size={25} />
            <span>Create Playlist</span>
          </button>
        </div>
      </div>

      <div className="mb-6">
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

      {playlistInfo.tracks.length > 0 && (
        <div className="animate-popin flex-1 flex flex-col gap-6 rounded-[20px] mt-4 max-h-[85vh]">
          <h2 className="text-gray-200 font-bold p-1">Songs to be added ({playlistInfo.tracks.length})</h2>
          <ul className="h-[300px] flex flex-1 flex-col overflow-y-scroll overflow-x-clip border border-white/5 rounded-[15px] bg-black/50">
            {
              playlistInfo.tracks.map((song, i) =>
                <li key={i} className="relative flex flex-row gap-2 items-center p-2 border-b border-white/5 last:border-transparent">
                  <img src={song.image?.[0]?.link} className="min-w-[50px] aspect-square rounded-md bg-white/50" alt={song.name} />
                  <div className="flex flex-col">
                    <p className="text-white text-sm truncate">{song.name}</p>
                    <p className="text-gray-400 text-xs">{song.primaryArtists}</p>
                  </div>
                  <button type="button" onClick={() => setNewPlaylist({ type: 'REMOVESONG', payload: song })} className="absolute right-0 top-0 h-full w-[80px] bg-red-600 text-white text-sm flex items-center justify-center">Remove</button>
                </li>
              )
            }
          </ul>
        </div>
      )}
    </form>
  );
};

export default ImportPlaylist;