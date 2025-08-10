import { useEffect, useMemo, useState } from 'react'

import { useSelector } from "react-redux";
import { Suggestion, Songs, Playlists, RadioStationList, Artists } from "../components/List";
import { getData, getSingleData } from "../utils/fetchData";
import { useSearchSongsQuery } from "../redux/services/saavnApi";
import { useSearchStationsQuery } from "../redux/services/radioBrowserApi";
import { fetchArtistDetailsAndContent } from '../utils/fetchData';
import { ArtistLoading, Error } from '../components/LoadersAndError';
import { ArtistCard } from '../components/Cards';


const Discover = () => {
    const library = useSelector(state => state.library); // Get full library object
    const { playlists: userPlaylists, favorites } = library; // Destructure favorites
    const { selectedLanguage } = useSelector(state => state.settings); // Get selected language

    // Fetch data for Tamil Latest Songs, now dynamic based on selectedLanguage
    const { data: tamilSongsData, isFetching: isFetchingTamilSongs, error: errorFetchingTamilSongs } = useSearchSongsQuery(`${selectedLanguage} latest songs`);
    const tamilLatestSongs = useMemo(() => tamilSongsData ? getData({ data: tamilSongsData.data.results, type: 'tracks', library, selectedLanguage }) : [], [tamilSongsData, library, selectedLanguage]);
    
    // Get favorite songs from Redux state
    const favoriteSongs = useMemo(() => favorites.tracks ? getData({ data: favorites.tracks, type: 'tracks', library, selectedLanguage }).slice(0, 10) : [], [favorites.tracks, library, selectedLanguage]);

    // Fetch data for popular Tamil radio stations, now dynamic based on selectedLanguage
    const { data: popularTamilStationsData, isFetching: isFetchingTamilStations, error: errorFetchingTamilStations } = useSearchStationsQuery({
        language: selectedLanguage, // Use selected language here
        limit: 5,
        hidebroken: true
    });
    const popularTamilStations = useMemo(() => popularTamilStationsData || [], [popularTamilStationsData]);

    // Placeholder for the "Your Favorite Songs" section's image/title
    const favoriteSongsPlaceholder = useMemo(() => ({ 
        id: 'favorite_mix', 
        name: 'Your Favorite Songs', 
        image: [{ link: 'https://i.pinimg.com/originals/ed/54/d2/ed54d2fa700d36d4f2671e1be84651df.jpg' }] // Generic image
    }), []);

    useEffect(() => {   
        document.getElementById('site_title').innerText = 'Isai - Web Player: Rhythm for everyone.'
    }, [])

    return (
        <div className="flex flex-col p-4 gap-10 lg:gap-6">
            {/* Existing sections */}
            {userPlaylists.length > 0 && (
                <div className="mb-8">
                    <h3 className="font-bold text-white text-xl mb-4">Editors' Pick Playlists</h3>
                    <Playlists playlists={userPlaylists.slice(0, 3)} />
                </div>
            )}

            <RadioStationList
                title={`Popular ${selectedLanguage} FM Stations`} {/* Dynamic title */}
                stations={popularTamilStations}
                isFetching={isFetchingTamilStations}
                error={errorFetchingTamilStations}
            />

            <Songs
                isFetching={isFetchingTamilSongs}
                error={errorFetchingTamilSongs}
                songs={tamilLatestSongs}
            >
                {`${selectedLanguage} Latest Songs`} {/* Dynamic title */}
            </Songs>

            {/* Updated section to show favorite songs */}
            <Suggestion
                isFetching={false} // Not fetching from API, so set to false
                error={false} // No API error for local data
                radioTracks={favoriteSongs} // Pass favorite songs for the small cards
                radio={favoriteSongsPlaceholder} // Use the placeholder for image/title
                songs={favoriteSongs} // Pass favorite songs for the main list
                suggestionTitle="Your Favorite Songs" // New title
            />
        </div>
    )
};

export default Discover;