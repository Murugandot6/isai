import { useEffect, useContext } from "react";

import { useParams } from "react-router-dom";

import { useSelector } from "react-redux";

import { Songs, SongLyrics } from "../components/List";

import { useGetSongDetailsByIdQuery, useSearchSongsQuery, useGetLyricsBySongIdQuery } from "../redux/services/saavnApi"; // Use Saavn API
import { getSingleData } from "../utils/fetchData"; // Corrected import
import { DetailsContext } from "../components/Details";


const SongDetails = () => {
    const library = useSelector( state => state.library ) 

    const { data, updateData, colors, ...others } = useContext(DetailsContext)

    const { songid } = useParams()

    const { data: songDetails, isFetching, error } = useGetSongDetailsByIdQuery( songid );
    const song = songDetails?.data?.[0] || songDetails?.data;

    const { data: lyricsData, isFetching: isFetchingLyrics, error: errorFetchingLyrics } = useGetLyricsBySongIdQuery(songid, { skip: !songid });
    
    const { data: relatedSongsData, isFetching: isFetchingRelated, error: errorFetchingRelated } = useSearchSongsQuery( song?.primaryArtists || 'top songs', { skip: !song?.primaryArtists } );
    const relatedSongs = relatedSongsData?.data?.results?.filter(s => s.id !== songid)?.slice(0, 6);

    useEffect(() => { 
        updateData({ isFetching: true, error: false, data: {}, colors: [] })
    }, [songid])
    
    useEffect(() => {
        if (song) {
            let refinedData = getSingleData(song, 'tracks');
            if (refinedData) {
                const libraryType = 'tracks';
                refinedData.favorite = library.favorites[libraryType]?.some(fav => fav.id === refinedData.id);
                refinedData.blacklist = library.blacklist[libraryType]?.some(bl => bl.id === refinedData.id);
            }
            updateData({ ...others, colors, isFetching, error, data: {...refinedData, song: refinedData, tracks: [refinedData]} })
        }
    }, [song, library, isFetching, error])

    useEffect(() => {
        const text = `Isai Song - ${isFetching ? 'Loading...' : error ? 'Uh oh! Song data could not be loaded :(' : song?.name}`
        document.getElementById('site_title').innerText = text
    }, [song, isFetching, error]);

    return (
        <div className="min-h-[100vh] p-2 md:p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <section>
                <SongLyrics showBlur={true} isFetching={isFetchingLyrics} error={errorFetchingLyrics} lyricsData={lyricsData} />
            </section>
            <section>
                <div className="md:sticky md:top-[85px]">
                    <Songs
                        full={true}
                        bg={colors?.length > 0 && colors[1]}
                        bg2={colors?.length > 0 && colors[0]}
                        blacklist={library.blacklist}
                        favorites={library.favorites}
                        isFetching={isFetchingRelated}
                        error={errorFetchingRelated}
                        songData={data}
                        songs={relatedSongs}
                    >
                        Similar Songs
                    </Songs>
                </div>
            </section>
        </div>
    )
};

export default SongDetails;