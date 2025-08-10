import { useEffect, useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { Songs, Albums } from '../components/List';
import { useGetArtistDetailsQuery } from '../redux/services/saavnApi';
import { getSingleData, getData } from '../utils/getData';
import { DetailsContext } from '../components/Details';
import { Loader, Error } from '../components/LoadersAndError';

const ArtistDetails = () => {
  const { blacklist, favorites } = useSelector(state => state.library);
  const { data, updateData, colors, ...others } = useContext(DetailsContext);
  const { id: artistId } = useParams();

  // Use only the main artist details hook
  const { data: artistDetailsResult, isFetching, error } = useGetArtistDetailsQuery({ id: artistId });
  
  // The artist object is nested one level deep
  const artist = artistDetailsResult?.data;

  // Now, get the topSongs directly from the artist object
  const topSongs = useMemo(() => {
    const songsData = artist?.topSongs; 
    if (!songsData) return [];
    return getData({ type: 'tracks', data: songsData });
  }, [artist]);

  // Do the same for albums
  const albums = useMemo(() => {
    const albumsData = artist?.topAlbums;
    if (!albumsData) return [];
    return getData({ type: 'albums', data: albumsData });
  }, [artist]);

  useEffect(() => {
    updateData({ isFetching: true, error: false, data: {}, colors: [] });
  }, [artistId]);

  useEffect(() => {
    if (artist) {
      const refinedData = getSingleData({ type: 'artists', data: artist, favorites, blacklist });
      updateData({ 
        ...others, 
        colors, 
        isFetching, 
        error, 
        data: { ...refinedData, artist: refinedData } 
      });
    }
  }, [artist, favorites, blacklist, isFetching, error]);

  useEffect(() => {
    const text = `Isai Artist - ${isFetching ? 'Loading...' : error ? 'Uh oh! Artist data could not be loaded :(' : artist?.name}`;
    document.getElementById('site_title').innerText = text;
  }, [artist, isFetching, error]);

  if (isFetching) {
    return <Loader title="Loading artist details..." />;
  }

  if (error || !artist) {
    return <Error title="Could not load artist details." />;
  }
  
  return (
    <div className="min-h-[100vh] p-2 md:p-4 flex flex-col gap-8">
      <section>
        <Songs
          full={true}
          bg={colors?.[1]}
          blacklist={blacklist}
          favorites={favorites}
          isFetching={isFetching}
          error={error}
          songs={topSongs}
        >
          Top Songs by {artist?.name}
        </Songs>
      </section>
      <section>
        <Albums
          full={true}
          bg={colors?.[1]}
          blacklist={blacklist}
          favorites={favorites}
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