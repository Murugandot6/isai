import React, { useEffect } from 'react';
import { ArtistCard } from '../components/Cards';
import artistsData from '../data/artists'; // Import the curated artist data
import { Error } from '../components/LoadersAndError';

const ArtistsList = () => {
  useEffect(() => {
    document.getElementById('site_title').innerText = 'Isai - Artists';
  }, []);

  if (!artistsData || artistsData.length === 0) {
    return <Error title="No artists found." />;
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-white mb-6">Featured Artists</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {artistsData.map((artist, i) => (
          <ArtistCard key={artist.id} artist={artist} i={i} />
        ))}
      </div>
      <p className="text-gray-400 text-sm mt-8">
        Note: Due to API limitations, clicking on an artist will display their top songs and albums, not their full discography.
      </p>
    </div>
  );
};

export default ArtistsList;