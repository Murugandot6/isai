"use client";

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import LanguageSelector from '../components/LanguageSelector';

const LanguageSettings = () => {
  useEffect(() => {
    document.getElementById('site_title').innerText = 'Isai - Language Settings';
  }, []);

  return (
    <div className="p-4 flex-1 flex flex-col gap-4 min-h-[80vh]">
      <div className="w-full flex items-center gap-3 mb-6">
        <Link to="/" className='mt-[1px] flex justify-center items-center hover:text-gray-100 text-gray-300 text-xs rounded-md'>
          <MdArrowBack size={25} />
        </Link>
        <h3 className="flex-1 text-white font-bold text-xl">Language Settings</h3>
      </div>
      <div className="flex flex-col items-start gap-4">
        <p className="text-gray-300 text-lg">Select your preferred language for trending songs and radio stations:</p>
        <LanguageSelector />
      </div>
    </div>
  );
};

export default LanguageSettings;