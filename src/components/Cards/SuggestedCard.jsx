import React from 'react'
import { playSongs } from '../../utils/player'

const SuggestedCard = ({ song, i, tracks }) => {
    return (
        <div 
            key={i} 
            onClick={() => playSongs({ tracks, i, song })}
            style={{
                background: `center / cover url(${i === 1 ? song?.image?.[2]?.link : song?.image?.[1]?.link})`, // Use Saavn image links
                '--delay': i / 10 + 's'
            }} 
            className={`${(i === 1 || i === 9) && 'col-span-2 row-span-2'} relative rounded-xl overflow-hidden aspect-square`}
        >
            <div className="absolute w-full h-full bg-black/20 hover:bg-black/50"></div>
        </div>
    )
}

export default SuggestedCard