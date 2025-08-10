import React, { useEffect, useMemo } from 'react';
import { ArtistCard } from '../components/Cards';
import { Error, ArtistLoading } from '../components/LoadersAndError';
import { useGetArtistDetailsQuery } from '../redux/services/saavnApi'; // Use the specific artist details hook
import { getSingleData } from '../utils/getData'; // Keep getSingleData for potential normalization if needed

const curatedArtistIds = [
  // Music Directors
  '456211', // Ilaiyaraaja
  '456269', // A. R. Rahman
  '456223', // Harris Jayaraj
  '456225', // Yuvan Shankar Raja
  '456493', // Anirudh Ravichander
  '456249', // G. V. Prakash Kumar

  // Singers
  '456383', // S. P. Balasubrahmanyam
  '456284', // K. J. Yesudas
  '456271', // Hariharan
  '456377', // Shreya Ghoshal
  '456694', // Sid Sriram

  // Actors, Directors & Writers (who have artist IDs)
  '456492', // Dhanush
  '456317', // Kamal Haasan
  '456402', // Vijay
  '456268', // Vairamuthu
  '458117', // Suriya
  '472879', // Bala
  '456485', // Rajinikanth
  '461321', // Shankar
];

const ArtistsList = () => {
  useEffect(() => {
    document.getElementById('site_title').innerText = 'Isai - Artists';
  }, []);

  // Fetch details for each curated artist ID
  // We'll use multiple useGetArtistDetailsQuery calls, conditionally skipping if no ID
  const artistQueries = curatedArtistIds.map(id => 
    // Use a unique key for each query to ensure React handles them correctly
    // The `skip` option prevents the query from running if the ID is invalid or not provided
    useGetArtistDetailsQuery({ id }, { skip: !id })
  );

  const artists = useMemo(() => {
    const fetchedArtists = [];
    let anyFetching = false;
    let anyError = false;

    artistQueries.forEach(queryResult => {
      if (queryResult.isFetching) anyFetching = true;
      if (queryResult.error) anyError = true;

      if (queryResult.data?.data) {
        // Normalize the artist data if necessary, similar to how it's done elsewhere
        const normalizedArtist = getSingleData({ type: 'artists', data: queryResult.data.data });
        if (normalizedArtist) {
          fetchedArtists.push(normalizedArtist);
        }
      }
    });

    // Sort artists alphabetically by name for consistent display
    fetchedArtists.sort((a, b) => a.name.localeCompare(b.name));

    return {
      data: fetchedArtists,
      isFetching: anyFetching,
      error: anyError && fetchedArtists.length === 0, // Only show error if no artists could be fetched
    };
  }, [artistQueries]);

  if (artists.isFetching) {
    return <ArtistLoading num={10} />;
  }

  if (artists.error) {
    return <Error title="Could not load some artists. Please try again." />;
  }

  if (!artists.data || artists.data.length === 0) {
    return <Error title="No artists found for the curated list." />;
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-white mb-6">Curated Tamil Personalities</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {artists.data.map((artist, i) => (
          <ArtistCard key={artist.id} artist={artist} i={i} />
        ))}
      </div>
      <p className="text-gray-400 text-sm mt-8">
        Note: This list displays personalities who have associated music content on JioSaavn. Clicking on an artist will display their top songs and albums if available from the API.
      </p>
    </div>
  );
};

export default ArtistsList;