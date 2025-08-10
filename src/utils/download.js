"use client";

import { displayMessage } from './prompt';
import axios from 'axios'; // Import axios

export const downloadSong = async (song) => { // Made async
  if (!song || !song.downloadUrl || song.downloadUrl.length === 0) {
    displayMessage("No download link available for this song.");
    return;
  }

  // Find the highest quality download link from the original array
  const highestQualityLink = song.downloadUrl.reduce((prev, current) => {
    const prevQuality = parseInt(prev.quality);
    const currentQuality = parseInt(current.quality);
    return (currentQuality > prevQuality) ? current : prev;
  }, song.downloadUrl[0]);

  if (highestQualityLink && highestQualityLink.link) {
    try {
      displayMessage(`Preparing to download ${song.name || song.title}...`);
      const response = await axios.get(highestQualityLink.link, {
        responseType: 'blob', // Important: request as a blob
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${song.name || song.title}.mp3`); // Suggest .mp3 extension
      document.body.appendChild(link);
      link.click();
      link.remove(); // Clean up the element
      window.URL.revokeObjectURL(url); // Clean up the object URL

      displayMessage(`Downloading ${song.name || song.title}...`);
    } catch (error) {
      console.error("Error during song download:", error);
      displayMessage(`Failed to download ${song.name || song.title}. Please try again.`);
    }
  } else {
    displayMessage("No valid download link found.");
  }
};

export const downloadPlaylistSongs = (playlist) => {
  if (!playlist || !playlist.tracks || playlist.tracks.length === 0) {
    displayMessage("This playlist has no songs to download.");
    return;
  }

  displayMessage(`Initiating download for ${playlist.tracks.length} song${playlist.tracks.length === 1 ? '' : 's'} from "${playlist.name}"...`);

  // Loop through each song and initiate download
  playlist.tracks.forEach((song, index) => {
    // Add a small delay to avoid browser blocking multiple downloads immediately
    setTimeout(() => {
      downloadSong(song);
    }, index * 500); // 500ms delay between each download
  });
};