import React, { useMemo, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { DetailsContext } from '../components/Details';
import { Error, Loader, SongBar, Albums } from '../components/List'; 
import { setActiveSong, playPause } from '../redux/features/playerSlice';
import { useGetArtistDetailsQuery } from '../redux/services/saavnApi';

const ArtistDetails = () => {
  const { id: artistId } = useParams();
  const dispatch = useDispatch();
  const { activeSong, isPlaying } = useSelector((state) => state.player);
  const { updateData, colors, ...others } = useContext(DetailsContext);

  // 1. Make the single, correct API call for all artist details.
  const { data: artistDetailsResult, isFetching, error } = useGetArtistDetailsQuery({ id: artistId });
  const artistData = useMemo(() => artistDetailsResult?.data, [artistDetailsResult]);

  // 2. Safely process the API response to create a clean song list.
  const topSongs = React.useMemo(() => {
    const rawSongs = artistData?.topSongs;
    if (!Array.isArray(rawSongs)) return [];

    // Safely get the highest quality URL from an array.
    const getBestUrl = (arr, format = '.jpg') => {
      if (!Array.isArray(arr) || arr.length === 0) return '';
      const link = arr[arr.length - 1]?.link || '';
      return link;
    };
    
    // Map over the songs from the API to create simple, clean objects.
    return rawSongs.map(song => ({
      id: song.id,
      title: song.name,
      subtitle: song.primaryArtists,
      image: getBestUrl(song.image, '.jpg'),
      streamUrl: getBestUrl(song.downloadUrl, '.mp4'), // This creates the crucial URL for the player
      downloadUrl: song.downloadUrl, // Keep for other features
      album: song.album,
      artist: { name: song.primaryArtists },
      primaryArtists: song.primaryArtists,
      name: song.name,
      duration: song.duration,
      explicitContent: song.explicitContent,
    }));
  }, [artistDetailsResult]);

  const albums = React.useMemo(() => {
    const rawAlbums = artistData?.topAlbums;
    if (!Array.isArray(rawAlbums)) return [];
    return rawAlbums;
  }, [artistDetailsResult]);

  useEffect(() => {
    if (artistData) {
      updateData({ 
        ...others, 
        colors, 
        isFetching, 
        error, 
        data: { ...artistData, artist: artistData, tracks: topSongs } 
      });
    }
  }, [artistData, isFetching, error, topSongs]);

  const handlePauseClick = () => {
    dispatch(playPause(false));
  };

  const handlePlayClick = (song, i) => {
    // Dispatch the clean song object. It is guaranteed to have a `streamUrl`.
    dispatch(setActiveSong({ song, tracks: topSongs, i }));
    dispatch(playPause(true));
  };

  if (isFetching) return <Loader title="Loading artist details..." />;
  if (error) return <Error title="Could not load artist details." />;

  return (
    <div className="flex flex-col p-2 md:p-4 gap-8">
      <div className="mb-10">
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
                handlePauseClick={handlePauseClick}
                handlePlayClick={() => handlePlayClick(song, i)}
              />
            ))
          ) : (
            <p className="text-gray-400 mt-2">No top songs found for this artist.</p>
          )}
        </div>
      </div>
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