/* eslint-disable jsx-a11y/media-has-caption */
import React, { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { displayMessage } from '../../utils/prompt';
import { pause } from '../../utils/player';

const Player = ({ activeSong, isPlaying, volume, seekTime, onEnded, onTimeUpdate, onLoadedData }) => {
  const ref = useRef(null);
  const { bitrate } = useSelector(state => state.player);

  // Effect to handle source changes
  useEffect(() => {
    if (!activeSong?.streamUrl) { // Use streamUrl directly
      ref.current.src = '';
      return;
    }
    
    // The streamUrl is already the highest quality link, so use it directly
    const audioSource = activeSong.streamUrl;

    if (ref.current.src !== audioSource) {
      ref.current.src = audioSource || '';
    }
  }, [activeSong, bitrate]); // Keep bitrate in dependencies if it affects other player logic, though not directly used for source here

  // Effect to handle play/pause state changes
  useEffect(() => {
    if (isPlaying && ref.current.src) {
      const playPromise = ref.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // AbortError is common and expected when the user quickly changes songs. We can ignore it.
          if (error.name !== 'AbortError') {
            console.error("Audio play failed:", error);
            displayMessage("Failed to play song.");
            pause();
          }
        });
      }
    } else {
      ref.current.pause();
    }
  }, [isPlaying, activeSong]); // Re-run when isPlaying or the song itself changes

  // Update volume
  useEffect(() => {
    if (ref.current) {
      ref.current.volume = volume;
    }
  }, [volume]);

  // Update seek time
  useEffect(() => {
    if (ref.current && ref.current.duration) { // Only seek if duration is available (not a live stream)
      ref.current.currentTime = seekTime;
    }
  }, [seekTime]);

  return (
    <audio
      ref={ref}
      onEnded={onEnded}
      onTimeUpdate={onTimeUpdate}
      onLoadedData={onLoadedData}
      onError={(e) => {
        console.error("Audio Element Error:", e.target.error);
        displayMessage("This audio source is not supported or is unavailable.");
        pause();
      }}
    />
  );
};

export default Player;