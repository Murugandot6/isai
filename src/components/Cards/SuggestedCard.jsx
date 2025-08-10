import React from 'react'
import { playSongs } from '../../utils/player'
import { songImage as defaultSongImage } from '../../assets/images'; // Import default song image

const SuggestedCard = ({ song, i, tracks }) => {
    return (
        <div 
            key={i} 
            onClick={() => playSongs({ tracks, i, song })}
            style={{
                background: `center / cover url(${song.image && song.image !== '' ? song.image : defaultSongImage})`, // Use normalized image URL or default
                '--delay': i / 10 + 's'
            }} 
            className={`${(i === 1 || i === 9) && 'col-span-2 row-span-2'} relative rounded-xl overflow-hidden aspect-square`}
        >
            <div className="absolute w-full h-full bg-black/20 hover:bg-black/50"></div>
        </div>
    )
}

export default SuggestedCard