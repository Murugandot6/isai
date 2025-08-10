import { useEffect, useMemo, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { Songs, Albums } from '../components/List';
import { useGetArtistDetailsQuery } from '../redux/services/saavnApi';
import { getSingleData, getData } from '../utils/getData';
import { DetailsContext } from '../components/Details';
import { Loader, Error } from '../components/LoadersAndError';
import { SongBar } from '../components/Cards';
import { setActiveSong, playPause } from '../redux/features/playerSlice';

const ArtistDetails = () => {
  const { data: contextData, updateData, colors, ...others } = useContext(DetailsContext);
  const { id: artistId } = useParams();
  const dispatch = useDispatch();
  const { activeSong, isPlaying } = useSelector((state) => state.player);
  const library = useSelector((state) => state.library);

  const { data: artistDetailsResult, isFetching, error } = useGetArtistDetailsQuery({ id: artistId });
  
  const artist = useMemo(() => artistDetailsResult?.data, [artistDetailsResult]);

  const topSongs = useMemo(() => {
    const songsData = artist?.topSongs || []; 
    return getData({ type: 'tracks', data: songsData, library });
  }, [artist, library]);

  const albums = useMemo(() => {
    const albumsData = artist?.topAlbums || [];
    return getData({ type: 'albums', data: albumsData, library });
  }, [artist, library]);

  const handlePauseClick = () => {
    dispatch(playPause(false));
  };

  const handlePlayClick = (song, i) => {
    dispatch(setActiveSong({ song, data: topSongs, i }));
    dispatch(playPause(true));
  };

  useEffect(() => {
    updateData({ isFetching: true, error: false, data: {}, colors: [] });
  }, [artistId]);

  useEffect(() => {
    if (artist) {
      const refinedData = getSingleData(artist, 'artists');
      updateData({ 
        ...others, 
        colors, 
        isFetching, 
        error, 
        data: { ...refinedData, artist: refinedData, tracks: topSongs } 
      });
    }
  }, [artist, library, isFetching, error, topSongs]);

  useEffect(() => {
    const text = `Isai Artist - ${isFetching ? 'Loading...' : error ? 'Uh oh! Artist data could not be loaded :(' : artist?.name}`;
    document.getElementById('site_title').innerText = text;
  }, [artist, isFetching, error]);

  if (isFetching && !contextData.name) {
    return <Loader title="Loading artist details..." />;
  }

  if (error && !isFetching) {
    return <Error title="Could not load artist details." />;
  }
  
  return (
    <div className="min-h-[100vh] p-2 md:p-4 flex flex-col gap-8">
      <section>
        <div className="mb-10">
          <h2 className="text-white text-3xl font-bold">Top Songs:</h2>
          <div className="mt-3 flex flex-col gap-1">
            {topSongs.length > 0 ? (
              topSongs.map((song, i) => (
                <SongBar
                  key={song.id}
                  song={song}
                  i={i}
                  tracks={topSongs}
                />
              ))
            ) : (
              <p className="text-gray-400 mt-2">No top songs found for this artist.</p>
            )}
          </div>
        </div>
      </section>
      <section>
        <Albums
          full={true}
          bg={colors?.[1]}
          blacklist={library.blacklist}
          favorites={library.favorites}
          isFetching={isFetching}
          error={error}
          albums={albums}
        >
          Albums by {artist?.name}
        </Albums>
      </section>
    </div>
  );
};

export default ArtistDetails;