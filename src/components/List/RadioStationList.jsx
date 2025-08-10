import React from 'react';
import { RadioStationCard } from '../Cards';
import { Loader, Error } from '../LoadersAndError';

const RadioStationList = ({ title, stations, isFetching, error }) => {
    if (isFetching) return <Loader title="Loading stations..." />;
    if (error) return <Error title="Could not load radio stations." />;

    return (
        <div>
            <h3 className="font-bold text-white text-xl mb-4">{title}</h3>
            {stations.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                    {stations.map(station => (
                        <RadioStationCard key={station.stationuuid} station={station} />
                    ))}
                </div>
            ) : (
                <Error title="No stations found." />
            )}
        </div>
    );
};

export default RadioStationList;