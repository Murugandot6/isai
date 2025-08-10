import React from 'react';
import { Error, AlbumLoading } from '../LoadersAndError';
import { AlbumCard } from '../Cards';
import { useSelector } from 'react-redux';

const Albums = ({ children, isFetching, error, albums, full, bg }) => {
  const { activeSong, isPlaying } = useSelector(state => state.player);

  if (isFetching) return <AlbumLoading num={full ? 5 : 4} />;
  if (error) return <Error title="Albums could not be loaded." />;
  
  return (
    <div id="albums" className={`mb-8 ${full && 'p-3 rounded-[20px] overflow-clip'} ${bg && 'bg-black'}`}>
      <h3 className="text-white font-bold text-xl mb-4">{children}</h3>
      {albums.length > 0 ? (
        <div className={`grid grid-cols-2 lg:grid-cols-5 md:grid-cols-4 lg:gap-6 md:gap-4 gap-2`}>
          {albums.map((album, i) => (
            <AlbumCard 
              key={album.id} 
              album={album} 
              i={i} 
              activeSong={activeSong} 
              isPlaying={isPlaying} 
            />
          ))}
        </div>
      ) : (
        <Error title="No albums found." />
      )}
    </div>
  );
};

export default Albums;