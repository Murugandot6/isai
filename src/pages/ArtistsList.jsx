import React, { useEffect, useMemo } from 'react';
import { ArtistCard } from '../components/Cards';
import { Error, ArtistLoading } from '../components/LoadersAndError';
import { useSearchSongsQuery } from '../redux/services/saavnApi';
import { getSingleData } from '../utils/getData';

const ArtistsList = () => {
  useEffect(() => {
    document.getElementById('site_title').innerText = 'Isai - Artists';
  }, []);

  // Fetch popular Tamil songs to extract artists
  const { data: popularSongsData, isFetching, error } = useSearchSongsQuery('popular tamil songs');

  const artists = useMemo(() => {
    if (!popularSongsData?.data?.results) return [];

    const uniqueArtists = new Map();
    popularSongsData.data.results.forEach(song => {
      // Normalize song to get primaryArtists and image data
      const normalizedSong = getSingleData({ type: 'tracks', data: song });
      
      // Collect all artists from the song object, including primary and featured
      const allArtistsInSong = [];

      // Add primary artists
      if (song.artists?.primary) {
        song.artists.primary.forEach(artistObj => {
          if (artistObj && artistObj.id && typeof artistObj.id === 'string' && artistObj.id !== '') {
            allArtistsInSong.push(artistObj);
          }
        });
      }

      // Add featured artists
      if (song.artists?.featured) {
        song.artists.featured.forEach(artistObj => {
          if (artistObj && artistObj.id && typeof artistObj.id === 'string' && artistObj.id !== '') {
            allArtistsInSong.push(artistObj);
          }
        });
      }

      // Fallback: If no structured artist objects with IDs, use primaryArtists string
      if (allArtistsInSong.length === 0 && normalizedSong.primaryArtists) {
        normalizedSong.primaryArtists.split(',').map(name => name.trim()).forEach(artistName => {
          // Create a simple ID from the artist name if no official ID is available
          const syntheticId = artistName.replace(/[^a-zA-Z0-9]/g, ''); 
          if (syntheticId) {
            allArtistsInSong.push({
              id: syntheticId,
              name: artistName,
              type: 'Artist',
              image: normalizedSong.image, // Fallback to song image
            });
          }
        });
      }

      // Corrected variable name here: allArtistsInSong instead of allArtistsInInSong
      allArtistsInSong.forEach(artistObj => {
        if (!uniqueArtists.has(artistObj.id)) {
          uniqueArtists.set(artistObj.id, {
            id: artistObj.id,
            name: artistObj.name,
            type: artistObj.type || 'Artist', // Default type if not provided
            image: artistObj.image || normalizedSong.image, // Use artist's image or fallback to song image
          });
        }
      });
    });
    return Array.from(uniqueArtists.values());
  }, [popularSongsData]);

  if (isFetching) {
    return <ArtistLoading num={10} />;
  }

  if (error) {
    return <Error title="Could not load artists." />;
  }

  if (!artists || artists.length === 0) {
    return <Error title="No artists found." />;
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-white mb-6">Popular Artists</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {artists.map((artist, i) => (
          <ArtistCard key={artist.id} artist={artist} i={i} />
        ))}
      </div>
      <p className="text-gray-400 text-sm mt-8">
        Note: Artists are derived from popular songs. Clicking on an artist will display their top songs and albums if available from the API.
      </p>
    </div>
  );
};

export default ArtistsList;