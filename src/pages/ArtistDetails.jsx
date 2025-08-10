import React, { useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { Error, Loader, Songs, Albums } from '../components/List'; // Import Albums component
import { DetailsContext } from '../components/Details';
import { useGetArtistDetailsQuery } from '../redux/services/saavnApi';
import { getSingleData, getData } from '../utils/fetchData'; // Import getData

const ArtistDetails = () => {
  const { id: artistId } = useParams();
  const { activeSong, isPlaying } = useSelector((state) => state.player);
  const library = useSelector((state) => state.library); // Get library for getData
  const { updateData, colors, ...others } = useContext(DetailsContext);

  const { data: artistDetailsResult, isFetching, error } = useGetArtistDetailsQuery({ id: artistId });

  const artistData = artistDetailsResult?.data;
  const topSongs = artistData?.topSongs || [];
  const topAlbums = artistData?.topAlbums || []; // Get top albums from API response

  useEffect(() => {
    if (artistData) {
      const normalizedArtist = getSingleData(artistData, 'artists');
      const normalizedTopSongs = getData({ type: 'tracks', data: topSongs, library }); // Normalize top songs
      const normalizedTopAlbums = getData({ type: 'albums', data: topAlbums, library }); // Normalize top albums

      updateData({
        ...others,
        colors,
        isFetching,
        error,
        data: { ...normalizedArtist, tracks: normalizedTopSongs, albums: normalizedTopAlbums } // Pass both to context
      });
    }
  }, [artistId, artistData, isFetching, error, topSongs, topAlbums, library]);

  useEffect(() => {
    const text = `Isai - ${isFetching ? 'Loading...' : error ? 'Error' : artistData?.name}`;
    document.getElementById('site_title').innerText = text;
  }, [artistData, isFetching, error]);

  if (isFetching) return <Loader title="Loading artist details..." />;
  if (error) return <Error title="Failed to load artist details." />;

  return (
    <div className="flex flex-col">
      <div className="mb-10 p-4">
        <h2 className="text-white text-3xl font-bold">Top Songs:</h2>
        <div className="mt-3 flex flex-col gap-1">
          {topSongs.length > 0 ? (
            <Songs
              songs={topSongs} // Pass raw songs to Songs component for internal normalization
              isFetching={isFetching}
              error={error}
              blacklist={library.blacklist}
              favorites={library.favorites}
              full={true}
            />
          ) : (
            <p className="text-gray-400 mt-2">No top songs found for this artist.</p>
          )}
        </div>
      </div>

      <div className="mb-10 p-4">
        <h2 className="text-white text-3xl font-bold">Albums:</h2>
        <div className="mt-3">
          {topAlbums.length > 0 ? (
            <Albums
              albums={topAlbums} // Pass raw albums to Albums component for internal normalization
              isFetching={isFetching}
              error={error}
              full={true}
            />
          ) : (
            <p className="text-gray-400 mt-2">No albums found for this artist.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtistDetails;