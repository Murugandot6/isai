import { useState, useEffect, useMemo } from 'react';
import { useSearchStationsQuery, useGetCountriesQuery, useGetLanguagesQuery } from '../redux/services/radioBrowserApi';
import RadioStationCard from '../components/Cards/RadioStationCard';
import { Loader, Error } from '../components/LoadersAndError';
import { getData } from '../utils/fetchData';
import { useSelector } from 'react-redux';

const Radio = () => {
    const [country, setCountry] = useState('');
    const [language, setLanguage] = useState('english');
    const [searchTerm, setSearchTerm] = useState('');
    const [hideBroken, setHideBroken] = useState(true);

    const library = useSelector(state => state.library);

    const { data: stationsData, isFetching: isFetchingStations, error: errorStations } = useSearchStationsQuery({ country, language, name: searchTerm, hidebroken: hideBroken });
    const { data: countriesData, isFetching: isFetchingCountries } = useGetCountriesQuery();
    const { data: languagesData, isFetching: isFetchingLanguages } = useGetLanguagesQuery();

    const stations = useMemo(() => stationsData ? getData({ data: stationsData, type: 'radios', library }) : [], [stationsData, library]);

    useEffect(() => {
        document.getElementById('site_title').innerText = 'Isai - Radio';
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold text-white mb-6">Radio Stations</h1>

            <div className="flex flex-wrap gap-4 mb-8 items-end">
                <div>
                    <label htmlFor="country-filter" className="block text-sm font-medium text-gray-300 mb-1">Country</label>
                    {isFetchingCountries ? <div className="h-10 w-32 bg-white/5 rounded-md loading-animation" /> : (
                        <select 
                            id="country-filter"
                            value={country} 
                            onChange={(e) => setCountry(e.target.value)}
                            className="bg-white/10 text-white rounded-md p-2 h-10"
                        >
                            <option className="bg-black text-white" value="">All Countries</option>
                            {countriesData?.map(c => <option className="bg-black text-white" key={c.iso_3166_1} value={c.iso_3166_1}>{c.name}</option>)}
                        </select>
                    )}
                </div>

                <div>
                    <label htmlFor="language-filter" className="block text-sm font-medium text-gray-300 mb-1">Language</label>
                    {isFetchingLanguages ? <div className="h-10 w-48 bg-white/5 rounded-md loading-animation" /> : (
                        <select 
                            id="language-filter"
                            value={language} 
                            onChange={(e) => setLanguage(e.target.value)}
                            className="bg-white/10 text-white rounded-md p-2 h-10"
                        >
                            {languagesData?.map(l => <option className="bg-black text-white" key={l.name} value={l.name}>{l.name} ({l.stationcount})</option>)}
                        </select>
                    )}
                </div>

                <div>
                    <label htmlFor="search-filter" className="block text-sm font-medium text-gray-300 mb-1">Search Station</label>
                    <input 
                        type="text"
                        id="search-filter"
                        placeholder="Search stations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white/10 text-white rounded-md p-2 h-10 placeholder-gray-400"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <input 
                        type="checkbox"
                        id="hide-broken-filter"
                        checked={hideBroken}
                        onChange={(e) => setHideBroken(e.target.checked)}
                        className="h-4 w-4 rounded text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                    />
                    <label htmlFor="hide-broken-filter" className="text-sm font-medium text-gray-300">
                        Hide offline stations
                    </label>
                </div>
            </div>

            {isFetchingStations ? (
                <Loader title="Loading radio stations..." />
            ) : errorStations ? (
                <Error title="Could not load radio stations. Please try again." />
            ) : stations.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                    {stations.map(station => (
                        <RadioStationCard key={station.id} station={station} />
                    ))}
                </div>
            ) : (
                <Error title="No stations found for the selected filters." />
            )}
        </div>
    );
};

export default Radio;