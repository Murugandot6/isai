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

    // Removed state and effects for featured artists as they are moved to ArtistsList.jsx

    useEffect(() => {   
        document.getElementById('site_title').innerText = 'Isai - Web Player: Rhythm for everyone.'
    }, [])

    return (
        <div className="flex flex-col p-4 gap-10 lg:gap-6">
            {/* Removed Featured Music Personalities Section */}

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