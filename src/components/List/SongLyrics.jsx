import React, { useMemo } from 'react'
import { LyricLoading, Error } from '../LoadersAndError'

const SongLyrics = ({ lyricsData, isFetching, showBlur, error, nowPlaying = false }) => {

    const lyrics = useMemo(() => {
        if (!lyricsData?.data?.lyrics) return null;
        // Replace <br> with newline characters and split into an array
        return lyricsData.data.lyrics.replace(/<br>/g, '\n').split('\n');
    }, [lyricsData]);

    if(isFetching) return <LyricLoading num={8} />

    if(error || !lyrics) return <Error title={!lyrics && !isFetching ? "Sorry, no lyrics found!" : "Could not load lyrics."} />
        
    return (
        <div className={`mb-8 px-3 ${showBlur ? 'border border-white/5 rounded-[20px] backdrop-blur-lg p-3' : ''}`}>
            {
                !nowPlaying &&
                <h3 className="text-2xl font-bold text-white/80 mb-4">Lyrics</h3>
            }
            {
                lyrics.map( (line, i) => <p key={i} className="text-white text-base font-bold my-1">{line}</p> )
            }

            <p className="text-xs text-gray-500 mt-4">
                Lyrics provided by Saavn
            </p>
        </div>
    )
}

export default SongLyrics