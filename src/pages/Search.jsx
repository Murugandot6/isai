import { useSelector } from "react-redux";

import { useParams, useSearchParams } from "react-router-dom";

import { Songs } from "../components/List"; // Only keep Songs for now
import { useEffect } from "react";
import { useSearchSongsQuery } from "../redux/services/saavnApi"; // Use Saavn API

// Simplified categories as Saavn API primarily returns songs
const categories = ['All', 'Song']; 

const Search = () => {
    const { searchTerm } = useParams()

    const [params, setParams] = useSearchParams()

    const { blacklist, favorites } = useSelector(state => state.library)
    // Use a single search endpoint for all categories and filter client-side
    const { data: searchResults, isFetching, error } = useSearchSongsQuery( searchTerm )

    const filteredSongs = searchResults?.data?.results?.filter(item => {
        const categoryParam = params.get('cat');
        if (categoryParam === 'Song' && item.type !== 'song') return false; // Assuming Saavn results have a 'type' field
        return true;
    }) || [];

    useEffect(() => {
        const text = `Isai Search results for - ${searchTerm}`
        document.getElementById('site_title').innerText = text
    }, [searchTerm])

    return (
        <div className="flex flex-col px-2 md:px-4 gap-6">
            <ul className="flex flex-row items-center justify-center lg:justify-start overflow-x-auto overflow-y-clip gap-2 text-gray-300 font-bold">
                {
                    categories.map((category, i) => (
                        <li
                            key={i}
                            className={`rounded-[18px] flex items-center justify-center px-2 md:px-3 h-[28px] min-w-[60px] md:h-[32px] text-xs sm:text-sm hover:text-gray-100 border border-white/10 ${params.get('cat') == category || (!['Song'].includes(params.get('cat')) && category == 'All') ? 'bg-white text-black' : 'bg-white/5 hover:bg-white/10'}`}
                        >
                            <button onClick={() => setParams({ 'cat': category })}>{category}</button>
                        </li>
                    ))
                }
            </ul>
            {/* Display all results as songs, as Saavn API is song-centric */}
            <Songs songs={filteredSongs} isFetching={isFetching} error={error} blacklist={blacklist} favorites={favorites}>
                <span>
                    <span className="text-gray-400 text-sm md:text-base">Results for </span>
                    <span className="text-gray-100 text-sm md:text-base">{searchTerm}</span>
                </span>
            </Songs>
        </div>
    )
};

export default Search;