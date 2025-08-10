import { useEffect, useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { Songs, Albums } from '../components/List'; // Import Albums for artist's albums
import { useGetArtistDetailsQuery, useGetArtistAlbumsQuery } from '../redux/services/saavnApi'; // Use the new hook
import { getSingleData, getData } from '../utils/getData';
import { DetailsContext } from '../components/Details';

const ArtistDetails = () => {
  const { blacklist, favorites } = useSelector(state => state.library);
  const { data, updateData, colors, ...others } = useContext(DetailsContext);
  const { id: artistId } = useParams();

  // Existing query for artist details (might still be useful for general info like follower count)
  const { data: artistDetails, isFetching: isFetchingArtist, error: errorArtist } = useGetArtistDetailsQuery({
    id: artistId,
    songCount: 10, // Still fetch top songs from here if available
    sortBy: 'popularity',
    sortOrder: 'desc'
  });
  const artist = artistDetails?.data; // Saavn API returns data directly under 'data' for artist details

  // NEW: Fetch albums using the dedicated endpoint
  const { data: artistAlbumsData, isFetching: isFetchingAlbums, error: errorAlbums } = useGetArtistAlbumsQuery({
    id: artistId,
    page: 1,
    sortBy: 'popularity',
    sortOrder: 'desc'
  });
  const albums = useMemo(() => {
    if (!artistAlbumsData?.data?.albums) return []; // Adjust path based on actual API response
    return getData({ type: 'albums', data: artistAlbumsData.data.albums });
  }, [artistAlbumsData]);

  const topSongs = useMemo(() => {
    if (!artist?.topSongs) return [];
    return getData({ type: 'tracks', data: artist.topSongs });
  }, [artist]);

  useEffect(() => {
    updateData({ isFetching: true, error: false, data: {}, colors: [] });
  }, [artistId]);

  useEffect(() => {
    if (artist) {
      const refinedData = getSingleData({ type: 'artists', data: artist, favorites, blacklist });
      // Pass combined fetching status and errors
      updateData({ ...others, colors, isFetching: isFetchingArtist || isFetchingAlbums, error: errorArtist || errorAlbums, data: { ...refinedData, artist: refinedData } });
    }
  }, [artist, favorites, blacklist, isFetchingArtist, errorArtist, isFetchingAlbums, errorAlbums]);

  useEffect(() => {
    const text = `Isai Artist - ${isFetchingArtist || isFetchingAlbums ? 'Loading...' : errorArtist || errorAlbums ? 'Uh oh! Artist data could not be loaded :(' : artist?.name}`;
    document.getElementById('site_title').innerText = text;
  }, [artist, isFetchingArtist, errorArtist, isFetchingAlbums, errorAlbums]);

  return (
    <div className="min-h-[100vh] p-2 md:p-4 flex flex-col gap-8">
      <section>
        <Songs
          full={true}
          bg={colors?.[1]}
          blacklist={blacklist}
          favorites={favorites}
          isFetching={isFetchingArtist} // Use artist fetching status for songs
          error={errorArtist} // Use artist error for songs
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
          isFetching={isFetchingAlbums} // Use albums fetching status for albums
          error={errorAlbums} // Use albums error for albums
          albums={albums}
        >
          Albums by {artist?.name}
        </Albums>
      </section>
    </div>
  );
};

export default ArtistDetails;