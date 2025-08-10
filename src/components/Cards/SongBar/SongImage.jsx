import PlayPause from "../PlayPause"
import { songImage as defaultSongImage } from "../../../assets/images"; // Corrected relative import path

const SongImage = ({ song, activeSong, isPlaying, handlePlayClick, handlePauseClick }) => {
  const imageUrl = song?.image || defaultSongImage; // Use the normalized image URL directly

  return (
    <div className="h-[50px] aspect-square relative rounded-[8px] overflow-hidden flex justify-center ml-2 items-center">
      <img className="h-full w-auto block min-h-[50px] min-w-[50px]" src={imageUrl} alt={song.title} />
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