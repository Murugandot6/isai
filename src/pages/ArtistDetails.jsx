import { useEffect, useMemo, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { Songs, Albums } from '../components/List';
import { useGetArtistDetailsQuery } from '../redux/services/saavnApi';
import { getSingleData, getData } from '../utils/getData';
import { DetailsContext } from '../components/Details';
import { Loader, Error } from '../components/LoadersAndError';
import { SongBar } from '../components/Cards';

const ArtistDetails = () => {
  const { data: contextData, updateData, colors, ...others } = useContext(DetailsContext);
  const { id: artistId } = useParams();
  const library = useSelector((state) => state.library);

  const { data: artistDetailsResult, isFetching, error } = useGetArtistDetailsQuery({ id: artistId });
  
  const artistData = useMemo(() => artistDetailsResult?.data, [artistDetailsResult]);

  const topSongs = useMemo(() => {
    const rawSongs = artistData?.topSongs || [];
    return getData({ type: 'tracks', data: rawSongs, library });
  }, [artistData, library]);

  const albums = useMemo(() => {
    const albumsData = artistData?.topAlbums || [];
    return getData({ type: 'albums', data: albumsData, library });
  }, [artistData, library]);

  // This effect updates the shared header
  useEffect(() => {
    if (artistData) {
      const refinedArtist = getSingleData(artistData, 'artists');
      updateData({ 
        ...others, 
        colors, 
        isFetching, 
        error, 
        data: { ...refinedArtist, artist: refinedArtist, tracks: topSongs } 
      });
    }
  }, [artistData, isFetching, error, topSongs]);

  // This effect resets the header on navigation
  useEffect(() => {
    updateData({ isFetching: true, error: false, data: {}, colors: [] });
  }, [artistId]);

  // This effect updates the page title
  useEffect(() => {
    const text = `Isai Artist - ${isFetching ? 'Loading...' : error ? 'Uh oh!' : artistData?.name}`;
    document.getElementById('site_title').innerText = text;
  }, [artistData, isFetching, error]);

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
          albums={albums}
        >
          Albums by {artistData?.name}
        </Albums>
      </section>
    </div>
  );
};

export default ArtistDetails;