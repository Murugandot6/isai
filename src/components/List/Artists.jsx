import React from 'react';
import { Error, ArtistLoading } from '../LoadersAndError';
import { ArtistCard } from '../Cards';

const Artists = ({ children, isFetching, error, artists }) => {
  if (isFetching) return <ArtistLoading num={5} />;
  if (error) return <Error title="Artists could not be loaded." />;

  return (
    <div id="artists" className="mb-8">
      <h3 className="text-white/80 font-bold text-xl mb-6">{children}</h3>
      {artists.length > 0 ? (
        <div className='grid grid-cols-2 lg:grid-cols-5 md:grid-cols-3 lg:gap-6 md:gap-4 gap-2'>
          {artists.map((artist, i) => (
            <ArtistCard key={artist.id} artist={artist} i={i} />
          ))}
        </div>
      ) : (
        <Error title="No artists found." />
      )}
    </div>
  );
};

export default Artists;