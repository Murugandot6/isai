import { useEffect, useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { Songs, Albums } from '../components/List'; // Import Albums for artist's albums
import { useGetArtistDetailsByIdQuery } from '../redux/services/saavnApi';
import { getSingleData, getData } from '../utils/getData';
import { DetailsContext } from '../components/Details';

const ArtistDetails = () => {
  const { blacklist, favorites } = useSelector(state => state.library);
  const { data, updateData, colors, ...others } = useContext(DetailsContext);
  const { id: artistId } = useParams();

  const { data: artistDetails, isFetching, error } = useGetArtistDetailsByIdQuery(artistId);
  const artist = artistDetails?.data; // Saavn API returns data directly under 'data' for artist details

  const topSongs = useMemo(() => {
    if (!artist?.topSongs) return [];
    return getData({ type: 'tracks', data: artist.topSongs });
  }, [artist]);

  const albums = useMemo(() => {
    if (!artist?.albums) return [];
    return getData({ type: 'albums', data: artist.albums });
  }, [artist]);

  useEffect(() => {
    updateData({ isFetching: true, error: false, data: {}, colors: [] });
  }, [artistId]);

  useEffect(() => {
    if (artist) {
      const refinedData = getSingleData({ type: 'artists', data: artist, favorites, blacklist });
      updateData({ ...others, colors, isFetching, error, data: { ...refinedData, artist: refinedData } });
    }
  }, [artist, favorites, blacklist, isFetching, error]);

  useEffect(() => {
    const text = `Isai Artist - ${isFetching ? 'Loading...' : error ? 'Uh oh! Artist data could not be loaded :(' : artist?.name}`;
    document.getElementById('site_title').innerText = text;
  }, [artist, isFetching, error]);

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