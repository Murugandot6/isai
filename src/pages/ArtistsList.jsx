import React, { useEffect, useMemo, useState } from 'react';
import { ArtistCard } from '../components/Cards';
import { Error, ArtistLoading } from '../components/LoadersAndError';
import { fetchArtistDetailsAndContent } from '../utils/fetchData'; // Import the fetch utility

const personalities = [
  // Actors
  "Rajinikanth", "Kamal Haasan", "Vijay", "Ajith Kumar", "Suriya", "Dhanush", "Vikram", "Sivakarthikeyan", "Karthi", "Jayam Ravi",
  // Directors
  "Mani Ratnam", "Shankar", "Vetrimaaran", "Lokesh Kanagaraj", "Pa. Ranjith", "A. R. Murugadoss", "Karthik Subbaraj", "Bala", "Mysskin", "Gautham Vasudev Menon",
  // Writers
  "Jeyamohan", "Sujatha Rangarajan", "Kalki Krishnamurthy", "Balakumaran", "Bharathiraja", "K. Balachander", "R. Parthiban", "Crazy Mohan", "Visu", "Nanjil Nadan",
  // Music Directors
  "Ilaiyaraaja", "A. R. Rahman", "Yuvan Shankar Raja", "Harris Jayaraj", "Anirudh Ravichander", "D. Imman", "G. V. Prakash Kumar", "Santhosh Narayanan", "Hiphop Tamizha", "Sean Roldan"
];

const ArtistsList = () => {
  const [featuredArtists, setFeaturedArtists] = useState([]);
  const [isFetchingFeatured, setIsFetchingFeatured] = useState(true);
  const [errorFetchingFeatured, setErrorFetchingFeatured] = useState(false);

  useEffect(() => {
    document.getElementById('site_title').innerText = 'Isai - Artists';
  }, []);

  useEffect(() => {
    const fetchAllFeaturedArtists = async () => {
      setIsFetchingFeatured(true);
      setErrorFetchingFeatured(false);
      const results = [];
      for (const name of personalities) {
        const artistData = await fetchArtistDetailsAndContent(name);
        if (artistData && artistData.artist) {
          results.push(artistData.artist);
        }
        // Limit to a reasonable number of featured artists for display
        if (results.length >= 20) break; // Increased limit for a dedicated page
      }
      setFeaturedArtists(results);
      setIsFetchingFeatured(false);
      if (results.length === 0 && personalities.length > 0) {
        setErrorFetchingFeatured(true);
      }
    };

    fetchAllFeaturedArtists();
  }, [personalities]);

  if (isFetchingFeatured) {
    return <ArtistLoading num={10} />;
  }

  if (errorFetchingFeatured) {
    return <Error title="Could not load featured personalities. Please try again." />;
  }

  if (!featuredArtists || featuredArtists.length === 0) {
    return <Error title="No featured music personalities found." />;
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-white mb-6">Featured Music Personalities</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {featuredArtists.map((artist, i) => (
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