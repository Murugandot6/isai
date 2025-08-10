import PlayPause from "../PlayPause"
import { songImage as defaultSongImage } from "../../../assets/images";

const SongImage = ({ song, activeSong, isPlaying, handlePlayClick, handlePauseClick }) => {
  // This logic now correctly handles both raw API data (arrays) and our normalized data (strings).
  const getImageUrl = (songData) => {
    if (!songData || !songData.image) return defaultSongImage;
    // If image is already a simple string, use it.
    if (typeof songData.image === 'string') return songData.image;
    // If image is an array, get the best quality URL.
    if (Array.isArray(songData.image) && songData.image.length > 0) {
      const bestImage = songData.image[songData.image.length - 1];
      // The API sometimes uses 'link' and sometimes 'url'. We check for both.
      return bestImage?.link || bestImage?.url || defaultSongImage;
    }
    return defaultSongImage;
  };

  const imageUrl = getImageUrl(song);

  return (
    <div className="h-[50px] aspect-square relative rounded-[8px] overflow-hidden flex justify-center ml-2 items-center">
      <img className="h-full w-auto block min-h-[50px] min-w-[50px]" src={imageUrl} alt={song.title || song.name} />
      <div className={`play_overlay transition-opacity absolute w-full h-full rounded-[7px] flex items-center justify-center bg-black/50 backdrop-blur-sm ${activeSong?.id === song.id && 'current-song'}`}>
        <PlayPause 
          isPlaying={isPlaying} 
          activeSong={activeSong} 
          isCurrent={activeSong?.id === song.id}
          handlePause={handlePauseClick}
          handlePlay={handlePlayClick} 
          size={24} 
        />
      </div>
    </div>
  )
}

export default SongImage