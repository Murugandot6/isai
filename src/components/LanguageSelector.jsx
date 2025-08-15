"use client";

import React from 'react';
import { useGetLanguagesQuery } from '../redux/services/radioBrowserApi';
import { useDispatch, useSelector } from 'react-redux';
import { setLanguage } from '../redux/features/settingsSlice';
import { FaGlobe } from 'react-icons/fa';

const LanguageSelector = () => {
  const dispatch = useDispatch();
  const { selectedLanguage } = useSelector(state => state.settings);
  const { data: languagesData, isFetching: isFetchingLanguages, error: errorLanguages } = useGetLanguagesQuery();

  const handleLanguageChange = (e) => {
    dispatch(setLanguage(e.target.value));
  };

  // Define the allowed languages
  const allowedLanguages = ['tamil', 'english', 'hindi', 'telugu', 'malayalam'];

  // Filter the fetched languages
  const filteredLanguages = languagesData?.filter(lang =>
    allowedLanguages.includes(lang.name.toLowerCase())
  );

  return (
    <div className="flex items-center gap-2">
      <FaGlobe size={15} className="text-gray-300" />
      {isFetchingLanguages ? (
        <span className="text-gray-300 text-xs font-semibold">Loading languages...</span>
      ) : errorLanguages ? (
        <span className="text-red-400 text-xs font-semibold">Error loading languages</span>
      ) : (
        <div className="relative">
          <select
            value={selectedLanguage}
            onChange={handleLanguageChange}
            className="px-2 border border-white/5 bg-white/5 h-[34px] rounded-[20px] text-gray-300 text-xs font-semibold flex items-center justify-center gap-2 appearance-none w-full max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap"
          >
            <option className="bg-black text-white" value="">All Languages</option>
            {filteredLanguages?.map(lang => (
              <option key={lang.name} value={lang.name.toLowerCase()} className="bg-black text-white">
                {lang.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;