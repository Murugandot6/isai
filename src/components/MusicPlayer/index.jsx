import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { setNowPlaying } from '../../redux/features/playerSlice';

import NowPlaying from './NowPlaying';
import MiniPlayer from './MiniPlayer';

const MusicPlayer = ({ scrolled, forMobile = false, playerProps }) => {
  const { activeSong, currentSongs, currentIndex, isActive, isPlaying, shuffle, repeat, nowPlaying } = useSelector((state) => state.player);
  const dispatch = useDispatch();

  // Destructure playerProps
  const { duration, appTime, setSeekTime, setVolume, volume } = playerProps;

  const open = () => {
    dispatch(setNowPlaying(true));
  }

  function close() {
    dispatch(setNowPlaying(false));
  }

  // Only render the visual player components if there's an active song
  if (!activeSong?.id) return null;

  return (
    <>
      {/* MiniPlayer is conditionally rendered based on screen size and `forMobile` prop */}
      {((!forMobile && window.innerWidth >= 1024) || (forMobile && window.innerWidth < 1024)) && (
        <MiniPlayer
          isPlaying={isPlaying}
          currentSongs={currentSongs}
          activeSong={activeSong}
          isActive={isActive}
          currentIndex={currentIndex}
          seekTime={setSeekTime} // Pass setSeekTime as seekTime prop for MiniPlayer
          nowPlaying={nowPlaying}
          open={open}
          scrolled={scrolled}
          duration={duration}
          appTime={appTime}
        />
      )}
    
      {/* NowPlaying component handles its own visibility based on the `nowPlaying` state */}
      <NowPlaying
        close={close}
        open={open}
        nowPlaying={nowPlaying}
        activeSong={activeSong}
        currentSongs={currentSongs}
        currentIndex={currentIndex}
        isPlaying={isPlaying}
        shuffle={shuffle}
        repeat={repeat}
        duration={duration}
        volume={volume}
        setVolume={setVolume}
        setSeekTime={setSeekTime}
        appTime={appTime}
      />
    </>
  );
};

export default MusicPlayer;