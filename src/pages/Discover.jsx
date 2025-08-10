import { useState, useEffect, useMemo } from 'react'

import { useSelector } from "react-redux";
import { Suggestion, Songs, Playlists } from "../components/List"; // Import Playlists
import { getData } from "../utils/getData";
import { useSearchSongsQuery } from '../redux/services/saavnApi';
import { editorsPickPlaylists } from '../data/editorsPickPlaylists'; // Import editorsPickPlaylists

const Discover = () => {
    const library = useSelector(state => state.library);

    // Fetch data for Tamil Latest Songs
    const { data: tamilSongsData, isFetching: isFetchingTamilSongs, error: errorFetchingTamilSongs } = useSearchSongsQuery('tamil latest songs');
    const tamilLatestSongs = useMemo(() => tamilSongsData ? getData({ data: tamilSongsData.data.results.slice(0, 6), type: 'tracks' }) : [], [tamilSongsData, library]);
    
    // Fetch data for English Most Played Songs
    const { data: englishSongsData, isFetching: isFetchingEnglishSongs, error: errorFetchingEnglishSongs } = useSearchSongsQuery('trending english songs');
    const englishMostPlayedSongs = useMemo(() => englishSongsData ? getData({ data: englishSongsData.data.results.slice(0, 15), type: 'tracks' }) : [], [englishSongsData, library]);

    // Fetch data for Hindi Latest Songs
    const { data: hindiSongsData, isFetching: isFetchingHindiSongs, error: errorFetchingHindiSongs } = useSearchSongsQuery('hindi latest songs');
    const hindiLatestSongs = useMemo(() => hindiSongsData ? getData({ data: hindiSongsData.data.results.slice(0, 6), type: 'tracks' }) : [], [hindiSongsData, library]);

    const englishMostPlayedPlaceholder = useMemo(() => ({ id: 'english_mix', name: 'English Most Played', image: [{ link: 'https://i.pinimg.com/originals/ed/54/d2/ed54d2fa700d36d4f2671e1be84651df.jpg' }] }), []); // Placeholder for radio image

    useEffect(() => {   
        document.getElementById('site_title').innerText = 'Isai - Web Player: Rhythm for everyone.'
    }, [])

    return (
        <div className="flex flex-col p-4 gap-10 lg:gap-6">
            {/* Editors' Pick Playlists Section */}
            {editorsPickPlaylists.length > 0 && (
                <div className="mb-8">
                    <h3 className="font-bold text-white text-xl mb-4">Editors' Pick Playlists</h3>
                    <Playlists playlists={editorsPickPlaylists.slice(0, 3)} /> {/* Display first 3 editor's pick playlists */}
                </div>
            )}

            <Songs
                isFetching={isFetchingTamilSongs}
                error={errorFetchingTamilSongs}
                songs={tamilLatestSongs}
            >
                Tamil Latest Songs
            </Songs>

            <Songs
                isFetching={isFetchingHindiSongs}
                error={errorFetchingHindiSongs}
                songs={hindiLatestSongs}
            >
                Hindi Latest Songs
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