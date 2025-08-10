import { useEffect, useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { Songs, Albums } from '../components/List'; // Import Albums for artist's albums
import { useGetArtistDetailsQuery, useGetArtistAlbumsQuery, useGetArtistSongsQuery } from '../redux/services/saavnApi'; // Use the new hook
import { getSingleData, getData } from '../utils/getData';
import { DetailsContext } from '../components/Details';
import { Loader, Error } from '../components/LoadersAndError'; // Ensure Loader and Error are imported

const ArtistDetails = () => {
  const { blacklist, favorites } = useSelector(state => state.library);
  const { data, updateData, colors, ...others } = useContext(DetailsContext);
  const { id: artistId } = useParams();

  // Call both hooks
  const { data: artistDetails, isFetching: isFetchingArtist, error: errorArtist } = useGetArtistDetailsQuery({ id: artistId });
  const { data: artistSongsResult, isFetching: isFetchingSongs, error: errorSongs } = useGetArtistSongsQuery({ artistId });
  
  // NEW: Fetch albums using the dedicated endpoint
  const { data: artistAlbumsData, isFetching: isFetchingAlbums, error: errorAlbums } = useGetArtistAlbumsQuery({
    id: artistId,
    page: 1,
  });

  // Process the data from the hooks
  const artist = artistDetails?.data;
  
  const albums = useMemo(() => {
    if (!artistAlbumsData?.albums) return []; 
    return getData({ type: 'albums', data: artistAlbumsData.albums });
  }, [artistAlbumsData]);

  const topSongs = useMemo(() => {
    const songsData = artistSongsResult?.data?.results; // Get songs from the new hook
    if (!songsData) return [];
    
    // You can decide if you still need the language filter here.
    return getData({ type: 'tracks', data: songsData, languageFilter: 'tamil' });
  }, [artistSongsResult]); // Depend on the result of the songs query

  useEffect(() => {
    updateData({ isFetching: true, error: false, data: {}, colors: [] });
  }, [artistId]);

  useEffect(() => {
    if (artist) {
      const refinedData = getSingleData({ type: 'artists', data: artist, favorites, blacklist });
      // Pass combined fetching status and errors
      updateData({ 
        ...others, 
        colors, 
        isFetching: isFetchingArtist || isFetchingSongs || isFetchingAlbums, 
        error: errorArtist || errorSongs || errorAlbums, 
        data: { ...refinedData, artist: refinedData } 
      });
    }
  }, [artist, favorites, blacklist, isFetchingArtist, errorArtist, isFetchingSongs, errorSongs, isFetchingAlbums, errorAlbums]);

  useEffect(() => {
    const text = `Isai Artist - ${isFetchingArtist || isFetchingSongs || isFetchingAlbums ? 'Loading...' : errorArtist || errorSongs || errorAlbums ? 'Uh oh! Artist data could not be loaded :(' : artist?.name}`;
    document.getElementById('site_title').innerText = text;
  }, [artist, isFetchingArtist, errorArtist, isFetchingSongs, errorSongs, isFetchingAlbums, errorAlbums]);

  if (isFetchingArtist || isFetchingSongs || isFetchingAlbums) {
    return <Loader title="Loading artist details..." />;
  }

  if (errorArtist || errorSongs || errorAlbums) {
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
          isFetching={isFetchingSongs} // Use songs fetching status for songs
          error={errorSongs} // Use songs error for songs
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