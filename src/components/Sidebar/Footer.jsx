import { FaGlobe } from "react-icons/fa"
// Removed import for useGetCountryInfoQuery as it's from the removed DeezerApi

const Footer = () => {
  // Removed useGetCountryInfoQuery hook as it's no longer available
  // const { data, isFetching, error } = useGetCountryInfoQuery()

  return (
    <footer className="px-2 flex flex-1 flex-col justify-end gap-6 items-start">
      <button className="px-2 border border-white/5 bg-white/5 h-[34px] rounded-[20px] text-gray-300 text-xs font-semibold flex flex-row items-center justify-center gap-2">
        <FaGlobe size={15} />
        <span className="mr-1">
          Global {/* Display static text as country info is not available */}
        </span>
      </button>
      {/* Removed the ul containing Deezer, MusixMatch, and Developed by Emmanuel Ezema */}
    </footer>
  )
}

export default Footer