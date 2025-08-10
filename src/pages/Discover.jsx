import { useEffect, useMemo, useState } from 'react'

import { useSelector } from "react-redux";
import { Suggestion, Songs, Playlists, RadioStationList, Artists } from "../components/List";
import { getData, getSingleData } from "../utils/getData";
import { useSearchSongsQuery } from '../redux/services/saavnApi';
import { useSearchStationsQuery } from '../redux/services/radioBrowserApi';
import { fetchArtistDetailsAndContent } from '../utils/fetchData';
import { ArtistLoading, Error } from '../components/LoadersAndError';
import { ArtistCard } from '../components/Cards'; // Import ArtistCard


const Discover = () => {
    const { playlists: userPlaylists, ...library } = useSelector(state => state.library); 
    
    // Fetch data for Tamil Latest Songs
    const { data: tamilSongsData, isFetching: isFetchingTamilSongs, error: errorFetchingTamilSongs } = useSearchSongsQuery('tamil latest songs');
    const tamilLatestSongs = useMemo(() => tamilSongsData ? getData({ data: tamilSongsData.data.results.slice(0, 6), type: 'tracks' }) : [], [tamilSongsData, library]);
    
    // Fetch data for English Most Played Songs
    const { data: englishSongsData, isFetching: isFetchingEnglishSongs, error: errorFetchingEnglishSongs } = useSearchSongsQuery('trending english songs');
    const englishMostPlayedSongs = useMemo(() => englishSongsData ? getData({ data: englishSongsData.data.results.slice(0, 15), type: 'tracks' }) : [], [englishSongsData, library]);

    // Fetch data for popular Tamil radio stations
    const { data: popularTamilStationsData, isFetching: isFetchingTamilStations, error: errorFetchingTamilStations } = useSearchStationsQuery({
        language: 'tamil',
        limit: 5,
        hidebroken: true
    });
    const popularTamilStations = useMemo(() => popularTamilStationsData || [], [popularTamilStationsData]);

    const englishMostPlayedPlaceholder = useMemo(() => ({ id: 'english_mix', name: 'English Most Played', image: [{ link: 'https://i.pinimg.com/originals/ed/54/d2/ed54d2fa700d36d4f2671e1be84651df.jpg' }] }), []);

    // NEW: State for featured artists
    const [featuredArtists, setFeaturedArtists] = useState([]);
    const [isFetchingFeatured, setIsFetchingFeatured] = useState(true);
    const [errorFetchingFeatured, setErrorFetchingFeatured] = useState(false);

    // List of personalities to fetch songs for
    const personalities = useMemo(() => [
        // Actors
        "Rajinikanth", "Kamal Haasan", "Vijay", "Ajith Kumar", "Suriya", "Dhanush", "Vikram", "Sivakarthikeyan", "Karthi", "Jayam Ravi",
        // Directors
        "Mani Ratnam", "Shankar", "Vetrimaaran", "Lokesh Kanagaraj", "Pa. Ranjith", "A. R. Murugadoss", "Karthik Subbaraj", "Bala", "Mysskin", "Gautham Vasudev Menon",
        // Writers
        "Jeyamohan", "Sujatha Rangarajan", "Kalki Krishnamurthy", "Balakumaran", "Bharathiraja", "K. Balachander", "R. Parthiban", "Crazy Mohan", "Visu", "Nanjil Nadan",
        // Music Directors
        "Ilaiyaraaja", "A. R. Rahman", "Yuvan Shankar Raja", "Harris Jayaraj", "Anirudh Ravichander", "D. Imman", "G. V. Prakash Kumar", "Santhosh Narayanan", "Hiphop Tamizha", "Sean Roldan"
    ], []);

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
                // Limit to a reasonable number of featured artists for the Discover page
                if (results.length >= 10) break; 
            }
            setFeaturedArtists(results);
            setIsFetchingFeatured(false);
            if (results.length === 0 && personalities.length > 0) {
                setErrorFetchingFeatured(true);
            }
        };

        fetchAllFeaturedArtists();
    }, [personalities]);


    useEffect(() => {   
        document.getElementById('site_title').innerText = 'Isai - Web Player: Rhythm for everyone.'
    }, [])

    return (
        <div className="flex flex-col p-4 gap-10 lg:gap-6">
            {/* NEW: Featured Music Personalities Section */}
            <section>
                <h3 className="font-bold text-xl text-gray-200 mb-4">Featured Music Personalities</h3>
                {isFetchingFeatured ? (
                    <ArtistLoading num={5} />
                ) : errorFetchingFeatured ? (
                    <Error title="Could not load featured personalities." />
                ) : featuredArtists.length > 0 ? (
                    <div className='grid grid-cols-2 lg:grid-cols-5 md:grid-cols-3 lg:gap-6 md:gap-4 gap-2'>
                        {featuredArtists.map((artist, i) => (
                            <ArtistCard key={artist.id} artist={artist} i={i} />
                        ))}
                    </div>
                ) : (
                    <Error title="No featured music personalities found." />
                )}
            </section>

            {/* Existing sections */}
            {userPlaylists.length > 0 && (
                <div className="mb-8">
                    <h3 className="font-bold text-white text-xl mb-4">Editors' Pick Playlists</h3>
                    <Playlists playlists={userPlaylists.slice(0, 3)} />
                </div>
            )}

            <RadioStationList
                title="Popular Tamil FM Stations"
                stations={popularTamilStations}
                isFetching={isFetchingTamilStations}
                error={errorFetchingTamilStations}
            />

            <Songs
                isFetching={isFetchingTamilSongs}
                error={errorFetchingTamilSongs}
                songs={tamilLatestSongs}
            >
                Tamil Latest Songs
            </Songs>

            <Suggestion
                isFetching={isFetchingEnglishSongs}
                error={errorFetchingEnglishSongs}
                radioTracks={englishMostPlayedSongs}
                radio={englishMostPlayedPlaceholder}
                songs={englishMostPlayedSongs}
                suggestionTitle="English Most Played"
            />
        </div>
    )
};

export default Discover;