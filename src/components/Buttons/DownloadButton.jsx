"use client";

import React from 'react';
import { Download } from 'lucide-react';
import { displayMessage } from '../../utils/prompt';

const DownloadButton = ({ song, small }) => {
  const handleDownload = () => {
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

  return (
    <button
      onClick={handleDownload}
      className={`flex items-center justify-center ${small ? 'w-10 h-10' : 'w-12 h-12 md:w-14 md:h-14'} rounded-full hover:bg-white/10 bg-white/5 text-white aspect-square drop-shadow-lg`}
    >
      <Download size={small ? 18 : 24} />
    </button>
  );
};

export default DownloadButton;