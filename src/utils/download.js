"use client";

import { displayMessage } from './prompt';

export const downloadSong = (song) => {
  if (!song || !song.downloadUrl || song.downloadUrl.length === 0) {
    displayMessage("No download link available for this song.");
    return;
  }

  // Find the highest quality download link
  const highestQualityLink = song.downloadUrl.reduce((prev, current) => {
    const prevQuality = parseInt(prev.quality);
    const currentQuality = parseInt(current.quality);
    return (currentQuality > prevQuality) ? current : prev;
  }, song.downloadUrl[0]);

  if (highestQualityLink && highestQualityLink.link) {
    const link = document.createElement('a');
    link.href = highestQualityLink.link;
    link.download = `${song.name || song.title}.mp3`; // Use song.name or song.title for filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    displayMessage(`Downloading ${song.name || song.title}...`);
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