"use client";

import { useState } from 'react';
import { FaPlay, FaPause } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { radioImage as defaultRadioImage } from '../../assets/images';
import { playSongs, pause } from '../../utils/player';
import { getSingleData } from '../../utils/fetchData'; // Import getSingleData

const RadioStationCard = ({ station }) => {
    const { activeSong, isPlaying } = useSelector((state) => state.player);
    const [imageError, setImageError] = useState(false);

    const isCurrentlyPlaying = isPlaying && activeSong?.id === station.stationuuid;

    const handlePlay = () => {
        // Normalize the station data into a 'track' type object suitable for the player
        const normalizedStation = getSingleData(station, 'radios');
        
        if (normalizedStation) {
            // The 'radios' type in getSingleData already sets streamUrl from url_resolved
            playSongs({ tracks: [normalizedStation], song: normalizedStation, i: 0 });
        } else {
            console.error("Failed to normalize radio station data:", station);
            // Optionally, show a toast message to the user
        }
    };

    const handlePause = () => {
        pause();
    };

    const imageUrl = imageError || !station.favicon ? defaultRadioImage : station.favicon;

    return (
        <div className="group relative flex flex-col items-center justify-center p-4 bg-white/5 rounded-lg gap-4 transition-colors hover:bg-white/10">
            <img 
                src={imageUrl} 
                alt={station.name} 
                onError={() => setImageError(true)}
                className="w-32 h-32 rounded-full object-cover shadow-lg flex-shrink-0"
            />
            <div className="text-center w-full overflow-hidden">
                <p className="font-bold text-white truncate">{station.name}</p>
                <p className="text-sm text-gray-400 truncate">{station.country}</p>
            </div>
            <button 
                onClick={isCurrentlyPlaying ? handlePause : handlePlay}
                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
            >
                {isCurrentlyPlaying ? <FaPause size={40} className="text-white" /> : <FaPlay size={40} className="text-white" />}
            </button>
        </div>
    );
};

export default RadioStationCard;