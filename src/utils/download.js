"use client";

import { displayMessage } from './prompt';
import axios from 'axios';
import JSZip from 'jszip';
import { saveAs } from 'file-saver'; // For saving the generated zip file
import { store } from '../redux/store'; // Import store to dispatch API calls
import { saavnApi } from '../redux/services/saavnApi'; // Import Saavn API service
import { getData } from './fetchData'; // Import getData for song normalization

export const downloadSong = async (song) => { // Made async
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

  if (highestQualityLink && highestQualityLink.url) { // Changed from .link to .url
    try {
      displayMessage(`Preparing to download ${song.name || song.title}...`);
      const response = await axios.get(highestQualityLink.url, { // Changed from .link to .url
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
      displayMessage(`Failed to download ${song.name || song.title}. This might be due to the audio source being unavailable or restricted.`);
    }
  } else {
    displayMessage("No valid download link found.");
  }
};

// New function to download playlist as a single ZIP
export const downloadPlaylistAsZip = async (playlist) => {
  if (!playlist || !playlist.tracks || playlist.tracks.length === 0) {
    displayMessage("This playlist has no songs to download.");
    return;
  }

  displayMessage(`Preparing "${playlist.name}" for ZIP download... This may take a while.`);

  const zip = new JSZip();
  let downloadedCount = 0;
  const totalSongs = playlist.tracks.length;
  const failedSongs = [];

  for (const song of playlist.tracks) {
    try {
      if (!song.downloadUrl || song.downloadUrl.length === 0) {
        failedSongs.push(`${song.name || song.title} (no download URL)`);
        continue;
      }

      const highestQualityLink = song.downloadUrl.reduce((prev, current) => {
        const prevQuality = parseInt(prev.quality);
        const currentQuality = parseInt(current.quality);
        return (currentQuality > prevQuality) ? current : prev;
      }, song.downloadUrl[0]);

      if (highestQualityLink && highestQualityLink.url) {
        const response = await axios.get(highestQualityLink.url, {
          responseType: 'arraybuffer', // Get as arraybuffer for JSZip
        });

        // Sanitize filename to remove invalid characters
        const fileName = `${song.name || song.title}.mp3`.replace(/[\\/:*?"<>|]/g, '_');
        zip.file(fileName, response.data);
        downloadedCount++;
        displayMessage(`Adding ${downloadedCount}/${totalSongs} songs to ZIP...`);
      } else {
        failedSongs.push(`${song.name || song.title} (invalid download URL)`);
      }
    } catch (error) {
      console.error(`Failed to add ${song.name || song.title} to zip:`, error);
      failedSongs.push(`${song.name || song.title} (download failed)`);
    }
  }

  if (downloadedCount === 0 && totalSongs > 0) {
    displayMessage(`Failed to download any songs for "${playlist.name}".`);
    return;
  }

  displayMessage(`Generating ZIP file for "${playlist.name}"...`);

  try {
    const zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: 9 // Max compression
      }
    }, (metadata) => {
      // Optional: update progress during zip generation
      if (metadata.percent % 10 === 0) {
        displayMessage(`Compressing: ${Math.floor(metadata.percent)}%`);
      }
    });

    saveAs(zipBlob, `${playlist.name}.zip`);
    displayMessage(`"${playlist.name}.zip" downloaded successfully!`);

    if (failedSongs.length > 0) {
      displayMessage(`Note: ${failedSongs.length} song(s) failed to download: ${failedSongs.join(', ')}`);
    }
  } catch (error) {
    console.error("Error generating or saving zip:", error);
    displayMessage(`Failed to create ZIP for "${playlist.name}".`);
  }
};

// New function to download album as a single ZIP
export const downloadAlbumAsZip = async (album) => {
  if (!album || !album.id) {
    displayMessage("Invalid album data for download.");
    return;
  }

  displayMessage(`Fetching songs for "${album.name}"...`);

  try {
    // Fetch full album details to get the songs array
    const { data: albumDetailsResult } = await store.dispatch(saavnApi.endpoints.getAlbumDetails.initiate({ id: album.id }));
    const rawAlbumSongs = albumDetailsResult?.data?.songs;

    if (!rawAlbumSongs || rawAlbumSongs.length === 0) {
      displayMessage(`No songs found for album "${album.name}".`);
      return;
    }

    // Normalize the songs to ensure they have the correct downloadUrl structure
    const library = store.getState().library; // Get current library state for normalization
    const { selectedLanguage } = store.getState().settings; // Get selected language for normalization
    const normalizedSongs = getData({ type: 'tracks', data: rawAlbumSongs, library, selectedLanguage });

    // Now use the same logic as downloadPlaylistAsZip
    displayMessage(`Preparing "${album.name}" for ZIP download... This may take a while.`);

    const zip = new JSZip();
    let downloadedCount = 0;
    const totalSongs = normalizedSongs.length;
    const failedSongs = [];

    for (const song of normalizedSongs) {
      try {
        if (!song.downloadUrl || song.downloadUrl.length === 0) {
          failedSongs.push(`${song.name || song.title} (no download URL)`);
          continue;
        }

        const highestQualityLink = song.downloadUrl.reduce((prev, current) => {
          const prevQuality = parseInt(prev.quality);
          const currentQuality = parseInt(current.quality);
          return (currentQuality > prevQuality) ? current : prev;
        }, song.downloadUrl[0]);

        if (highestQualityLink && highestQualityLink.url) {
          const response = await axios.get(highestQualityLink.url, {
            responseType: 'arraybuffer',
          });

          const fileName = `${song.name || song.title}.mp3`.replace(/[\\/:*?"<>|]/g, '_');
          zip.file(fileName, response.data);
          downloadedCount++;
          displayMessage(`Adding ${downloadedCount}/${totalSongs} songs to ZIP...`);
        } else {
          failedSongs.push(`${song.name || song.title} (invalid download URL)`);
        }
      } catch (error) {
        console.error(`Failed to add ${song.name || song.title} to zip:`, error);
        failedSongs.push(`${song.name || song.title} (download failed)`);
      }
    }

    if (downloadedCount === 0 && totalSongs > 0) {
      displayMessage(`Failed to download any songs for "${album.name}".`);
      return;
    }

    displayMessage(`Generating ZIP file for "${album.name}"...`);

    const zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: 9
      }
    }, (metadata) => {
      if (metadata.percent % 10 === 0) {
        displayMessage(`Compressing: ${Math.floor(metadata.percent)}%`);
      }
    });

    saveAs(zipBlob, `${album.name}.zip`);
    displayMessage(`"${album.name}.zip" downloaded successfully!`);

    if (failedSongs.length > 0) {
      displayMessage(`Note: ${failedSongs.length} song(s) failed to download: ${failedSongs.join(', ')}`);
    }

  } catch (error) {
    console.error("Error fetching album details or generating zip:", error);
    displayMessage(`Failed to download album "${album.name}".`);
  }
};

// Keeping the old function for individual downloads, but it won't be called by the "Download all songs" option.
export const downloadPlaylistSongsIndividually = (playlist) => {
  if (!playlist || !playlist.tracks || playlist.tracks.length === 0) {
    displayMessage("This playlist has no songs to download.");
    return;
  }

  displayMessage(`Initiating individual download for ${playlist.tracks.length} song${playlist.tracks.length === 1 ? '' : 's'} from "${playlist.name}"...`);

  playlist.tracks.forEach((song, index) => {
    setTimeout(() => {
      downloadSong(song);
    }, index * 500);
  });
};