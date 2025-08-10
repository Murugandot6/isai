import { FaGlobe } from "react-icons/fa"
import { useGetLanguagesQuery } from '../../redux/services/radioBrowserApi'; // Import the hook to get languages
import { useDispatch, useSelector } from 'react-redux'; // Import useDispatch and useSelector
import { setLanguage } from '../../redux/features/settingsSlice'; // Import setLanguage action

const Footer = () => {
  const dispatch = useDispatch();
  const { selectedLanguage } = useSelector(state => state.settings); // Get selected language from Redux
  const { data: languagesData, isFetching: isFetchingLanguages, error: errorLanguages } = useGetLanguagesQuery();

  const handleLanguageChange = (e) => {
    dispatch(setLanguage(e.target.value)); // Dispatch action to set language
  };

  return (
    <footer className="px-2 flex flex-1 flex-col justify-end gap-6 items-start">
      <div className="flex items-center gap-2">
        <FaGlobe size={15} className="text-gray-300" />
        {isFetchingLanguages ? (
          <span className="text-gray-300 text-xs font-semibold">Loading languages...</span>
        ) : errorLanguages ? (
          <span className="text-red-400 text-xs font-semibold">Error loading languages</span>
        ) : (
          <select
            value={selectedLanguage}
            onChange={handleLanguageChange}
            className="px-2 border border-white/5 bg-white/5 h-[34px] rounded-[20px] text-gray-300 text-xs font-semibold flex flex-row items-center justify-center gap-2 appearance-none"
          >
            {languagesData?.map(lang => (
              <option key={lang.name} value={lang.name.toLowerCase()} className="bg-black text-white">
                {lang.name}
              </option>
            ))}
          </select>
        )}
      </div>
    </footer>
  )
}

export default Footer