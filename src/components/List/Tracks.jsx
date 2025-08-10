import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { BiTime } from 'react-icons/bi'

import Track from './Track'
import { Error, TracksLoading } from '../LoadersAndError'

import { getData } from '../../utils/fetchData'

const AllTracks = ({ tracks, activeSong, isPlaying, isFetching, error, songsToBeDeleted, handleTrack, editDataTracks, playlist }) => {
  const library = useSelector(state => state.library);
  const { playlists } = library;
  const [params] = useSearchParams();
  const isEditing = useMemo(() => params.get('edit') === 'true', [params]);

  const allTracks = useMemo(() => {
    const tracksToUse = isEditing ? editDataTracks : tracks;
    return getData({ type: 'tracks', data: tracksToUse, sortType: params.get('sort'), library });
  }, [isEditing, editDataTracks, tracks, library, params]);

  return (
    isFetching ?
      <TracksLoading num={6} /> :
      error ?
        <Error title="Could not fetch album details" /> :
        <div className="m-2 md:m-4 rounded-[20px] bg-black/20 backdrop-blur-md border border-white/5">
          <table className="w-full overflow-x-clip">
            <thead>
              <tr className="px-4 py-4 h-[50px] md:h-[60px]">
                <th className="w-[7%]"></th>
                <th className="w-[66%] text-left text-white/80 font-bold text-xl">Tracks</th>
                <th className="w-[10%] text-white/80"><BiTime size={25} /></th>
                <th className="w-[10%]"></th>
                <th className="w-[7%]"></th>
              </tr>
            </thead>
            {
              allTracks?.map((song, i, songs) => (
                <Track
                  i={i}
                  key={song.id}
                  tracks={songs}
                  song={song}
                  activeSong={activeSong}
                  edit={isEditing}
                  handleTrack={handleTrack}
                  songsToBeDeleted={songsToBeDeleted}
                  isPlaying={isPlaying}
                  playlists={playlists}
                  playlist={playlist}
                />
              ))
            }
          </table>
        </div>
  );
}

export default AllTracks;