"use client";

import Papa from 'papaparse';
import { searchSongByTitleAndArtist } from './fetchData';
import { createNewPlaylist } from './library';
import { displayMessage } from './prompt';

// List of CSV file paths to import. You can add more paths here.
const CSV_FILE_PATHS = [
  'playlist/liked_songs.csv',
  'playlist/english_vibes_songs.csv',
  'playlist/just_listen_bro.csv',
  'playlist/oru_packet_ilaiyaraja.csv',
  'playlist/sad_melodies_tamil.csv',
];

export const importAllPlaylistsFromCsv = async () => {
  displayMessage('Starting bulk import of playlists...');
  let playlistsCreatedCount = 0;

  for (const filePath of CSV_FILE_PATHS) {
    try {
      const response = await fetch(`/${filePath}`); // Assuming files are served from root
      if (!response.ok) {
        throw new Error(`Failed to fetch ${filePath}: ${response.statusText}`);
      }
      const csvText = await response.text();

      const playlistName = filePath
        .split('/')
        .pop()
        .replace('.csv', '')
        .replace(/_/g, ' ') // Replace underscores with spaces
        .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize first letter of each word

      let songsFromCsv = [];
      await new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            songsFromCsv = results.data;
            resolve();
          },
          error: (err) => {
            reject(new Error(`Failed to parse CSV ${filePath}: ${err.message}`));
          }
        });
      });

      const newTracks = [];
      let songsAddedToCurrentPlaylist = 0;

      for (const songData of songsFromCsv) {
        const trackName = songData['Track Name'] || songData['track_name'];
        const artistName = songData['Artist Name(s)'] || songData['artist_name(s)'] || songData['Artist'];

        if (trackName && artistName) {
          try {
            const foundSong = await searchSongByTitleAndArtist(trackName, artistName);
            if (foundSong) {
              newTracks.push(foundSong);
              songsAddedToCurrentPlaylist++;
            }
          } catch (error) {
            console.error(`Error searching for ${trackName} by ${artistName} from ${filePath}:`, error);
          }
        }
      }

      if (newTracks.length > 0) {
        const playlistInfo = {
          name: playlistName,
          genres: [], // You might want to add logic to infer genres
          tracks: newTracks,
        };
        await createNewPlaylist(playlistInfo);
        displayMessage(`Playlist "${playlistName}" created with ${songsAddedToCurrentPlaylist} songs.`);
        playlistsCreatedCount++;
      } else {
        displayMessage(`No songs found to create playlist "${playlistName}".`);
      }

    } catch (error) {
      console.error(`Error importing playlist from ${filePath}:`, error);
      displayMessage(`Failed to import playlist from ${filePath}.`);
    }
  }

  if (playlistsCreatedCount > 0) {
    displayMessage(`Successfully imported ${playlistsCreatedCount} playlists!`);
  } else {
    displayMessage('No new playlists were imported.');
  }
};