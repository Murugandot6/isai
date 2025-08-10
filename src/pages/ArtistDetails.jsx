import React, { useEffect, useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { Error, Loader, SongBar } from '../components/List';
import { DetailsContext } from '../components/Details';
import { useGetArtistDetailsQuery } from '../redux/services/saavnApi';
import { getSingleData } from '../utils/fetchData';

const ArtistDetails = () => {
  const { id: artistId } = useParams();
  const { activeSong, isPlaying } = useSelector((state) => state.player);
  const { updateData, colors, ...others } = useContext(DetailsContext);
  const library = useSelector(state => state.library);

  const { data: artistDetailsResult, isFetching, error } = useGetArtistDetailsQuery({ id: artistId });

  const artistData = artistDetailsResult?.data;

  const topSongs = useMemo(() => {
    const rawSongs = artistDetailsResult?.data?.topSongs;
    if (!Array.isArray(rawSongs)) {
      return [];
    }

    const getBestUrl = (arr) => {
      if (!Array.isArray(arr) || arr.length === 0) return '';
      return arr[arr.length - 1]?.link || '';
    };

    return rawSongs.map(song => ({
      ...song,
      id: song.id,
      title: song.name,
      subtitle: song.primaryArtists,
      image: getBestUrl(song.image),
      streamUrl: getBestUrl(song.downloadUrl),
    }));
  }, [artistDetailsResult]);

  useEffect(() => {
    if (artistData) {
      const normalizedArtist = getSingleData(artistData, 'artists');
      updateData({
        ...others,
        colors,
        isFetching,
        error,
        data: { ...normalizedArtist, tracks: topSongs }
      });
    }
  }, [artistId, artistData, isFetching, error, topSongs]);

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
            topSongs.map((song, i) => (
              <SongBar
                key={`${song.id}-${i}`}
                song={song}
                i={i}
                tracks={topSongs}
                isPlaying={isPlaying}
                activeSong={activeSong}
              />
            ))
          ) : (
            <p className="text-gray-400 mt-2">No top songs found for this artist.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtistDetails;