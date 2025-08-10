import React, { useEffect, useMemo } from 'react';
import { ArtistCard } from '../components/Cards';
import { Error, ArtistLoading } from '../components/LoadersAndError';
import { useSearchArtistsQuery } from '../redux/services/saavnApi'; // Import the new hook
import { getSingleData } from '../utils/getData'; // Keep getSingleData for potential normalization if needed

const ArtistsList = () => {
  useEffect(() => {
    document.getElementById('site_title').innerText = 'Isai - Artists';
  }, []);

  // Fetch artists directly by searching for "Tamil artists"
  const { data: artistsData, isFetching, error } = useSearchArtistsQuery('tamil artists');

  const artists = useMemo(() => {
    if (!artistsData?.data?.results) return [];

    const uniqueArtists = new Map();
    artistsData.data.results.forEach(artistObj => {
      // Ensure artistObj has a valid ID and is not already added
      if (artistObj && artistObj.id && typeof artistObj.id === 'string' && artistObj.id !== '') {
        if (!uniqueArtists.has(artistObj.id)) {
          uniqueArtists.set(artistObj.id, {
            id: artistObj.id,
            name: artistObj.name,
            type: artistObj.type || 'Artist', // Default type if not provided
            image: artistObj.image, // Assuming image is directly on artistObj
          });
        }
      }
    });
    return Array.from(uniqueArtists.values());
  }, [artistsData]);

  if (isFetching) {
    return <ArtistLoading num={10} />;
  }

  if (error) {
    return <Error title="Could not load artists." />;
  }

  if (!artists || artists.length === 0) {
    return <Error title="No artists found for 'Tamil artists' query." />;
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-white mb-6">Popular Tamil Artists</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {artists.map((artist, i) => (
          <ArtistCard key={artist.id} artist={artist} i={i} />
        ))}
      </div>
      <p className="text-gray-400 text-sm mt-8">
        Note: Artists are derived from a search for "Tamil artists". Clicking on an artist will display their top songs and albums if available from the API.
      </p>
    </div>
  );
};

export default ArtistsList;