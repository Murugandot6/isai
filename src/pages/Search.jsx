import { useSelector } from "react-redux";
import { useParams, useSearchParams } from "react-router-dom";
import { Songs } from "../components/List";
import { useEffect, useMemo } from "react";
import { useSearchSongsQuery } from "../redux/services/saavnApi";
import { getData } from "../utils/fetchData"; // Corrected import

// Simplified categories as Saavn API primarily returns songs
const categories = ['All', 'Song']; 

const Search = () => {
    const { searchTerm } = useParams()
    const [params, setParams] = useSearchParams()
    const library = useSelector(state => state.library)
    const { data: searchResults, isFetching, error } = useSearchSongsQuery(searchTerm)

    const filteredSongs = useMemo(() => {
        const rawResults = searchResults?.data?.results || [];
        const categoryParam = params.get('cat');
        
        const preFiltered = rawResults.filter(item => {
            if (categoryParam === 'Song' && item.type !== 'song') return false;
            return true;
        });

        return getData({ type: 'tracks', data: preFiltered, library }); // Removed .slice(0, 6)
    }, [searchResults, params, library]);

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
            <Songs songs={filteredSongs} isFetching={isFetching} error={error} blacklist={library.blacklist} favorites={library.favorites}>
                <span>
                    <span className="text-gray-400 text-sm md:text-base">Results for </span>
                    <span className="text-gray-100 text-sm md:text-base">{searchTerm}</span>
                </span>
            </Songs>
        </div>
    )
};

export default Search;