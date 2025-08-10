import { Link } from "react-router-dom"

import { BsDot } from "react-icons/bs"
import { FavoriteButton } from "../../Buttons"
import { Options } from "../../Options"
import { useMemo } from "react"
import { useSelector } from "react-redux"
import { getSingleData } from "../../../utils/fetchData"

const Track = ({ activeSong, currentSongs, open, duration, appTime, setSeekTime, imgRef, handleLoad }) => {
  const library = useSelector(state => state.library);
  
  const song = useMemo(() => {
    if (!activeSong) return {};
    const normalized = getSingleData(activeSong, 'tracks');
    if (!normalized) return {};
    
    // Manually add flags since getSingleData is pure
    const libraryType = 'tracks';
    normalized.favorite = library.favorites[libraryType]?.some(fav => fav.id === normalized.id);
    normalized.blacklist = library.blacklist[libraryType]?.some(bl => bl.id === normalized.id);
    
    return normalized;
  }, [activeSong, library]);

  const isRadio = useMemo(() => activeSong?.duration === 0, [activeSong]);

  const imageUrl = useMemo(() => {
    if (!song?.image) return '';
    return song.image;
  }, [song]);

  return (
    <>
      <img crossOrigin="anonymous" ref={imgRef} onLoad={handleLoad} src={imageUrl} className="aspect-square rounded-sm shadow-lg shadow-black/20 max-h-[350px] lg:row-span-5" />
      <div className="flex items-center justify-between gap-3 lg:col-span-4 lg:row-span-2">
        <div className="flex-1 flex flex-col justify-center items-start gap-2" onClick={open}>
          <Link to={`/songs/${song?.id}`}>
            <p className="text-white text-lg font-bold">
              {song?.name || song?.title || 'No active Song'}
            </p>
          </Link>
          <div className="flex flex-wrap flex-row items-center text-gray-200 text-sm font-semibold">
            <Link to={`/artists/${song?.artist?.id}`}><p className="truncate">{song?.primaryArtists || song?.artist?.name}</p></Link>
            <BsDot size={20} />
            <Link to={`/albums/${song?.album?.id}`}><p className="truncate">{song?.album?.name}</p></Link>
          </div>
        </div>
        <FavoriteButton data={song} type="tracks" />
        <Options
          type="track"
          small={true}
          song={song}
          artist={song?.artist}
          album={song?.album}
          favorite={song?.favorite}
          blacklist={song?.blacklist}
          i={currentSongs?.findIndex( s => s?.id === song?.id )}
          tracks={currentSongs}
        />
      </div>
      {isRadio ? (
        <div className="flex items-center justify-center col-span-4 text-gray-300 font-semibold">
            <p>Live Stream</p>
        </div>
      ) : (
        <div className="flex flex-col text-gray-200 text-xs font-semi gap-2 col-span-4">
          <input type="range" step="any" value={appTime} min='0' max={duration} className="seek_slider flex-1 shadow shadow-black/40" onInput={e => setSeekTime(e.target.value)} />
          <div className="flex items-center justify-between">
                
            <p>{duration ? `${Math.floor(appTime/60)}:${`0${Math.floor(appTime % 60)}`.slice(-2)}` : '0:00'}</p>
            <p>{`${Math.floor(duration/60)}:${`0${Math.floor(duration % 60)}`.slice(-2)}`}</p>
          </div>
        </div>
      )}
    </>
  )
}

export default Track