import React, { useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { Error, Loader, Tracks } from '../components/List'; // Import Tracks component
import { DetailsContext } from '../components/Details';
import { useGetAlbumDetailsQuery } from '../redux/services/saavnApi'; // Import the new hook
import { getData, getSingleData } from '../utils/fetchData'; // Import getData and getSingleData

const AlbumDetails = () => {
  const { id: albumId } = useParams();
  const { activeSong, isPlaying } = useSelector((state) => state.player);
  const library = useSelector((state) => state.library);
  const { updateData, colors, ...others } = useContext(DetailsContext);

  const { data: albumDetailsResult, isFetching, error } = useGetAlbumDetailsQuery({ id: albumId });

  const albumData = albumDetailsResult?.data;
  const albumTracks = albumData?.songs || []; // Saavn API returns songs for albums

  useEffect(() => {
    // Reset data when albumId changes
    updateData({ isFetching: true, error: false, data: {}, colors: [] });
  }, [albumId]);

  useEffect(() => {
    if (albumData) {
      // Normalize album data and its tracks
      const normalizedAlbum = getSingleData(albumData, 'albums');
      const normalizedTracks = getData({ type: 'tracks', data: albumTracks, library });

      updateData({
        ...others,
        colors,
        isFetching,
        error,
        data: { ...normalizedAlbum, tracks: normalizedTracks } // Pass normalized tracks
      });
    }
  }, [albumId, albumData, isFetching, error, albumTracks, library]);

  useEffect(() => {
    const text = `Isai - ${isFetching ? 'Loading...' : error ? 'Uh oh! Album data could not be loaded :(' : albumData?.name}`;
    document.getElementById('site_title').innerText = text;
  }, [albumData, isFetching, error]);

  if (isFetching) return <Loader title="Loading album details..." />;
  if (error) return <Error title="Failed to load album details." />;

  return (
    <div className="flex flex-col">
      <Tracks
        tracks={albumTracks} // Pass raw tracks to Tracks component for internal normalization
        activeSong={activeSong}
        isPlaying={isPlaying}
        isFetching={isFetching}
        error={error}
        playlist={albumData} // Pass albumData as playlist prop for consistency
      />
    </div>
  );
};

export default AlbumDetails;