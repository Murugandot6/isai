"use client";

import React from 'react';
import NavLinks from './NavLinks';
import { MdClose } from 'react-icons/md';

const MobileSidebar = ({ isOpen, onClose }) => {
  return (
    <div className={`fixed inset-0 z-[9999999999] flex transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Overlay to close sidebar */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Sidebar content */}
      <div className="relative w-[300px] h-full bg-[#151515bd] border-r border-white/5 shadow-lg shadow-black/30 flex flex-col p-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300"
        >
          <MdClose size={24} />
        </button>
        {/* NavLinks component, adjusted to be always visible within the sidebar */}
        <NavLinks isMobileSidebar={true} />
      </div>
    </div>
  );
};

export default MobileSidebar;